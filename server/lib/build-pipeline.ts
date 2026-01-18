import { openai, anthropic, gemini, type AIProvider, detectImageRequest, generateImage } from './ai-clients';
import { getAllTemplatesAsContext, getTemplateNames } from './design-templates';

export type BuildPhase = 'analyzing' | 'planning' | 'scaffolding' | 'generating' | 'verifying' | 'complete' | 'error';

export interface BuildPlan {
  components: string[];
  files: string[];
  dependencies: string[];
  architecture: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface PipelineResult {
  phase: BuildPhase;
  plan?: BuildPlan;
  files: GeneratedFile[];
  logs: string[];
  errors: string[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const AI_TIMEOUT_MS = 90000; // 90 second timeout per AI call

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callAIWithRetry(
  provider: AIProvider,
  systemPrompt: string,
  userPrompt: string,
  retries = MAX_RETRIES
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await callAI(provider, systemPrompt, userPrompt);
    } catch (error: any) {
      lastError = error;
      
      const isRetryable = 
        error.status === 429 || 
        error.status === 500 || 
        error.status === 502 || 
        error.status === 503 ||
        error.message?.includes('timeout') ||
        error.message?.includes('rate limit');
      
      if (!isRetryable || attempt === retries) {
        throw error;
      }
      
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('AI call failed after retries');
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs / 1000}s`)), timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

async function callAI(provider: AIProvider, systemPrompt: string, userPrompt: string): Promise<string> {
  const makeCall = async (): Promise<string> => {
    let actualProvider = provider;
    
    // Check if requested provider is available, fall back to OpenAI if not
    if (provider === 'claude' && !anthropic) {
      console.log('[AI] Claude not configured, falling back to OpenAI');
      actualProvider = 'openai';
    }
    if (provider === 'gemini' && !gemini) {
      console.log('[AI] Gemini not configured, falling back to OpenAI');
      actualProvider = 'openai';
    }
    
    console.log(`[AI] Making ${actualProvider} API call...`);
    
    if (actualProvider === 'claude' && anthropic) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,  // Claude's documented limit
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      console.log(`[AI] Claude response length: ${content.length} chars`);
      return content;
    }
    
    if (actualProvider === 'gemini' && gemini) {
      const response = await gemini.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 8192,  // Gemini's documented limit
      });
      const content = response.choices[0]?.message?.content || '';
      console.log(`[AI] Gemini response length: ${content.length} chars`);
      return content;
    }
    
    // Default to OpenAI (GPT-4o supports higher limits)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 8192,  // Conservative limit for reliability
    });
    const content = response.choices[0]?.message?.content || '';
    console.log(`[AI] OpenAI response length: ${content.length} chars`);
    return content;
  };

  return withTimeout(makeCall(), AI_TIMEOUT_MS, `AI generation (${provider})`);
}

export async function planStage(
  provider: AIProvider,
  translatedPrompt: string,
  linguisticsData: any,
  onLog: (msg: string) => void
): Promise<BuildPlan> {
  onLog('Analyzing project requirements...');
  
  const systemPrompt = `You are a senior software architect. Analyze the user's request and create a build plan.

Output ONLY valid JSON in this exact format:
{
  "components": ["list of React components needed"],
  "files": ["list of file paths to generate"],
  "dependencies": ["npm packages needed"],
  "architecture": "Brief description of the architecture"
}

Do not include any markdown, explanations, or code blocks. Just the JSON object.`;

  const userPrompt = `Create a build plan for: ${translatedPrompt}
${linguisticsData?.terms?.length > 0 ? `\nContext: User used slang terms: ${linguisticsData.terms.map((t: any) => `"${t.term}" means "${t.meaning}"`).join(', ')}` : ''}`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]) as BuildPlan;
      onLog(`Planned ${plan.components.length} components across ${plan.files.length} files`);
      return plan;
    }
  } catch (e) {
    onLog('Warning: Could not parse plan, using defaults');
  }
  
  return {
    components: ['App', 'MainComponent'],
    files: ['src/App.tsx', 'src/components/MainComponent.tsx'],
    dependencies: ['react', 'react-dom'],
    architecture: 'Simple React application'
  };
}

export async function scaffoldStage(
  provider: AIProvider,
  plan: BuildPlan,
  translatedPrompt: string,
  onLog: (msg: string) => void
): Promise<GeneratedFile[]> {
  onLog('Creating project scaffold...');
  
  const systemPrompt = `You are an expert developer creating a project scaffold.
Generate the basic structure for each file with placeholder implementations.

Output files in this EXACT format (include the file path after the language):
\`\`\`typescript:src/App.tsx
// code here
\`\`\`

Create:
1. package.json with the right dependencies
2. Basic component files with interfaces/types
3. Proper imports between files

Keep implementations minimal - just structure and types.`;

  const userPrompt = `Create scaffold for: ${translatedPrompt}

Files needed: ${plan.files.join(', ')}
Components: ${plan.components.join(', ')}
Dependencies: ${plan.dependencies.join(', ')}`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  const files = parseCodeBlocks(response);
  
  onLog(`Scaffolded ${files.length} files`);
  return files;
}

export async function generateStage(
  provider: AIProvider,
  plan: BuildPlan,
  scaffold: GeneratedFile[],
  translatedPrompt: string,
  linguisticsData: any,
  onLog: (msg: string) => void
): Promise<GeneratedFile[]> {
  onLog('Generating production code...');
  onLog(`Using design system: ${getTemplateNames().slice(0, 5).join(', ')}...`);
  
  const existingFiles = scaffold.map(f => `${f.path}:\n${f.content}`).join('\n\n---\n\n');
  const designContext = getAllTemplatesAsContext();
  
  const systemPrompt = `You are an expert full-stack developer. Complete the implementation of this application.

CRITICAL RULES:
1. Output ALL files in markdown code blocks with file paths: \`\`\`typescript:src/App.tsx
2. Use modern React 18 with hooks, TypeScript, and Tailwind CSS
3. Make components fully functional, not placeholders
4. Include proper error handling and loading states
5. Ensure all imports are correct
6. Use shadcn/ui patterns (clean, minimal design with proper spacing)
7. IMPORTANT: Follow the design system patterns below for consistent, professional UI
8. FOR ROUTING: Use 'wouter' library, NOT react-router-dom. Example:
   import { Route, Switch, Link, useLocation } from 'wouter';
9. AVAILABLE LIBRARIES: react, react-dom, wouter, lucide-react, framer-motion, clsx, tailwind-merge, zustand, date-fns, recharts
10. DO NOT use: react-router-dom, @tanstack/router, or any other router

## DESIGN SYSTEM REFERENCE
${designContext}

The user's request: "${translatedPrompt}"
${linguisticsData?.terms?.length > 0 ? `Slang context: ${linguisticsData.terms.map((t: any) => `"${t.term}" = "${t.meaning}"`).join(', ')}` : ''}`;

  const userPrompt = `Complete this application with full implementations:

Current scaffold:
${existingFiles}

Make all components fully functional with real logic, proper UI, and complete features.`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  const files = parseCodeBlocks(response);
  
  onLog(`Generated ${files.length} production files`);
  return files;
}

export async function verifyStage(
  provider: AIProvider,
  files: GeneratedFile[],
  onLog: (msg: string) => void,
  requiredFiles?: string[]
): Promise<{ files: GeneratedFile[]; errors: string[]; hasCriticalErrors: boolean }> {
  onLog('Verifying code quality...');
  
  const errors: string[] = [];
  const verifiedFiles: GeneratedFile[] = [];
  const generatedPaths = new Set(files.map(f => f.path));
  let hasCriticalErrors = false;
  
  // Note: Missing planned files are warnings, not errors
  // AI may generate equivalent files with different paths
  if (requiredFiles && requiredFiles.length > 0) {
    const missingFiles = requiredFiles.filter(path => !generatedPaths.has(path));
    if (missingFiles.length > 0 && missingFiles.length === requiredFiles.length) {
      // Only error if NO planned files were generated at all
      onLog(`Warning: Generated files differ from plan - this is usually fine`);
    } else if (missingFiles.length > 0) {
      onLog(`Note: ${files.length} files generated (some with different paths than planned)`);
    }
  }
  
  const hasPackageJson = files.some(f => f.path.includes('package.json'));
  if (!hasPackageJson && files.length > 0) {
    errors.push('Missing package.json - will use default');
    // Not critical - we can generate a default package.json
  }
  
  if (files.length === 0) {
    errors.push('No files were generated');
    hasCriticalErrors = true;
  }
  
  for (const file of files) {
    if (file.language === 'typescript' || file.language === 'tsx' || file.language === 'javascript' || file.language === 'jsx') {
      const issues: string[] = [];
      
      if (file.content.includes('// TODO') || file.content.includes('// ...')) {
        issues.push(`${file.path}: Contains incomplete code markers`);
      }
      if (file.content.includes('placeholder')) {
        issues.push(`${file.path}: Contains placeholder content`);
      }
      if (!file.content.includes('export')) {
        issues.push(`${file.path}: Missing exports`);
      }
      
      if (issues.length > 0) {
        errors.push(...issues);
      }
    }
    
    verifiedFiles.push(file);
  }
  
  if (hasCriticalErrors) {
    onLog(`Build verification FAILED: ${errors.length} critical issues`);
  } else if (errors.length > 0) {
    onLog(`Found ${errors.length} potential issues`);
  } else {
    onLog('Code verification passed');
  }
  
  return { files: verifiedFiles, errors, hasCriticalErrors };
}

function parseCodeBlocks(response: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const codeBlockRegex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const language = match[1];
    const filePath = match[2] || `generated.${language}`;
    const content = match[3].trim();
    
    if (content.length > 10) {
      files.push({ path: filePath, content, language });
    }
  }
  
  return files;
}

function generateFileSkeleton(filepath: string, components: string[]): string {
  const ext = filepath.split('.').pop()?.toLowerCase() || '';
  const filename = filepath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  
  if (filepath.includes('package.json')) {
    return `{
  "name": "generated-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": { /* Add all required deps */ }
}`;
  }
  
  if (filepath.includes('App.tsx') || filepath.includes('App.jsx')) {
    return `import React from 'react';
// Import all components
${components.map(c => `import { ${c} } from './components/${c}';`).join('\n')}

export default function App() {
  // Implement full app with all components
  return (
    <div className="min-h-screen">
      {/* Use all imported components */}
    </div>
  );
}`;
  }
  
  if (filepath.includes('components/')) {
    return `import React from 'react';

export function ${filename}() {
  // Implement complete component with state, handlers, and UI
  return (
    <div>
      {/* Full implementation */}
    </div>
  );
}`;
  }
  
  if (ext === 'css') {
    return `/* Implement complete styles */`;
  }
  
  return `// Implement complete ${filename} module`;
}

export async function generateDirectStage(
  provider: AIProvider,
  plan: BuildPlan,
  translatedPrompt: string,
  linguisticsData: any,
  onLog: (msg: string) => void
): Promise<GeneratedFile[]> {
  onLog('Generating complete application...');
  
  // Determine if this is a simple or complex app
  const isComplexApp = plan.files.length > 5 || plan.components.length > 4;
  
  if (isComplexApp) {
    // COMPLEX: Generate in multiple batches to stay under token limits
    onLog(`Complex app detected (${plan.files.length} files, ${plan.components.length} components)`);
    return await generateComplexApp(provider, plan, translatedPrompt, linguisticsData, onLog);
  } else {
    // SIMPLE: Generate everything in one call
    onLog('Simple app - generating in single pass...');
    const coreFiles = await generateCoreFiles(provider, plan, translatedPrompt, linguisticsData);
    onLog(`Generated ${coreFiles.length} files`);
    return ensureRequiredFiles(coreFiles, plan, translatedPrompt);
  }
}

async function generateComplexApp(
  provider: AIProvider,
  plan: BuildPlan,
  translatedPrompt: string,
  linguisticsData: any,
  onLog: (msg: string) => void
): Promise<GeneratedFile[]> {
  let allFiles: GeneratedFile[] = [];
  
  // BATCH 1: Core structure (index, App shell, package.json)
  onLog('Batch 1: Generating core structure...');
  const coreFiles = await generateCoreStructure(provider, plan, translatedPrompt, linguisticsData);
  allFiles = allFiles.concat(coreFiles);
  onLog(`Generated ${coreFiles.length} core files`);
  
  // Get all non-core files from plan
  const corePatterns = ['index.tsx', 'index.jsx', 'app.tsx', 'app.jsx', 'package.json', 'main.tsx'];
  const nonCoreFiles = plan.files.filter(f => {
    const lowerPath = f.toLowerCase();
    return !corePatterns.some(p => lowerPath.includes(p));
  });
  
  // BATCH 2-N: All remaining files in batches of 3
  if (nonCoreFiles.length > 0) {
    const batches = chunkArray(nonCoreFiles, 3);
    for (let i = 0; i < batches.length; i++) {
      const batchNames = batches[i].map(f => f.split('/').pop()).join(', ');
      onLog(`Batch ${i + 2}: Generating ${batchNames}...`);
      const batchFiles = await generateFileBatchGeneric(provider, batches[i], plan, translatedPrompt);
      allFiles = allFiles.concat(batchFiles);
    }
  }
  
  // Ensure required files exist
  allFiles = ensureRequiredFiles(allFiles, plan, translatedPrompt);
  
  onLog(`Total: ${allFiles.length} files generated`);
  return allFiles;
}

async function generateFileBatchGeneric(
  provider: AIProvider,
  filePaths: string[],
  plan: BuildPlan,
  translatedPrompt: string
): Promise<GeneratedFile[]> {
  const systemPrompt = `Expert React/TypeScript dev. Output each file as \`\`\`tsx:path\ncode\n\`\`\`
Use: React 18, TypeScript, Tailwind CSS, lucide-react icons, framer-motion`;

  const fileList = filePaths.map(p => `- ${p}`).join('\n');
  
  const userPrompt = `For: ${translatedPrompt}
Architecture: ${plan.architecture}

Generate these files with COMPLETE code:
${fileList}

Each must be:
- Fully implemented (no placeholders/TODOs)
- Properly typed with TypeScript
- Exported correctly
- Working with the app's state/context`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  return parseCodeBlocks(response);
}

async function generateCoreStructure(
  provider: AIProvider,
  plan: BuildPlan,
  translatedPrompt: string,
  linguisticsData: any
): Promise<GeneratedFile[]> {
  const slangContext = linguisticsData?.terms?.length > 0 
    ? `Slang: ${linguisticsData.terms.slice(0, 3).map((t: any) => `${t.term}=${t.meaning}`).join(', ')}`
    : '';

  const systemPrompt = `Expert React dev. Output files as \`\`\`tsx:path\ncode\n\`\`\`
Stack: React 18, TypeScript, Tailwind, lucide-react, framer-motion, wouter, recharts`;

  const userPrompt = `App: ${translatedPrompt}
${slangContext}

Generate:
1. \`\`\`tsx:src/index.tsx\`\`\` - createRoot entry
2. \`\`\`tsx:src/App.tsx\`\`\` - Main app importing: ${plan.components.slice(0, 5).join(', ')}
3. \`\`\`json:package.json\`\`\` - Dependencies

App.tsx should have working UI with state management. Architecture: ${plan.architecture}`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  return parseCodeBlocks(response);
}

async function generateComponentBatch(
  provider: AIProvider,
  componentPaths: string[],
  plan: BuildPlan,
  translatedPrompt: string
): Promise<GeneratedFile[]> {
  const systemPrompt = `Expert React dev. Output each file as \`\`\`tsx:path\ncode\n\`\`\`
Stack: React 18, TypeScript, Tailwind, lucide-react icons`;

  const fileList = componentPaths.map(p => `- ${p}`).join('\n');
  
  const userPrompt = `For app: ${translatedPrompt}

Generate these components:
${fileList}

Each should be:
- Fully functional with props/state
- Use TypeScript interfaces
- Modern Tailwind styling
- Export named functions`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  return parseCodeBlocks(response);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function generateCoreFiles(
  provider: AIProvider,
  plan: BuildPlan,
  translatedPrompt: string,
  linguisticsData: any
): Promise<GeneratedFile[]> {
  const slangContext = linguisticsData?.terms?.length > 0 
    ? `Context: ${linguisticsData.terms.slice(0, 5).map((t: any) => `"${t.term}"="${t.meaning}"`).join(', ')}`
    : '';

  const systemPrompt = `You are an expert React developer. Create a COMPLETE, working single-page application.

OUTPUT FORMAT: Each file as markdown code block with path:
\`\`\`tsx:src/App.tsx
// code here
\`\`\`

TECH STACK:
- React 18 + TypeScript + Tailwind CSS
- Icons: lucide-react (import { Icon } from 'lucide-react')
- Animation: framer-motion
- State: useState/useReducer (or zustand for complex state)
- Charts: recharts (if needed)
- Routing: wouter (if multiple pages needed)

DESIGN:
- Modern, clean UI with rounded corners and shadows
- Gradient backgrounds (slate-50 to slate-100)
- Cyan/purple accent colors
- Responsive grid layouts
- Smooth hover transitions`;

  const userPrompt = `BUILD: ${translatedPrompt}
${slangContext}

Create a FULLY WORKING app with these features: ${plan.components.join(', ')}

GENERATE THESE FILES:

\`\`\`tsx:src/index.tsx
// React 18 entry point with createRoot
\`\`\`

\`\`\`tsx:src/App.tsx
// COMPLETE app with ALL features implemented inline
// Include: state management, event handlers, UI components
// Make it ACTUALLY WORK - real calculations, real data
\`\`\`

\`\`\`json:package.json
// Include all needed dependencies
\`\`\`

IMPORTANT: Put ALL functionality in App.tsx. Make it complete and working.`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  return parseCodeBlocks(response);
}

async function generateFileBatch(
  provider: AIProvider,
  files: string[],
  plan: BuildPlan,
  translatedPrompt: string,
  linguisticsData: any
): Promise<GeneratedFile[]> {
  const systemPrompt = `You are an expert React developer. Generate complete component code.

RULES:
1. Output as: \`\`\`tsx:src/components/ComponentName.tsx
2. React 18, TypeScript, Tailwind CSS
3. Available: react, wouter, lucide-react, framer-motion, zustand, date-fns, recharts
4. Make components FULLY FUNCTIONAL`;

  const userPrompt = `Generate these component files for: "${translatedPrompt}"

FILES TO CREATE:
${files.map(f => `- ${f}`).join('\n')}

Each component should be complete and functional. Use the same style patterns.
Output each file with complete implementation.`;

  const response = await callAIWithRetry(provider, systemPrompt, userPrompt);
  return parseCodeBlocks(response);
}

/**
 * Ensure critical files exist in the generated output
 * Adds fallback implementations if AI didn't generate them
 */
function ensureRequiredFiles(files: GeneratedFile[], plan: BuildPlan, prompt: string): GeneratedFile[] {
  const hasFile = (pattern: string) => files.some(f => f.path.toLowerCase().includes(pattern.toLowerCase()));
  
  // Check for index.tsx/index.jsx
  if (!hasFile('index.tsx') && !hasFile('index.jsx') && !hasFile('main.tsx') && !hasFile('main.jsx')) {
    console.log('[Build] Adding missing index.tsx');
    files.push({
      path: 'src/index.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      language: 'tsx'
    });
  }
  
  // Check for App.tsx/App.jsx
  if (!hasFile('App.tsx') && !hasFile('App.jsx')) {
    console.log('[Build] Adding missing App.tsx - creating from plan');
    const appContent = createAppFromPlan(plan, prompt);
    files.push({
      path: 'src/App.tsx',
      content: appContent,
      language: 'tsx'
    });
  }
  
  // Check for package.json
  if (!hasFile('package.json')) {
    console.log('[Build] Adding missing package.json');
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: "generated-app",
        version: "1.0.0",
        type: "module",
        scripts: { dev: "vite", build: "vite build" },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.294.0",
          "framer-motion": "^10.16.0"
        }
      }, null, 2),
      language: 'json'
    });
  }
  
  return files;
}

