import { Terminal as TerminalIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRef, useEffect } from 'react';

export function TerminalPanel() {
  const { build } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [build.logs]);

  return (
    <div className="flex flex-col h-full bg-[#08080c] font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0a0a0f]">
        <div className="flex items-center gap-2 text-gray-400">
          <TerminalIcon className="w-4 h-4 text-[#00E5FF]" />
          <span className="font-medium">Console</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B9D]/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E879F9]/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]/30" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1.5"
      >
        {build.logs.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-[#00E5FF]">❯</span>
            <span>Ready for input</span>
            <span className="animate-pulse w-2 h-4 bg-[#00E5FF]/50" />
          </div>
        ) : (
          <>
            {build.logs.map((log, i) => (
              <div key={i} className="flex gap-2 text-gray-300">
                <span className="text-[#00E5FF]">❯</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[#00E5FF]">❯</span>
              <span className="text-[#E879F9]">~/vibenicity</span>
              <span className="text-gray-500">$</span>
              {build.isBuilding && <span className="animate-pulse w-2 h-4 bg-[#00E5FF]/70" />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
