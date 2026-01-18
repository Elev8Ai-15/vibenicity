import { useState, useEffect } from 'react';
import { History, RotateCcw, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FileVersion {
  id: number;
  fileId: number;
  content: string;
  version: number;
  createdAt: string;
}

interface VersionHistoryProps {
  fileId: number | null;
  currentContent: string | undefined;
  onRevert: (content: string, version: number) => void;
}

export function VersionHistory({ fileId, currentContent, onRevert }: VersionHistoryProps) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [diffView, setDiffView] = useState<string | null>(null);

  useEffect(() => {
    if (fileId) {
      fetchVersions();
    } else {
      setVersions([]);
    }
  }, [fileId]);

  const fetchVersions = async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/file/${fileId}/versions`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (version: FileVersion) => {
    if (!fileId) return;
    try {
      const res = await fetch(`/api/file/${fileId}/revert/${version.version}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        onRevert(version.content, version.version);
        fetchVersions();
      }
    } catch (err) {
      console.error('Failed to revert:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const computeDiff = (oldContent: string, newContent: string | undefined) => {
    if (!newContent) return oldContent;
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    let diffOutput = '';
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      if (oldLine !== newLine) {
        if (oldLine) diffOutput += `- ${oldLine}\n`;
        if (newLine) diffOutput += `+ ${newLine}\n`;
      }
    }
    return diffOutput || 'No differences';
  };

  if (!fileId) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Select a file to view version history
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Loading versions...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      <div className="h-9 px-4 flex items-center gap-2 text-xs font-bold text-[#bbbbbb] tracking-wide uppercase border-b border-[#3e3e42]">
        <History className="w-3.5 h-3.5" />
        Version History
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5 text-xs text-[#6a9955] font-medium flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Current Version
          </div>
          
          {versions.length === 0 ? (
            <div className="px-2 py-4 text-xs text-gray-500 text-center">
              No previous versions yet
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  "group px-2 py-2 rounded cursor-pointer transition-colors",
                  selectedVersion === version.id 
                    ? "bg-[#37373d]" 
                    : "hover:bg-[#2a2d2e]"
                )}
                onClick={() => setSelectedVersion(
                  selectedVersion === version.id ? null : version.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight className={cn(
                      "w-3 h-3 transition-transform text-gray-500",
                      selectedVersion === version.id && "rotate-90"
                    )} />
                    <span className="text-xs text-[#cccccc]">
                      Version {version.version}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {formatTime(version.createdAt)}
                  </span>
                </div>
                
                {selectedVersion === version.id && (
                  <div className="mt-2 ml-5 space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevert(version);
                      }}
                      data-testid={`button-revert-version-${version.version}`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Revert to this version
                    </Button>
                    
                    <div className="bg-[#1e1e1e] rounded p-2 text-[10px] font-mono max-h-32 overflow-auto">
                      <pre className="text-gray-400 whitespace-pre-wrap">
                        {version.content.slice(0, 200)}
                        {version.content.length > 200 && '...'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
