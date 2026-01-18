import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { type AIProvider } from "./lib/ai-clients";
import { runPipeline, type BuildPhase } from "./lib/build-pipeline";
import { engine } from "../client/src/lib/linguistics";
import { isAuthenticated } from "./replit_integrations/auth";
import JSZip from "jszip";

// Persistent rate limiter configuration
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

async function rateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = (req.user as any)?.claims?.sub || req.ip || 'anonymous';
  
  try {
    const result = await storage.checkAndIncrementRateLimit(userId, RATE_LIMIT, RATE_WINDOW);
    
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    
    if (!result.allowed) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait before making more requests." });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit check failed:', error);
    next();
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Start a new build session with AI code generation (protected + rate limited)
  app.post("/api/build", isAuthenticated, rateLimit, async (req, res) => {
    try {
      const { input, provider = 'auto' } = req.body;
      const { selectBestProvider } = await import('./lib/ai-clients');

      if (!input) {
        return res.status(400).json({ error: "Input prompt is required" });
      }

      // 1. Analyze linguistics
      const translation = engine.translate(input);
      
      // 2. Smart provider selection if 'auto'
      let selectedProvider = provider as AIProvider;
      if (provider === 'auto') {
        selectedProvider = selectBestProvider(translation.translatedText || input);
        console.log(`[Build] Auto-selected provider: ${selectedProvider}`);
      }
      
      // 3. Create build session
      const userId = (req.user as any)?.claims?.sub;
      const modelMap: Record<string, string> = {
        'openai': 'gpt-4o',
        'claude': 'claude-sonnet-4-5',
        'gemini': 'gemini-2.5-flash'
      };
      const session = await storage.createBuildSession({
        userId,
        userPrompt: input,
        translatedPrompt: translation.translatedText || input,
        linguisticsData: {
          terms: translation.terms,
          confidence: translation.confidence
        },
        provider: selectedProvider,
        model: modelMap[selectedProvider] || 'gpt-4o',
        status: 'analyzing'
      });

      // Set up SSE for real-time updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      const sendEvent = (event: any) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      };

      // Send linguistics analysis
      sendEvent({
        type: 'linguistics',
        sessionId: session.id,
        terms: translation.terms,
        translatedPrompt: translation.translatedText
      });

      // Log linguistics
      if (translation.terms.length > 0) {
        await storage.createBuildLog({
          sessionId: session.id,
          agent: 'Linguistics Engine',
          message: `Decoded ${translation.terms.length} dialect terms: ${translation.terms.map(t => t.term).join(', ')}`
        });
      }

      // Run multi-stage pipeline
      const phaseAgents: Record<BuildPhase, string> = {
        'analyzing': 'Linguistics Engine',
        'planning': 'Architect',
        'scaffolding': 'Scaffold Engine',
        'generating': 'Code Generator',
        'verifying': 'Quality Checker',
        'complete': 'Build Engine',
        'error': 'Build Engine'
      };

      const result = await runPipeline(
        selectedProvider,
        translation.translatedText || input,
        { terms: translation.terms, confidence: translation.confidence },
        async (phase: BuildPhase) => {
          await storage.updateBuildSessionStatus(session.id, phase);
          sendEvent({ type: 'status', phase, sessionId: session.id });
        },
        async (message: string, phase: BuildPhase) => {
          await storage.createBuildLog({
            sessionId: session.id,
            agent: phaseAgents[phase] || 'Build Engine',
            message
          });
          sendEvent({ type: 'log', message, sessionId: session.id });
        },
        async (file) => {
          const savedFile = await storage.createGeneratedFile({
            sessionId: session.id,
            path: file.path,
            content: file.content,
            language: file.language
          });
          sendEvent({ type: 'file', file: { ...file, dbId: savedFile.id }, sessionId: session.id });
        }
      );

      // Check if build failed
      if (result.phase === 'error') {
        await storage.updateBuildSessionStatus(session.id, 'error');
        await storage.createBuildLog({
          sessionId: session.id,
          agent: 'Build Engine',
          message: `Build failed: ${result.errors[0] || 'Unknown error'}`
        });
        sendEvent({ 
          type: 'error', 
          sessionId: session.id,
          message: result.errors[0] || 'Build failed',
          errors: result.errors
        });
        res.end();
        return;
      }

      // Mark complete
      await storage.updateBuildSessionStatus(session.id, 'complete', new Date());
      await storage.createBuildLog({
        sessionId: session.id,
        agent: 'Build Engine',
        message: `Build complete. Generated ${result.files.length} files.`
      });

      if (result.errors.length > 0) {
        sendEvent({ 
          type: 'warnings', 
          sessionId: session.id,
          warnings: result.errors
        });
      }

      sendEvent({ 
        type: 'complete', 
        sessionId: session.id,
        filesCount: result.files.length,
        plan: result.plan
      });

      res.end();

    } catch (error: any) {
      console.error('Build error:', error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error.message || 'Build failed' });
      }
    }
  });

  // Get build session details
  app.get("/api/build/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getBuildSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Build session not found" });
      }

      const files = await storage.getFilesBySession(sessionId);
      const logs = await storage.getLogsBySession(sessionId);

      res.json({ session, files, logs });
    } catch (error: any) {
      console.error('Error fetching build:', error);
      res.status(500).json({ error: 'Failed to fetch build session' });
    }
  });

  // Get build logs (for terminal streaming)
  app.get("/api/build/:id/logs", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const logs = await storage.getLogsBySession(sessionId);
      res.json({ logs });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  // Get generated files
  app.get("/api/build/:id/files", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const files = await storage.getFilesBySession(sessionId);
      res.json({ files });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // Get user's recent builds (protected)
  app.get("/api/builds", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }
      const sessions = await storage.getRecentBuildSessions(userId, 10);
      res.json({ sessions });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch builds' });
    }
  });

  // Get user's build analytics (protected)
  app.get("/api/analytics", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }
      const stats = await storage.getUserBuildStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Version control endpoints
  
  // Helper to verify file ownership
  const verifyFileOwnership = async (fileId: number, userId: string): Promise<boolean> => {
    const owner = await storage.getFileOwner(fileId);
    return owner === userId;
  };
  
  // Get version history for a file
  app.get("/api/file/:id/versions", isAuthenticated, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      if (!userId || !(await verifyFileOwnership(fileId, userId))) {
        return res.status(404).json({ error: 'File not found' });
      }
      const versions = await storage.getFileVersions(fileId);
      res.json({ versions });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch versions' });
    }
  });

  // Get specific version of a file
  app.get("/api/file/:id/version/:version", isAuthenticated, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      if (!userId || !(await verifyFileOwnership(fileId, userId))) {
        return res.status(404).json({ error: 'File not found' });
      }
      const version = parseInt(req.params.version);
      const fileVersion = await storage.getFileVersion(fileId, version);
      if (!fileVersion) {
        return res.status(404).json({ error: 'Version not found' });
      }
      res.json({ version: fileVersion });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch version' });
    }
  });

  // Update file content (creates version history)
  app.put("/api/file/:id", isAuthenticated, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      if (!userId || !(await verifyFileOwnership(fileId, userId))) {
        return res.status(404).json({ error: 'File not found' });
      }
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }
      const updated = await storage.updateFileContent(fileId, content);
      res.json({ file: updated });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update file' });
    }
  });

  // Revert file to specific version
  app.post("/api/file/:id/revert/:version", isAuthenticated, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      if (!userId || !(await verifyFileOwnership(fileId, userId))) {
        return res.status(404).json({ error: 'File not found' });
      }
      const version = parseInt(req.params.version);
      const fileVersion = await storage.getFileVersion(fileId, version);
      if (!fileVersion) {
        return res.status(404).json({ error: 'Version not found' });
      }
      const updated = await storage.updateFileContent(fileId, fileVersion.content);
      res.json({ file: updated, revertedTo: version });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to revert file' });
    }
  });

  // Download project as ZIP
  app.get("/api/build/:id/download", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      const format = req.query.format as string | undefined;
      
      const session = await storage.getBuildSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: 'Build not found' });
      }
      
      const files = await storage.getFilesBySession(sessionId);
      if (files.length === 0) {
        return res.status(404).json({ error: 'No files to download' });
      }
      
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.path.replace(/^\//, ''), file.content);
      }
      
      if (format === 'github') {
        const readme = `# ${session.userPrompt.slice(0, 50)}...

Generated by **Vibenicity** - AI Code Generator

## About
This project was created using natural language and AI. The original prompt was:

> ${session.userPrompt}

## Files
${files.map(f => `- \`${f.path}\``).join('\n')}

## Getting Started
1. Install dependencies: \`npm install\`
2. Start the development server: \`npm run dev\`

## Generated On
${new Date(session.createdAt).toLocaleDateString()}

---
*Powered by Vibenicity Engine*
`;
        
        const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;
        
        zip.file('README.md', readme);
        zip.file('.gitignore', gitignore);
      }
      
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      const filename = format === 'github' ? `vibe-project-${sessionId}-github.zip` : `vibe-project-${sessionId}.zip`;
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(zipBuffer);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate download' });
    }
  });

  return httpServer;
}
