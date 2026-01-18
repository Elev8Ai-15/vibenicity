import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { engine, LinguisticTerm, TranslationResult } from './linguistics';

export type MessageRole = 'user' | 'system' | 'assistant' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  translation?: TranslationResult;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
  dbId?: number;
}

export interface BuildState {
  isBuilding: boolean;
  phase: 'idle' | 'analyzing' | 'planning' | 'scaffolding' | 'generating' | 'verifying' | 'installing' | 'complete';
  progress: number;
  currentAgent: string | null;
  logs: string[];
  sessionId: number | null;
}

interface AppState {
  messages: Message[];
  build: BuildState;
  files: FileNode[];
  activeFileId: string | null;
  provider: 'gemini' | 'claude' | 'openai';
  lastPrompt: string | null;
  planningMode: boolean;
  
  // Actions
  addMessage: (role: MessageRole, content: string, translation?: TranslationResult) => void;
  clearMessages: () => void;
  startBuild: (input: string) => Promise<void>;
  planPrompt: (input: string) => void;
  retryBuild: () => Promise<void>;
  resetBuild: () => void;
  toggleFolder: (id: string) => void;
  selectFile: (id: string) => void;
  addLog: (log: string) => void;
  setProvider: (provider: 'gemini' | 'claude' | 'openai') => void;
  setFiles: (files: FileNode[]) => void;
  setPlanningMode: (mode: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      messages: [],
      files: [],
      activeFileId: null,
      provider: 'gemini',
      lastPrompt: null,
      planningMode: false,
      build: {
        isBuilding: false,
        phase: 'idle',
        progress: 0,
        currentAgent: null,
        logs: [],
        sessionId: null
      },

      addMessage: (role, content, translation) => {
        set(state => ({
          messages: [
            ...state.messages,
            {
              id: Math.random().toString(36).substring(7),
              role,
              content,
              timestamp: Date.now(),
              translation
            }
          ]
        }));
      },

      clearMessages: () => set({ messages: [] }),
      
      addLog: (log) => set(state => ({
        build: {
            ...state.build,
            logs: [...state.build.logs, `[${new Date().toLocaleTimeString()}] ${log}`]
        }
      })),

      resetBuild: () => set({ 
        build: { 
          isBuilding: false, 
          phase: 'idle', 
          progress: 0, 
          currentAgent: null, 
          logs: [],
          sessionId: null
        },
        files: []
      }),

      toggleFolder: (id) => set(state => {
        const toggleNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.id === id) return { ...node, isOpen: !node.isOpen };
                if (node.children) return { ...node, children: toggleNode(node.children) };
                return node;
            });
        };
        return { files: toggleNode(state.files) };
      }),

      selectFile: (id) => set({ activeFileId: id }),
      
      setProvider: (provider) => set({ provider }),

      setFiles: (files) => set({ files }),

      setPlanningMode: (mode) => set({ planningMode: mode }),

      planPrompt: (input: string) => {
        const { addMessage } = get();
        const translation = engine.translate(input);
        
        addMessage('user', input, translation);
        
        let planningResponse = `**Planning Mode** (No AI tokens used)\n\n`;
        
        if (translation.terms.length > 0) {
          planningResponse += `**Dialect Analysis:**\n`;
          translation.terms.forEach(term => {
            planningResponse += `• "${term.term}" → ${term.meaning} (${term.category})\n`;
          });
          planningResponse += `\n**Interpreted as:** "${translation.translatedText}"\n\n`;
        } else {
          planningResponse += `Your prompt is clear and ready to build!\n\n`;
        }
        
        planningResponse += `**Suggested Components:**\n`;
        const keywords = translation.translatedText.toLowerCase();
        if (keywords.includes('dashboard') || keywords.includes('analytics')) {
          planningResponse += `• Dashboard layout with stats cards\n• Charts/graphs for data visualization\n• Navigation sidebar\n`;
        } else if (keywords.includes('store') || keywords.includes('shop') || keywords.includes('ecommerce')) {
          planningResponse += `• Product grid/listing\n• Shopping cart\n• Checkout flow\n• Product detail pages\n`;
        } else if (keywords.includes('landing') || keywords.includes('marketing')) {
          planningResponse += `• Hero section\n• Feature highlights\n• Testimonials\n• Call-to-action\n`;
        } else if (keywords.includes('chat') || keywords.includes('message')) {
          planningResponse += `• Message thread view\n• Conversation list\n• Input composer\n• User avatars\n`;
        } else {
          planningResponse += `• Main application component\n• Navigation/header\n• Core feature UI\n• Footer/info section\n`;
        }
        
        planningResponse += `\n**Ready to build?** Toggle off Planning Mode and submit to generate code.`;
        
        addMessage('assistant', planningResponse);
      },

      retryBuild: async () => {
        const { lastPrompt, startBuild } = get();
        if (lastPrompt) {
          await startBuild(lastPrompt);
        }
      },

      startBuild: async (input: string) => {
        const { addMessage, addLog, provider } = get();
        
        // Save prompt for retry
        set({ lastPrompt: input });
        
        // 1. Linguistics Analysis
        const translation = engine.translate(input);
        addMessage('user', input, translation);
        
        set(state => ({ 
          build: { ...state.build, isBuilding: true, phase: 'analyzing', progress: 5, logs: [], sessionId: null } 
        }));

        try {
          // Call real backend API with SSE
          const response = await fetch('/api/build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, provider })
          });

          if (!response.ok) {
            throw new Error('Build request failed');
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No response stream');
          }

          let buffer = '';
          const generatedFiles: FileNode[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              try {
                const event = JSON.parse(line.slice(6));

                switch (event.type) {
                  case 'linguistics':
                    set(state => ({ build: { ...state.build, sessionId: event.sessionId, progress: 15 } }));
                    if (event.terms?.length > 0) {
                      addMessage('system', `Detected dialect: ${event.terms.length} terms decoded`);
                    }
                    break;

                  case 'status':
                    const phaseProgress: Record<string, number> = {
                      'analyzing': 15,
                      'planning': 30,
                      'generating': 60,
                      'verifying': 90,
                      'complete': 100
                    };
                    set(state => ({ 
                      build: { 
                        ...state.build, 
                        phase: event.phase,
                        progress: phaseProgress[event.phase] || 50
                      } 
                    }));
                    break;

                  case 'log':
                    addLog(event.message);
                    break;

                  case 'file':
                    generatedFiles.push({
                      id: event.file.path,
                      name: event.file.path.split('/').pop() || event.file.path,
                      path: event.file.path,
                      type: 'file',
                      content: event.file.content,
                      language: event.file.language,
                      dbId: event.file.dbId
                    });
                    set(state => ({ 
                      build: { ...state.build, progress: Math.min(95, state.build.progress + 5) } 
                    }));
                    break;

                  case 'complete':
                    // Build file tree from flat files
                    const fileTree = buildFileTree(generatedFiles);
                    set(state => ({ 
                      build: { ...state.build, isBuilding: false, phase: 'complete', progress: 100 },
                      files: fileTree,
                      activeFileId: generatedFiles[0]?.id || null
                    }));
                    addMessage('system', `Build complete! Generated ${event.filesCount} files.`);
                    break;

                  case 'error':
                    throw new Error(event.message || event.error || 'Build failed');
                }
              } catch (e) {
                if (!(e instanceof SyntaxError)) throw e;
              }
            }
          }

        } catch (error: any) {
          addMessage('error', `Build failed: ${error.message}`);
          set(state => ({ build: { ...state.build, isBuilding: false, phase: 'idle' } }));
        }
      }
    }),
    {
      name: 'vibenicity-storage-v3',
      partialize: (state) => ({ messages: state.messages, provider: state.provider }),
    }
  )
);

// Helper to build nested file tree from flat file list
function buildFileTree(files: FileNode[]): FileNode[] {
  const root: FileNode = {
    id: 'root',
    name: 'project',
    path: '/',
    type: 'folder',
    isOpen: true,
    children: []
  };

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.children!.push(file);
      } else {
        let folder = current.children!.find(c => c.name === part && c.type === 'folder');
        if (!folder) {
          folder = {
            id: parts.slice(0, i + 1).join('/'),
            name: part,
            path: '/' + parts.slice(0, i + 1).join('/'),
            type: 'folder',
            isOpen: true,
            children: []
          };
          current.children!.push(folder);
        }
        current = folder;
      }
    }
  }

  return root.children || [];
}
