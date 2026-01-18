import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Priority: Replit AI Integrations first (more reliable), then user's own keys as fallback

// OpenAI - prefer Replit's AI integrations
const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openaiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_API_KEY 
  ? process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
  : undefined;

export const openai = new OpenAI({
  apiKey: openaiKey,
  baseURL: openaiBaseUrl,
});

// Anthropic (Claude) - prefer Replit's AI integrations
const anthropicKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const anthropicBaseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY
  ? process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL
  : undefined;

export const anthropic = anthropicKey ? new Anthropic({
  apiKey: anthropicKey,
  baseURL: anthropicBaseUrl,
}) : null;

// Gemini - prefer Replit's AI integrations (via OpenAI-compatible interface)
const geminiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const geminiBaseUrl = process.env.AI_INTEGRATIONS_GEMINI_API_KEY
  ? process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
  : process.env.GEMINI_API_KEY 
    ? 'https://generativelanguage.googleapis.com/v1beta/openai/'
    : undefined;

export const gemini = geminiKey ? new OpenAI({
  apiKey: geminiKey,
  baseURL: geminiBaseUrl,
}) : null;

// Log which providers are configured
console.log('[AI] Provider config:');
console.log(`  OpenAI: ${process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? 'Replit AI' : process.env.OPENAI_API_KEY ? 'Your key' : 'Not configured'}`);
console.log(`  Claude: ${process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ? 'Replit AI' : process.env.ANTHROPIC_API_KEY ? 'Your key' : 'Not configured'}`);
console.log(`  Gemini: ${process.env.AI_INTEGRATIONS_GEMINI_API_KEY ? 'Replit AI' : process.env.GEMINI_API_KEY ? 'Your key' : 'Not configured'}`);

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'auto';

/**
 * Smart provider selection based on prompt analysis
 * - Claude: Better for backend, APIs, databases, authentication, complex logic
 * - Gemini: Better for creative work, UI/UX, organization, frontend design
 * - OpenAI: General purpose fallback
 */
export function selectBestProvider(prompt: string): AIProvider {
  const lowerPrompt = prompt.toLowerCase();
  
  // Backend/technical patterns - prefer Claude
  const backendPatterns = [
    'api', 'backend', 'server', 'database', 'auth', 'authentication',
    'login', 'signup', 'jwt', 'oauth', 'postgres', 'mysql', 'mongodb',
    'crud', 'rest', 'graphql', 'middleware', 'express', 'node',
    'security', 'encryption', 'validation', 'endpoint', 'route',
    'payment', 'stripe', 'webhook', 'integration', 'microservice'
  ];
  
  // Creative/frontend patterns - prefer Gemini
  const creativePatterns = [
    'landing page', 'hero', 'beautiful', 'stunning', 'creative',
    'design', 'ui', 'ux', 'animation', 'interactive', 'portfolio',
    'colorful', 'modern', 'sleek', 'aesthetic', 'visual', 'artistic',
    'marketing', 'showcase', 'gallery', 'presentation', 'story',
    'game', 'fun', 'playful', 'engaging', 'immersive'
  ];
  
  let backendScore = 0;
  let creativeScore = 0;
  
  for (const pattern of backendPatterns) {
    if (lowerPrompt.includes(pattern)) backendScore++;
  }
  
  for (const pattern of creativePatterns) {
    if (lowerPrompt.includes(pattern)) creativeScore++;
  }
  
  // Determine best provider based on scores
  if (backendScore > creativeScore && anthropic) {
    console.log(`[AI Router] Backend-focused prompt (score: ${backendScore}) -> Claude`);
    return 'claude';
  }
  
  if (creativeScore > backendScore && gemini) {
    console.log(`[AI Router] Creative-focused prompt (score: ${creativeScore}) -> Gemini`);
    return 'gemini';
  }
  
  // Default to OpenAI for balanced prompts or when other providers unavailable
  console.log(`[AI Router] General prompt -> OpenAI (backend: ${backendScore}, creative: ${creativeScore})`);
  return 'openai';
}

/**
 * Check which providers are available
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ['openai'];
  if (anthropic) providers.push('claude');
  if (gemini) providers.push('gemini');
  return providers;
}

/**
 * Detect if the prompt is requesting image generation
 */
