import { useState, useRef, useEffect } from 'react';
import { Download, FolderArchive, Github, FileCode, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, FileNode } from '@/lib/store';

interface ExportOptionsProps {
  sessionId: number;
}

export function ExportOptions({ sessionId }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { files } = useStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleZipDownload = () => {
    setDownloading('zip');
    window.location.href = `/api/build/${sessionId}/download`;
    setTimeout(() => setDownloading(null), 2000);
    setIsOpen(false);
  };

  const handleGithubDownload = async () => {
    setDownloading('github');
    window.location.href = `/api/build/${sessionId}/download?format=github`;
    setTimeout(() => setDownloading(null), 2000);
    setIsOpen(false);
  };

  const getAllFiles = (nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    for (const node of nodes) {
      if (node.type === 'file' && node.content) {
        result.push(node);
      }
      if (node.children) {
        result.push(...getAllFiles(node.children));
      }
    }
    return result;
  };

  const downloadSingleFile = (file: FileNode) => {
    if (!file.content) return;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const allFiles = getAllFiles(files);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-full px-3 flex items-center gap-2 text-xs bg-[#2d2d2d] text-[#969696] hover:bg-[#1e1e1e] hover:text-white transition-colors"
        data-testid="button-export-options"
      >
        <Download className="w-3.5 h-3.5 text-green-400" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-[#2d2d2d] border border-[#3e3e42] rounded-lg shadow-xl z-50">
          <div className="p-2 border-b border-[#3e3e42]">
            <p className="text-xs text-[#888] px-2 py-1">Export Format</p>
          </div>
          
          <div className="p-1">
            <button
              onClick={handleZipDownload}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3e3e42] rounded transition-colors text-left"
              data-testid="button-export-zip"
            >
              <FolderArchive className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <div className="font-medium">ZIP Archive</div>
                <div className="text-xs text-[#888]">All files in a compressed folder</div>
              </div>
              {downloading === 'zip' && <span className="text-xs text-green-400">Downloading...</span>}
            </button>

            <button
              onClick={handleGithubDownload}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3e3e42] rounded transition-colors text-left"
              data-testid="button-export-github"
            >
              <Github className="w-4 h-4 text-purple-400" />
              <div className="flex-1">
                <div className="font-medium">GitHub Ready</div>
                <div className="text-xs text-[#888]">Includes README.md & .gitignore</div>
              </div>
              {downloading === 'github' && <span className="text-xs text-green-400">Downloading...</span>}
            </button>
          </div>

          {allFiles.length > 0 && (
            <>
              <div className="p-2 border-t border-[#3e3e42]">
                <p className="text-xs text-[#888] px-2 py-1">Individual Files</p>
              </div>
              <div className="p-1 max-h-40 overflow-y-auto">
                {allFiles.slice(0, 10).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => downloadSingleFile(file)}
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-white hover:bg-[#3e3e42] rounded transition-colors text-left"
                    data-testid={`button-export-file-${file.name}`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
                {allFiles.length > 10 && (
                  <div className="px-3 py-1.5 text-xs text-[#666]">
                    +{allFiles.length - 10} more files (download ZIP for all)
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
