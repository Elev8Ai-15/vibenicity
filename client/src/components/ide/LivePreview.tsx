import { useStore, FileNode } from '@/lib/store';
import { useMemo } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { SandpackProvider, SandpackPreview, SandpackThemeProvider } from '@codesandbox/sandpack-react';

export function LivePreview() {
  const { build, files } = useStore();
  
  const getAllFiles = (nodes: FileNode[]): FileNode[] => {
    let result: FileNode[] = [];
    for (const node of nodes) {
      if (node.type === 'file' && node.content) {
        result.push(node);
      }
      if (node.children) {
        result = result.concat(getAllFiles(node.children));
      }
    }
    return result;
  };

  const allFiles = useMemo(() => getAllFiles(files), [files]);
  
  const sandpackFiles = useMemo(() => {
    if (allFiles.length === 0) return null;
    
    const fileMap: Record<string, { code: string }> = {};
    let hasAppFile = false;
    let appFilePath = '';
    
    for (const file of allFiles) {
      let originalPath = file.path;
      
      let normalizedPath = originalPath
        .replace(/^client\//, '')
        .replace(/^\.\//, '');
      
      if (!normalizedPath.startsWith('src/') && !normalizedPath.startsWith('/src/')) {
        if (normalizedPath.startsWith('/')) {
          normalizedPath = '/src' + normalizedPath;
        } else {
          normalizedPath = '/src/' + normalizedPath;
        }
      } else {
        if (!normalizedPath.startsWith('/')) {
          normalizedPath = '/' + normalizedPath;
        }
      }
      
      let content = file.content || '';
      
      const currentDir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
      
      content = content.replace(
        /from\s+['"]@\/([^'"]+)['"]/g,
        (match, importPath) => {
          const targetPath = '/src/' + importPath;
          const relativePath = getRelativePath(currentDir, targetPath);
          return `from '${relativePath}'`;
        }
      );
      
      content = content.replace(
        /from\s+['"]@components\/([^'"]+)['"]/g,
        (match, importPath) => {
          const targetPath = '/src/components/' + importPath;
          const relativePath = getRelativePath(currentDir, targetPath);
          return `from '${relativePath}'`;
        }
      );
      
      content = content.replace(
        /from\s+['"]@lib\/([^'"]+)['"]/g,
        (match, importPath) => {
          const targetPath = '/src/lib/' + importPath;
          const relativePath = getRelativePath(currentDir, targetPath);
          return `from '${relativePath}'`;
        }
      );
      
      fileMap[normalizedPath] = { code: content };
      
      if (normalizedPath.includes('App.tsx') || normalizedPath.includes('App.jsx') || normalizedPath.includes('App.js')) {
        hasAppFile = true;
        appFilePath = normalizedPath;
      }
    }
    
    // Scan for CSS imports and create missing CSS files
    const cssImportRegex = /import\s+['"]([^'"]*\.css)['"]/g;
    const missingCssFiles = new Set<string>();
    
    for (const [filePath, fileData] of Object.entries(fileMap)) {
      let match;
      while ((match = cssImportRegex.exec(fileData.code)) !== null) {
        const cssPath = match[1];
        const currentDir = filePath.substring(0, filePath.lastIndexOf('/'));
        let fullCssPath: string;
        
        if (cssPath.startsWith('./') || cssPath.startsWith('../')) {
          // Resolve relative path
          const parts = currentDir.split('/').filter(Boolean);
          const cssParts = cssPath.split('/');
          
          for (const part of cssParts) {
            if (part === '..') {
              parts.pop();
            } else if (part !== '.') {
              parts.push(part);
            }
          }
          fullCssPath = '/' + parts.join('/');
        } else {
          fullCssPath = '/src/' + cssPath;
        }
        
        if (!fileMap[fullCssPath]) {
          missingCssFiles.add(fullCssPath);
        }
      }
    }
    
    // Create empty CSS files for missing imports
    for (const cssPath of Array.from(missingCssFiles)) {
      fileMap[cssPath] = {
        code: `/* Auto-generated placeholder for missing CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add your styles here */
`
      };
    }
    
    const hasIndexFile = Object.keys(fileMap).some(p => 
      p === '/src/index.tsx' || p === '/src/index.jsx' || p === '/src/main.tsx'
    );
    
    if (!hasIndexFile && hasAppFile) {
      const importPath = appFilePath.replace('/src/', './').replace(/\.(tsx|jsx|js)$/, '');
      fileMap['/src/index.tsx'] = {
        code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '${importPath}';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      };
    }
    
    if (!fileMap['/public/index.html']) {
      fileMap['/public/index.html'] = {
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vibenicity Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
      };
    }
    
    return fileMap;
  }, [allFiles]);

  const entryFile = useMemo(() => {
    if (!sandpackFiles) return '/src/index.tsx';
    
    const candidates = ['/src/index.tsx', '/src/index.jsx', '/src/main.tsx', '/src/main.jsx'];
    for (const candidate of candidates) {
      if (sandpackFiles[candidate]) {
        return candidate;
      }
    }
    
    const appFile = Object.keys(sandpackFiles).find(p => 
      p.includes('App.tsx') || p.includes('App.jsx') || p.includes('App.js')
    );
    if (appFile) return appFile;
    
    return '/src/index.tsx';
  }, [sandpackFiles]);

  if (build.phase !== 'complete' && !build.isBuilding && allFiles.length === 0) {
    return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center">
        <div className="text-center opacity-30">
          <Play className="w-12 h-12 mx-auto mb-2 text-black" />
          <p className="text-sm font-medium text-black">Start Build to Preview</p>
        </div>
      </div>
    );
  }

  if (build.isBuilding) {
    return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wide">
            {build.phase === 'analyzing' && 'Decoding linguistics...'}
            {build.phase === 'planning' && 'Planning architecture...'}
            {build.phase === 'scaffolding' && 'Building scaffold...'}
            {build.phase === 'generating' && 'Generating code...'}
            {build.phase === 'verifying' && 'Verifying code...'}
            {build.phase === 'installing' && 'Installing dependencies...'}
          </p>
          <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${build.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!sandpackFiles || Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mb-4" />
        <p className="text-sm font-medium text-gray-600">No previewable content generated</p>
        <p className="text-xs text-gray-400 mt-1">Generate React or HTML files to see preview</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white" data-testid="live-preview">
      <SandpackProvider
        template="react-ts"
        files={sandpackFiles}
        options={{
          activeFile: entryFile,
          visibleFiles: Object.keys(sandpackFiles).filter(p => p.startsWith('/src')).slice(0, 5),
          externalResources: ['https://cdn.tailwindcss.com'],
        }}
        customSetup={{
          entry: entryFile,
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "wouter": "^3.0.0",
            "lucide-react": "^0.294.0",
            "framer-motion": "^10.16.0",
            "clsx": "^2.0.0",
            "tailwind-merge": "^2.0.0",
            "zustand": "^4.4.0",
            "date-fns": "^3.0.0",
            "recharts": "^2.10.0"
          }
        }}
      >
        <SandpackThemeProvider theme="light">
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <SandpackPreview 
                showOpenInCodeSandbox={false}
                showRefreshButton={true}
                style={{ height: '100%' }}
              />
            </div>
          </div>
        </SandpackThemeProvider>
      </SandpackProvider>
    </div>
  );
}

function getRelativePath(fromDir: string, toPath: string): string {
  const fromParts = fromDir.split('/').filter(Boolean);
  const toParts = toPath.split('/').filter(Boolean);
  
  let commonLength = 0;
  for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
    if (fromParts[i] === toParts[i]) {
      commonLength++;
    } else {
      break;
    }
  }
  
  const upCount = fromParts.length - commonLength;
  const remainingPath = toParts.slice(commonLength);
  
  if (upCount === 0) {
    return './' + remainingPath.join('/');
  }
  
  return '../'.repeat(upCount) + remainingPath.join('/');
}
