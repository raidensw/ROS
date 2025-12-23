import React, { useState } from 'react';
import { WindowProps } from '../../types';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search } from 'lucide-react';
import { fileSystem } from '../../services/fileSystemService';

const Browser: React.FC<WindowProps> = ({ initialProps }) => {
  const [url, setUrl] = useState('https://www.google.com/search?igu=1'); // igu=1 allows google in iframe mostly
  const [input, setInput] = useState('https://www.google.com/search?igu=1');
  const [src, setSrc] = useState(url);

  // Check if opening a local html file
  React.useEffect(() => {
      if (initialProps?.filePath) {
          const content = fileSystem.readFile(initialProps.filePath);
          if (content) {
             const blob = new Blob([content], { type: 'text/html' });
             const blobUrl = URL.createObjectURL(blob);
             setSrc(blobUrl);
             setInput(`local://${initialProps.filePath}`);
             setUrl(`local://${initialProps.filePath}`);
          }
      }
  }, [initialProps]);

  const handleGo = () => {
    let target = input;
    if (!target.startsWith('http') && !target.startsWith('local://')) {
        target = `https://www.google.com/search?igu=1&q=${encodeURIComponent(target)}`;
    }
    setSrc(target);
    setUrl(target);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <div className="h-10 bg-slate-200 border-b border-slate-300 flex items-center px-2 gap-2">
        <div className="flex gap-1 text-slate-600">
            <button className="p-1 hover:bg-slate-300 rounded"><ArrowLeft size={16} /></button>
            <button className="p-1 hover:bg-slate-300 rounded"><ArrowRight size={16} /></button>
            <button className="p-1 hover:bg-slate-300 rounded"><RotateCw size={16} /></button>
            <button className="p-1 hover:bg-slate-300 rounded" onClick={() => {
                setSrc('https://www.google.com/search?igu=1');
                setInput('https://www.google.com/search?igu=1');
            }}><Home size={16} /></button>
        </div>
        <div className="flex-1 bg-white rounded-full h-7 border border-slate-300 px-3 flex items-center">
            {input.startsWith('https') ? <Search size={12} className="text-slate-400 mr-2" /> : <Home size={12} className="text-slate-400 mr-2" />}
            <input 
                className="flex-1 outline-none text-sm text-slate-700 bg-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            />
        </div>
      </div>
      <div className="flex-1 bg-white relative">
        <iframe 
            src={src} 
            className="w-full h-full border-none" 
            title="browser"
            sandbox="allow-scripts allow-same-origin allow-forms" // Security
        />
      </div>
    </div>
  );
};

export default Browser;
