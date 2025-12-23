import React, { useState, useEffect } from 'react';
import { WindowProps } from '../../types';
import { Play, Save, FileCode } from 'lucide-react';
import { fileSystem } from '../../services/fileSystemService';

const CodeStudio: React.FC<WindowProps> = ({ initialProps }) => {
  const [code, setCode] = useState('// Write your javascript here\nconsole.log("Hello OS");');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (initialProps?.filePath) {
      setFilePath(initialProps.filePath);
      const content = fileSystem.readFile(initialProps.filePath);
      if (content) setCode(content);
    }
  }, [initialProps]);

  const handleRun = () => {
    setOutput([]);
    const originalLog = console.log;
    const logs: string[] = [];

    // Capture console.log
    console.log = (...args) => {
      logs.push(args.map(a => String(a)).join(' '));
      originalLog(...args); // Keep browser console working
    };

    try {
      // eslint-disable-next-line no-eval
      eval(code);
      setOutput(logs.length > 0 ? logs : ['> Execution successful (no output)']);
    } catch (e: any) {
      setOutput(prev => [...prev, `Error: ${e.message}`]);
    } finally {
      console.log = originalLog;
    }
  };

  const handleSave = () => {
      if (filePath) {
          fileSystem.writeFile(filePath, code);
          alert('Saved!');
      } else {
          // Simple mock save as
          const name = prompt('Enter filename to save in /home/user/projects/', 'new_script.js');
          if (name) {
              const path = `/home/user/projects/${name}`;
              fileSystem.writeFile(path, code);
              setFilePath(path);
              alert('Saved!');
          }
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
      {/* Toolbar */}
      <div className="h-10 bg-[#2d2d2d] flex items-center px-2 gap-2 border-b border-black">
        <button onClick={handleRun} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-bold transition-colors">
          <Play size={12} fill="currentColor" /> Run
        </button>
        <button onClick={handleSave} className="flex items-center gap-1 hover:bg-white/10 px-3 py-1 rounded text-xs text-slate-300 transition-colors">
          <Save size={14} /> Save
        </button>
        <span className="ml-auto text-xs text-slate-500 font-mono">
            {filePath || 'Untitled'}
        </span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-[#1e1e1e] text-slate-300 font-mono text-sm p-4 outline-none resize-none border-r border-black"
          spellCheck={false}
        />

        {/* Console Output */}
        <div className="h-1/3 md:h-full md:w-1/3 bg-[#111] p-2 flex flex-col border-t md:border-t-0 md:border-l border-white/10">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Console</div>
          <div className="flex-1 overflow-auto font-mono text-xs space-y-1">
             {output.map((line, i) => (
                 <div key={i} className={line.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}>
                     {line.startsWith('>') ? '' : '> '}{line}
                 </div>
             ))}
             {output.length === 0 && <span className="text-slate-700 italic">Ready to execute...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeStudio;
