import React, { useState } from 'react';
import { WindowProps } from '../../types';

const Notepad: React.FC<WindowProps> = () => {
  const [text, setText] = useState('Welcome to ROS.\n\nThis is a persistent scratchpad.');

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900">
        <div className="bg-slate-200 p-1 px-3 text-xs flex gap-2 border-b border-slate-300">
            <span className="hover:bg-slate-300 px-1 rounded cursor-pointer">File</span>
            <span className="hover:bg-slate-300 px-1 rounded cursor-pointer">Edit</span>
            <span className="hover:bg-slate-300 px-1 rounded cursor-pointer">View</span>
        </div>
      <textarea
        className="flex-1 p-4 w-full h-full resize-none outline-none bg-white font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      <div className="bg-slate-100 border-t border-slate-300 p-1 px-3 text-xs text-slate-500 flex justify-between">
          <span>UTF-8</span>
          <span>Ln {text.split('\n').length}, Col {text.length}</span>
      </div>
    </div>
  );
};

export default Notepad;