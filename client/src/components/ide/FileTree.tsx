import { FileNode } from '@/lib/store';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  onFileSelect?: () => void;
}

function FileTreeItem({ node, level, onFileSelect }: FileTreeItemProps) {
  const { toggleFolder, selectFile, activeFileId } = useStore();
  const isOpen = node.isOpen;
  const isSelected = activeFileId === node.id;

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    } else {
      selectFile(node.id);
      onFileSelect?.();
    }
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 py-1.5 px-2 hover:bg-white/5 cursor-pointer text-xs select-none transition-colors rounded-lg mx-1",
          isSelected && "bg-[#00E5FF]/10 text-[#00E5FF]"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <span className="opacity-70">
          {node.type === 'folder' ? (
            isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : (
             <span className="w-3" /> 
          )}
        </span>
        
        <span className={cn("opacity-80", node.type === 'folder' ? "text-[#00E5FF]" : "text-[#E879F9]")}>
           {node.type === 'folder' ? (
             isOpen ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />
           ) : (
             <FileCode className="w-3.5 h-3.5" />
           )}
        </span>
        
        <span className={cn("truncate font-mono", isSelected && "font-bold")}>{node.name}</span>
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeItem key={child.id} node={child} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileTreeProps {
  onFileSelect?: () => void;
}

export function FileTree({ onFileSelect }: FileTreeProps) {
  const { files } = useStore();

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {files.map(node => (
        <FileTreeItem key={node.id} node={node} level={0} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
}
