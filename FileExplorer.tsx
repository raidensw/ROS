import React, { useState, useEffect } from 'react';
import { Folder, File, ArrowLeft, RefreshCw, FileText, Image, Code } from 'lucide-react';
import { WindowProps } from '../../types';
import { fileSystem } from '../../services/fileSystemService';

const FileExplorer: React.FC<WindowProps> = ({ onExecuteCommand }) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [items, setItems] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setItems(fileSystem.readDir(currentPath));
  }, [currentPath, refresh]);

  const handleNavigate = (path: string) => {
    const node = fileSystem.resolvePath(path);
    if (node && node.type === 'folder') {
      setCurrentPath(path);
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    const parent = parts.length === 0 ? '/' : '/' + parts.join('/');
    setCurrentPath(parent);
  };

  const openItem = (name: string) => {
    const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
    const node = fileSystem.resolvePath(fullPath);
    
    if (node) {
      if (node.type === 'folder') {
        setCurrentPath(fullPath);
      } else {
        // It's a file, determine handler
        if (name.endsWith('.js') || name.endsWith('.py') || name.endsWith('.html')) {
             onExecuteCommand && onExecuteCommand('openApp', { appId: 'code', filePath: fullPath });
        } else if (name.endsWith('.png') || name.endsWith('.jpg')) {
             onExecuteCommand && onExecuteCommand('openApp', { appId: 'media' }); // Mock
        } else {
             // Default to notepad
             onExecuteCommand && onExecuteCommand('openApp', { appId: 'notepad', filePath: fullPath });
        }
      }
    }
  };

  const getIcon = (name: string, isFolder: boolean) => {
    if (isFolder) return <Folder className="w-8 h-8 text-blue-400 mb-1" />;
    if (name.endsWith('.js') || name.endsWith('.html')) return <Code className="w-8 h-8 text-yellow-400 mb-1" />;
    if (name.endsWith('.png')) return <Image className="w-8 h-8 text-purple-400 mb-1" />;
    return <FileText className="w-8 h-8 text-slate-300 mb-1" />;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Toolbar */}
      <div className="h-10 border-b border-white/10 flex items-center px-2 gap-2 bg-white/5">
        <button onClick={handleUp} className="p-1 hover:bg-white/10 rounded disabled:opacity-50" disabled={currentPath === '/'}>
          <ArrowLeft size={16} />
        </button>
        <button onClick={() => setRefresh(r => r + 1)} className="p-1 hover:bg-white/10 rounded">
          <RefreshCw size={16} />
        </button>
        <div className="flex-1 ml-2 bg-black/30 rounded px-2 py-1 text-xs font-mono text-slate-300 border border-white/5">
          {currentPath}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-4 gap-4">
          {items.map(name => {
            const node = fileSystem.resolvePath(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`);
            const isFolder = node?.type === 'folder';
            return (
              <button
                key={name}
                onDoubleClick={() => openItem(name)}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-500/20 group transition-colors"
              >
                {getIcon(name, isFolder)}
                <span className="text-xs text-center break-all text-slate-300 group-hover:text-white line-clamp-2">
                  {name}
                </span>
              </button>
            );
          })}
          
          {items.length === 0 && (
            <div className="col-span-4 text-center text-slate-600 text-sm mt-10">
              Folder is empty
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-slate-950 border-t border-white/10 flex items-center px-3 text-[10px] text-slate-500">
        {items.length} items
      </div>
    </div>
  );
};

export default FileExplorer;