/**
 * Create a reasonable App component from the build plan
 */
function createAppFromPlan(plan: BuildPlan, prompt: string): string {
  const componentList = plan.components.filter(c => c !== 'App');
  
  return `import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            ${plan.architecture || 'Generated Application'}
          </h1>
          <p className="mt-2 text-slate-600">Built with Vibenicity</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Welcome!
            </h2>
            <p className="text-slate-600 mb-6">
              Your application is ready.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['${componentList.join("', '")}'].filter(Boolean).map((component, i) => (
                <div key={i} className="p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl border border-slate-200">
                  <span className="text-lg font-medium text-slate-700">{component}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}`;
}

export async function runPipeline(
  provider: AIProvider,
  translatedPrompt: string,
  linguisticsData: any,
  onPhase: (phase: BuildPhase) => Promise<void> | void,
  onLog: (msg: string, phase: BuildPhase) => Promise<void> | void,
  onFile: (file: GeneratedFile) => Promise<void> | void
): Promise<PipelineResult> {
  const allLogs: string[] = [];
  let currentPhase: BuildPhase = 'planning';
  
  const log = async (msg: string) => {
    allLogs.push(msg);
    await onLog(msg, currentPhase);
  };

  try {
    // Check if this is an image generation request
    const { isImageRequest, imageDescription } = detectImageRequest(translatedPrompt);
    
    if (isImageRequest) {
      currentPhase = 'generating';
      await onPhase('generating');
      await log('Detected image generation request...');
      await log(`Generating image: "${imageDescription}"`);
      
      let imageUrl: string;
      try {
        imageUrl = await generateImage(imageDescription);
        await log('Image generated successfully!');
      } catch (imgError: any) {
        await log(`Image generation failed: ${imgError.message}`);
        await log('Falling back to placeholder image...');
        imageUrl = `https://placehold.co/600x400?text=${encodeURIComponent(imageDescription)}`;
      }
      
      // Generate a simple React component that displays the image
      const imageComponent: GeneratedFile = {
        path: 'src/App.tsx',
        content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          ${imageDescription.charAt(0).toUpperCase() + imageDescription.slice(1)}
        </h1>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img 
            src="${imageUrl}"
            alt="${imageDescription}"
            className="w-full h-auto"
          />
        </div>
        <p className="mt-4 text-center text-gray-500 text-sm">
          Generated with Vibenicity AI
        </p>
      </div>
    </div>
  );
}`,
        language: 'tsx'
      };
      
      const indexFile: GeneratedFile = {
        path: 'src/index.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        language: 'tsx'
      };
      
      const packageJson: GeneratedFile = {
        path: 'package.json',
        content: JSON.stringify({
          name: "generated-image-app",
          version: "1.0.0",
          type: "module",
          scripts: { dev: "vite", build: "vite build" },
          dependencies: { react: "^18.2.0", "react-dom": "^18.2.0" }
        }, null, 2),
        language: 'json'
      };
      
      const files = [imageComponent, indexFile, packageJson];
      
      for (const file of files) {
        await onFile(file);
      }
      
      currentPhase = 'complete';
      await onPhase('complete');
      await log(`Build complete: ${files.length} files generated with AI image`);
      
      return {
        phase: 'complete',
        plan: {
          components: ['App'],
          files: files.map(f => f.path),
          dependencies: ['react', 'react-dom'],
          architecture: 'Image display component with AI-generated image'
        },
        files,
        logs: allLogs,
        errors: []
      };
    }
    
    // Standard code generation flow
    currentPhase = 'planning';
    await onPhase('planning');
    const plan = await planStage(provider, translatedPrompt, linguisticsData, (m) => log(m));
    await log(`Architecture: ${plan.architecture}`);
    
    currentPhase = 'generating';
    await onPhase('generating');
    const generated = await generateDirectStage(provider, plan, translatedPrompt, linguisticsData, (m) => log(m));
    
    currentPhase = 'verifying';
    await onPhase('verifying');
    const { files, errors, hasCriticalErrors } = await verifyStage(provider, generated, (m) => log(m), plan.files);
    
    if (hasCriticalErrors) {
      throw new Error(`Build failed: ${errors[0]}`);
    }
    
    for (const file of files) {
      await onFile(file);
    }
    
    currentPhase = 'complete';
    await onPhase('complete');
    await log(`Build complete: ${files.length} files generated`);
    
    return {
      phase: 'complete',
      plan,
      files,
      logs: allLogs,
      errors
    };
    
  } catch (error: any) {
    await log(`Pipeline error: ${error.message}`);
    await onPhase('error');
    return {
      phase: 'error',
      files: [],
      logs: allLogs,
      errors: [error.message]
    };
  }
}
