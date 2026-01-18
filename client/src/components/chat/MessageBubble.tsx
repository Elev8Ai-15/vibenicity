import { motion } from 'framer-motion';
import { Message, MessageRole, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Bot, User, Terminal, Sparkles, AlertTriangle, RefreshCw, Lightbulb } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

function getErrorSuggestions(errorMessage: string): string[] {
  const suggestions: string[] = [];
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('rate limit')) {
    suggestions.push('Wait a minute before trying again');
    suggestions.push('Rate limits reset every 60 seconds');
  } else if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
    suggestions.push('Try a simpler prompt for faster processing');
    suggestions.push('Break your request into smaller parts');
  } else if (lowerError.includes('api') || lowerError.includes('key')) {
    suggestions.push('There may be an issue with the AI service');
    suggestions.push('Try switching to a different AI provider');
  } else if (lowerError.includes('network') || lowerError.includes('connection')) {
    suggestions.push('Check your internet connection');
    suggestions.push('The server might be temporarily unavailable');
  } else {
    suggestions.push('Try rephrasing your request');
    suggestions.push('Be more specific about what you want to build');
    suggestions.push('Try using a template for better results');
  }
  
  return suggestions;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { retryBuild, build, lastPrompt } = useStore();
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.role === 'error';
  
  if (isError) {
    const suggestions = getErrorSuggestions(message.content);
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-4 mx-2"
      >
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-red-400 text-sm mb-1">Build Failed</h4>
              <p className="text-sm text-red-300/80">{message.content.replace('Build failed: ', '')}</p>
              
              {suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <div className="flex items-center gap-1.5 text-xs text-red-400/80 mb-2">
                    <Lightbulb className="w-3 h-3" />
                    <span>Suggestions</span>
                  </div>
                  <ul className="space-y-1">
                    {suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-xs text-red-300/60 flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {lastPrompt && !build.isBuilding && (
                <button
                  onClick={() => retryBuild()}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded transition-colors"
                  data-testid="button-retry-build"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Build
                </button>
              )}
            </div>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 opacity-50 block text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </motion.div>
    );
  }
  
  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs text-gray-400 py-2 px-4 justify-center font-mono border-t border-b border-white/5 bg-white/5 my-2"
      >
        <Terminal className="w-3 h-3 text-[#00E5FF]" />
        <span>{message.content}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex w-full gap-3 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
        isUser 
          ? "bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]" 
          : "bg-[#E879F9]/20 border-[#E879F9]/50 text-[#E879F9]"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn(
        "flex flex-col max-w-[80%] min-w-[200px]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-lg border text-sm shadow-md",
          isUser 
            ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-gray-100 rounded-tr-none" 
            : "bg-white/5 border-white/10 text-gray-100 rounded-tl-none"
        )}>
          {message.content.split('\n').map((line, i) => (
             <p key={i} className="whitespace-pre-wrap">{line}</p>
          ))}
        </div>
        
        {/* Translation Decoder View for User Messages */}
        {isUser && message.translation && message.translation.terms.length > 0 && (
          <div className="mt-2 text-xs font-mono w-full bg-[#0a0a0f] border border-[#00E5FF]/20 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <Sparkles className="w-3 h-3 text-[#00E5FF] animate-pulse" />
            </div>
            <div className="text-gray-400 mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
               <span className="text-[#E879F9]">Linguistics Engine</span> • Detected Dialects
            </div>
            <div className="space-y-1.5">
              {message.translation.terms.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0">
                  <span className="text-[#FF6B9D]">"{t.term}"</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-[#00E5FF]">[{t.meaning}]</span>
                  <span className="text-[10px] text-gray-500 uppercase bg-white/5 px-1.5 py-0.5 rounded">{t.category}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 text-gray-400 text-xs">
               Interpreted: <span className="text-white/80">"{message.translation.translatedText}"</span>
            </div>
          </div>
        )}

        <span className="text-[10px] text-muted-foreground mt-1 opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}