export function detectImageRequest(prompt: string): { isImageRequest: boolean; imageDescription: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  const imageKeywords = [
    'picture of', 'image of', 'photo of', 'create an image', 'generate an image',
    'draw', 'make a picture', 'make an image', 'show me', 'illustration of',
    'design an image', 'create a picture', 'generate a picture',
    'pic of', 'make me a', 'create me a', 'draw me a'
  ];
  
  const isImageRequest = imageKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  let imageDescription = prompt;
  if (isImageRequest) {
    for (const keyword of imageKeywords) {
      if (lowerPrompt.includes(keyword)) {
        const idx = lowerPrompt.indexOf(keyword);
        imageDescription = prompt.substring(idx + keyword.length).trim();
        break;
      }
    }
  }
  
  return { isImageRequest, imageDescription };
}

/**
 * Generate an image using OpenAI gpt-image-1
 */
export async function generateImage(description: string): Promise<string> {
  console.log('[AI] Generating image with gpt-image-1:', description);
  
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt: description,
    n: 1,
    size: "1024x1024",
  });
  
  if (!response.data || response.data.length === 0) {
    throw new Error('No image data returned from API');
  }
  
  const imageData = response.data[0];
  
  if (imageData.b64_json) {
    console.log('[AI] Image generated successfully (base64)');
    return `data:image/png;base64,${imageData.b64_json}`;
  }
  
  if (imageData.url) {
    console.log('[AI] Image generated successfully (URL)');
    return imageData.url;
  }
  
  throw new Error('No image data returned from API');
}

export interface CodeGenerationResult {
  files: Array<{ path: string; content: string; language: string }>;
  logs: string[];
}

/**
 * Generate code using the specified AI provider and linguistics context
 */
export async function generateCode(
  provider: AIProvider,
  userPrompt: string,
  translatedPrompt: string,
  linguisticsData: any
): Promise<CodeGenerationResult> {
  const systemPrompt = `You are an expert full-stack developer. Generate complete, production-ready code based on the user's request.

IMPORTANT INSTRUCTIONS:
1. Output ONLY code in markdown code blocks with file paths
2. Include package.json, main app files, and components
3. Use modern best practices (React 19, TypeScript, Tailwind CSS)
4. Make the code immediately runnable

Format each file as:
\`\`\`typescript:src/App.tsx
// code here
\`\`\`

The user's original request was: "${userPrompt}"
${linguisticsData?.terms?.length > 0 ? `\nDetected slang/dialect terms: ${linguisticsData.terms.map((t: any) => `"${t.term}" (${t.meaning})`).join(', ')}` : ''}
Interpreted meaning: "${translatedPrompt}"`;

  const logs: string[] = [];
  const files: Array<{ path: string; content: string; language: string }> = [];

  try {
    let responseText = '';

    if (provider === 'openai') {
      logs.push('Using OpenAI GPT-5 for code generation...');
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a complete application: ${translatedPrompt}` }
        ],
        max_completion_tokens: 4096,
      });
      responseText = response.choices[0]?.message?.content || '';
      
    } else if (provider === 'claude') {
      if (!anthropic) {
        throw new Error('Claude integration not configured. Using OpenAI instead.');
      }
      logs.push('Using Claude Sonnet 4.5 for code generation...');
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: "user", content: `Generate a complete application: ${translatedPrompt}` }
        ],
      });
      responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
    } else if (provider === 'gemini') {
      if (!gemini) {
        logs.push('Gemini not configured, falling back to OpenAI GPT-5...');
        const response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate a complete application: ${translatedPrompt}` }
          ],
          max_completion_tokens: 4096,
        });
        responseText = response.choices[0]?.message?.content || '';
      } else {
        logs.push('Using Gemini 2.5 Flash for code generation...');
        const response = await gemini.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate a complete application: ${translatedPrompt}` }
          ],
          max_completion_tokens: 4096,
        });
        responseText = response.choices[0]?.message?.content || '';
      }
    }

    // Parse code blocks from response
    const codeBlockRegex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(responseText)) !== null) {
      const language = match[1];
      const filePath = match[2] || `generated.${language}`;
      const content = match[3].trim();
      
      files.push({ path: filePath, content, language });
      logs.push(`Generated file: ${filePath}`);
    }

    // If no properly formatted blocks found, try to extract any code
    if (files.length === 0) {
      logs.push('Warning: No properly formatted code blocks found, extracting raw content...');
      files.push({
        path: 'src/App.tsx',
        content: responseText,
        language: 'typescript'
      });
    }

  } catch (error: any) {
    logs.push(`Error: ${error.message}`);
    throw error;
  }

  return { files, logs };
}
