import { ChatInterface } from '@/components/chat/ChatInterface';
import { CodeViewer } from '@/components/ide/CodeViewer';
import { TerminalPanel } from '@/components/ide/TerminalPanel';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User, Menu, X, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Workspace() {
  const { user, logout } = useAuth();
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'code'>('chat');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-foreground overflow-hidden flex flex-col">
      {/* Top Bar - Lovable style */}
      <div className="h-12 bg-[#0f0f14] border-b border-white/5 flex items-center justify-between px-3 sm:px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            data-testid="button-mobile-menu"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/vibenicity-logo.png" 
              alt="Vibenicity" 
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="text-gradient font-semibold text-sm hidden sm:inline">Vibenicity</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="text-xs text-gray-400">Ready to build</span>
          </div>
        </div>
        
        {/* Mobile Panel Switcher */}
        <div className="flex md:hidden items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button 
            onClick={() => setMobilePanel('chat')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              mobilePanel === 'chat' 
                ? "bg-gradient-vibenicity text-black" 
                : "text-gray-400 hover:text-white"
            )}
            data-testid="button-mobile-chat"
          >
            Chat
          </button>
          <button 
            onClick={() => setMobilePanel('code')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              mobilePanel === 'code' 
                ? "bg-gradient-vibenicity text-black" 
                : "text-gray-400 hover:text-white"
            )}
            data-testid="button-mobile-code"
          >
            Code
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            data-testid="button-analytics"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-300">{user?.firstName || user?.email?.split('@')[0] || 'User'}</span>
          </div>
          
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-12 left-0 right-0 bg-[#0f0f14] border-b border-white/5 p-4 z-50">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User className="w-4 h-4" />
            <span>{user?.firstName || user?.email || 'User'}</span>
          </div>
        </div>
      )}

      {/* Desktop Layout - Resizable panels like Replit */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Chat */}
          <ResizablePanel 
            defaultSize={28} 
            minSize={20} 
            maxSize={50}
            className="bg-[#0a0a0f]"
          >
            <div className="h-full flex flex-col">
              <ChatInterface />
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle className="w-1 bg-white/5 hover:bg-[#00E5FF]/50 transition-colors cursor-col-resize" />

          {/* Right Panel: IDE (majority of screen) */}
          <ResizablePanel defaultSize={72} minSize={50} className="bg-[#0d0d12]">
            <ResizablePanelGroup direction="vertical">
              {/* Editor/Preview - larger when console collapsed */}
              <ResizablePanel defaultSize={85} minSize={50}>
                <CodeViewer />
              </ResizablePanel>

              {/* Vertical Resize Handle */}
              <ResizableHandle className="h-1 bg-white/5 hover:bg-[#00E5FF]/50 transition-colors cursor-row-resize" />

              {/* Terminal - smaller, collapsible */}
              <ResizablePanel defaultSize={15} minSize={5} maxSize={50} collapsible collapsedSize={3}>
                <TerminalPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        {mobilePanel === 'chat' ? (
          <div className="flex-1 flex flex-col bg-[#0a0a0f]">
            <ChatInterface />
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-[#0d0d12]">
            <div className="flex-[7] min-h-0">
              <CodeViewer />
            </div>
            <div className="flex-[3] min-h-0 border-t border-white/5">
              <TerminalPanel />
            </div>
          </div>
        )}
      </div>

      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}
