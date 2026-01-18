import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { Send, Sparkles, LayoutTemplate, Lightbulb, Zap, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { ProjectTemplate } from '@/lib/templates';

export function ChatInterface() {
  const { messages, addMessage, startBuild, planPrompt, build, planningMode, setPlanningMode } = useStore();
  const [input, setInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, build.phase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || build.isBuilding) return;
    
    const term = input;
    setInput('');
    
    if (planningMode) {
      planPrompt(term);
    } else {
      await startBuild(term);
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setInput(template.prompt);
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Header - Lovable style */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0f] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Wand2 className="w-5 h-5 text-[#00E5FF]" />
          <span className="text-sm font-semibold text-white">Chat</span>
        </div>
        
        {/* Mode Toggle - Lovable style */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setPlanningMode(false)}
            disabled={build.isBuilding}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              !planningMode 
                ? "bg-gradient-vibenicity text-black" 
                : "text-gray-400 hover:text-white"
            )}
            data-testid="button-agent-mode"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Agent
            </span>
          </button>
          <button
            onClick={() => setPlanningMode(true)}
            disabled={build.isBuilding}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              planningMode 
                ? "bg-[#E879F9] text-black" 
                : "text-gray-400 hover:text-white"
            )}
            data-testid="button-chat-mode"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" />
              Plan
            </span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-vibenicity flex items-center justify-center glow-cyan">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">What do you want to build?</h2>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Describe your app in any language style — slang, formal, whatever feels natural. I'll translate and build it.
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-xs">
              <button 
                onClick={() => setInput("Build a clean dashboard with charts and dark mode")}
                className="text-left px-4 py-3 glass rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                "Build a clean dashboard with charts"
              </button>
              <button 
                onClick={() => setInput("yo make me a fire todo app that's lowkey aesthetic")}
                className="text-left px-4 py-3 glass rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                "yo make me a fire todo app"
              </button>
              <button 
                onClick={() => setInput("Create a landing page for my SaaS startup")}
                className="text-left px-4 py-3 glass rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                "Create a landing page for my SaaS"
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {build.isBuilding && (
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#00E5FF] flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Building your app
              </span>
              <span className="text-xs text-gray-400">{build.progress}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-vibenicity transition-all duration-500"
                style={{ width: `${build.progress}%` }}
              />
            </div>
            
            <div className="space-y-2">
              <div className={cn("flex items-center gap-3 text-sm", build.phase === 'analyzing' ? "text-white" : "text-gray-500")}>
                <span className={cn("w-2 h-2 rounded-full", build.phase === 'analyzing' ? "bg-[#00E5FF] animate-pulse" : "bg-gray-600")} />
                Analyzing language & dialects
              </div>
              <div className={cn("flex items-center gap-3 text-sm", build.phase === 'planning' ? "text-white" : "text-gray-500")}>
                <span className={cn("w-2 h-2 rounded-full", build.phase === 'planning' ? "bg-[#00E5FF] animate-pulse" : "bg-gray-600")} />
                Planning architecture
              </div>
              <div className={cn("flex items-center gap-3 text-sm", build.phase === 'generating' ? "text-white" : "text-gray-500")}>
                <span className={cn("w-2 h-2 rounded-full", build.phase === 'generating' ? "bg-[#E879F9] animate-pulse" : "bg-gray-600")} />
                Generating code
              </div>
              <div className={cn("flex items-center gap-3 text-sm", build.phase === 'verifying' ? "text-white" : "text-gray-500")}>
                <span className={cn("w-2 h-2 rounded-full", build.phase === 'verifying' ? "bg-[#FF6B9D] animate-pulse" : "bg-gray-600")} />
                Verifying quality
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input - Lovable style */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0f] z-10 shrink-0">
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            disabled={build.isBuilding}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium glass rounded-lg hover:bg-white/10 transition-colors",
              build.isBuilding && "opacity-50 cursor-not-allowed"
            )}
            data-testid="button-templates"
          >
            <LayoutTemplate className="w-4 h-4 text-[#00E5FF]" />
            Templates
          </button>
          
          {planningMode && (
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#E879F9]/10 border border-[#E879F9]/20 rounded-lg text-[#E879F9]">
              <Lightbulb className="w-3.5 h-3.5" />
              Free planning mode
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={build.isBuilding}
            placeholder={build.isBuilding ? "Building..." : planningMode ? "Plan your app (free)..." : "Describe what you want to build..."}
            className={cn(
              "w-full bg-white/5 border rounded-xl pl-4 pr-14 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all",
              planningMode 
                ? "border-[#E879F9]/30 focus:ring-[#E879F9]/50" 
                : "border-white/10 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF]/50",
              build.isBuilding && "opacity-50 cursor-not-allowed"
            )}
            data-testid="input-prompt"
          />
          <button
            type="submit"
            disabled={!input.trim() || build.isBuilding}
            className={cn(
              "absolute right-2 top-2 p-2.5 rounded-lg disabled:opacity-50 transition-all",
              planningMode 
                ? "bg-[#E879F9] text-black hover:bg-[#E879F9]/90" 
                : "bg-gradient-vibenicity text-black hover:opacity-90"
            )}
            data-testid="button-submit"
          >
            {build.isBuilding ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <span className="text-[10px] text-gray-500">
            Powered by <span className="text-gradient font-medium">Vibenicity</span> Engine • 11+ Dialects
          </span>
        </div>
      </div>

      {showTemplates && (
        <TemplateSelector 
          onSelect={handleTemplateSelect} 
          onClose={() => setShowTemplates(false)} 
        />
      )}
    </div>
  );
}
