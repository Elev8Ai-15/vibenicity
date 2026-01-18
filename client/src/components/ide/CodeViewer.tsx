import { useStore, FileNode } from '@/lib/store';
import { FileCode, Eye, Layers, History, FolderTree } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileTree } from './FileTree';
import { LivePreview } from './LivePreview';
import { VersionHistory } from './VersionHistory';
import { ExportOptions } from './ExportOptions';

export function CodeViewer() {
  const { build, files, activeFileId, setFiles } = useStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'files'>('preview');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const findContent = (nodes: FileNode[], id: string): string | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node.content;
      if (node.children) {
        const found = findContent(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const currentFileContent = activeFileId ? findContent(files, activeFileId) : undefined;
  
  const findName = (nodes: FileNode[], id: string): string | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node.name;
      if (node.children) {
        const found = findName(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };
  const activeFileName = activeFileId ? findName(files, activeFileId) : 'Select File';

  const findDbId = (nodes: FileNode[], id: string): number | null => {
    for (const node of nodes) {
      if (node.id === id) return node.dbId || null;
      if (node.children) {
        const found = findDbId(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const activeFileDbId = activeFileId ? findDbId(files, activeFileId) : null;

  const handleRevert = (content: string, version: number) => {
    if (!activeFileId) return;
    const updateContent = (nodes: FileNode[]): FileNode[] => 
      nodes.map(node => {
        if (node.id === activeFileId) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateContent(node.children) };
        }
        return node;
      });
    setFiles(updateContent(files));
  };

  const handleFileSelect = () => {
    setActiveTab('code');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d12] text-gray-200 overflow-hidden">
      {/* Tab Bar */}
      <div className="h-10 bg-[#0a0a0f] flex items-center border-b border-white/5 overflow-x-auto no-scrollbar px-2 gap-1 shrink-0">
        {/* Preview Tab */}
        <button 
          onClick={() => setActiveTab('preview')}
          className={cn(
            "h-8 px-3 flex items-center gap-2 text-xs rounded-lg transition-colors",
            activeTab === 'preview' 
              ? "bg-white/10 text-white" 
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          )}
          data-testid="tab-preview"
        >
          <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Preview</span>
        </button>

        {/* Files Tab */}
        <button 
          onClick={() => setActiveTab('files')}
          className={cn(
            "h-8 px-3 flex items-center gap-2 text-xs rounded-lg transition-colors",
            activeTab === 'files' 
              ? "bg-white/10 text-white" 
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          )}
          data-testid="tab-files"
        >
          <FolderTree className="w-3.5 h-3.5 text-[#E879F9]" />
          <span>Files</span>
          {files.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
              {files.reduce((acc, node) => acc + (node.children?.length || 0) + 1, 0)}
            </span>
          )}
        </button>
        
        {/* Editor Tab - only show when file is selected */}
        {activeFileId && (
          <button 
            onClick={() => setActiveTab('code')}
            className={cn(
              "h-8 px-3 flex items-center gap-2 text-xs rounded-lg transition-colors",
              activeTab === 'code' 
                ? "bg-white/10 text-white" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
            data-testid="tab-code"
          >
            <FileCode className="w-3.5 h-3.5 text-[#FF6B9D]" />
            <span className="truncate max-w-[100px]">{activeFileName}</span>
          </button>
        )}

        {/* Export Options */}
        {build.sessionId && build.phase === 'complete' && (
          <div className="ml-auto h-full flex items-center">
            <ExportOptions sessionId={build.sessionId} />
          </div>
        )}

        {/* Version History Toggle */}
        <button 
          onClick={() => setShowVersionHistory(!showVersionHistory)}
          className={cn(
            build.sessionId && build.phase === 'complete' ? "" : "ml-auto",
            "h-8 px-3 flex items-center gap-2 text-xs rounded-lg transition-colors",
            showVersionHistory 
              ? "bg-[#E879F9]/20 text-[#E879F9]" 
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          )}
          title="Toggle version history"
          data-testid="button-toggle-version-history"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden flex min-h-0">
        <div className={cn("flex-1 h-full min-w-0", showVersionHistory && "border-r border-white/5")}>
          {activeTab === 'files' ? (
            <div className="h-full w-full overflow-auto bg-[#0a0a0f]">
              <FileTree onFileSelect={handleFileSelect} />
            </div>
          ) : activeTab === 'code' ? (
            <div className="h-full w-full overflow-auto bg-[#0d0d12]">
              {currentFileContent ? (
                <div className="flex min-h-full">
                  <div className="w-12 bg-[#0a0a0f] text-gray-600 text-right pr-3 pt-4 text-xs font-mono select-none">
                    {currentFileContent.split('\n').map((_, i) => (
                      <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                  </div>
                  <pre className="flex-1 p-4 pt-4 text-sm font-mono leading-6 tab-4 text-gray-200 outline-none">
                    {currentFileContent}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <Layers className="w-16 h-16 mb-4 opacity-30 text-[#00E5FF]" />
                  <p className="text-sm">Select a file from the Files tab</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full bg-white relative">
              <div className="h-8 bg-[#f3f3f3] border-b flex items-center px-2 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white h-5 rounded-sm border flex items-center px-2 text-[10px] text-gray-500 font-mono mx-2">
                  localhost:3000
                </div>
              </div>
              
              <div className="h-[calc(100%-32px)] w-full overflow-hidden">
                <LivePreview />
              </div>
            </div>
          )}
        </div>
        
        {showVersionHistory && (
          <div className="w-64 shrink-0 h-full">
            <VersionHistory 
              fileId={activeFileDbId} 
              currentContent={currentFileContent}
              onRevert={handleRevert}
            />
          </div>
        )}
      </div>
    </div>
  );
}
