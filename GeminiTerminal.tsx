import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal as TerminalIcon, Cpu } from 'lucide-react';
import { createChatSession, ChatMessage, performFileSystemAction } from '../../services/geminiService';
import { fileSystem } from '../../services/fileSystemService';
import { WindowProps } from '../../types';
import { GenerateContentResponse } from "@google/genai";

interface GeminiTerminalProps extends WindowProps {
  onExecuteCommand: (command: string, args: any) => void;
}

const GeminiTerminal: React.FC<GeminiTerminalProps> = ({ isActive, onExecuteCommand }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'ROS Kernel v2.0 initialized.\nVirtual File System Online.\nType "help" for commands or ask AI.' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cwd, setCwd] = useState('/home/user'); // Current Working Directory
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatSession = useRef(createChatSession());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const addToHistory = (role: 'user' | 'model', text: string) => {
      setHistory(prev => [...prev, { role, text }]);
  };

  const processLocalCommand = (cmdStr: string): boolean => {
      const parts = cmdStr.trim().split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      switch(cmd) {
          case 'help':
              addToHistory('model', 'Available commands:\n  ls - List directory\n  cd <path> - Change directory\n  cat <file> - Read file\n  mkdir <name> - Create directory\n  rm <name> - Remove file/folder\n  pwd - Print working directory\n  clear - Clear screen\n  \n  Or just ask Gemini to do anything!');
              return true;
          case 'clear':
              setHistory([]);
              return true;
          case 'pwd':
              addToHistory('model', cwd);
              return true;
          case 'ls':
              const files = fileSystem.readDir(cwd);
              addToHistory('model', files.length > 0 ? files.join('  ') : '(empty)');
              return true;
          case 'cd':
              const target = args[0];
              if (!target) { addToHistory('model', cwd); return true; }
              let newPath = target.startsWith('/') ? target : `${cwd === '/' ? '' : cwd}/${target}`;
              if (target === '..') {
                  const parts = cwd.split('/').filter(p => p);
                  parts.pop();
                  newPath = parts.length === 0 ? '/' : '/' + parts.join('/');
              }
              const node = fileSystem.resolvePath(newPath);
              if (node && node.type === 'folder') {
                  setCwd(newPath);
              } else {
                  addToHistory('model', `cd: no such file or directory: ${target}`);
              }
              return true;
          case 'mkdir':
              if (!args[0]) { addToHistory('model', 'mkdir: missing operand'); return true; }
              const successMk = fileSystem.makeDir(`${cwd}/${args[0]}`);
              if (!successMk) addToHistory('model', 'mkdir: failed to create directory');
              return true;
          case 'cat':
             if (!args[0]) { addToHistory('model', 'cat: missing operand'); return true; }
             const content = fileSystem.readFile(`${cwd}/${args[0]}`);
             if (content === null) addToHistory('model', `cat: ${args[0]}: No such file`);
             else addToHistory('model', content);
             return true;
          case 'rm':
             if (!args[0]) { addToHistory('model', 'rm: missing operand'); return true; }
             const successRm = fileSystem.delete(`${cwd}/${args[0]}`);
             if (successRm) addToHistory('model', 'Deleted.');
             else addToHistory('model', 'rm: failed to delete');
             return true;
          default:
              return false; // Not a local command, pass to AI
      }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg = input;
    setInput('');
    addToHistory('user', userMsg);

    // Try local command first
    if (processLocalCommand(userMsg)) return;

    setIsProcessing(true);

    try {
      const result = await chatSession.current.sendMessage({ message: userMsg });
      
      const functionCalls = result.functionCalls;
      let responseText = result.text || '';

      if (functionCalls && functionCalls.length > 0) {
        const functionResponses = [];
        for (const call of functionCalls) {
           let toolResult: any = { result: 'success' };
           
           if (['openApp', 'closeApp', 'changeWallpaper'].includes(call.name)) {
                onExecuteCommand(call.name, call.args);
                responseText += `\n> System: Executing ${call.name}...`;
           } else {
               // File System actions
               toolResult = performFileSystemAction(call.name, call.args);
               responseText += `\n> FS: ${call.name} ${JSON.stringify(call.args)}`;
           }

           functionResponses.push({
             name: call.name,
             response: toolResult,
             id: call.id
           });
        }

        const nextResult = await chatSession.current.sendMessage({
             message: functionResponses.map(fr => ({ functionResponse: fr }))
        });
        if (nextResult.text) {
          responseText += `\n${nextResult.text}`;
        }
      }

      addToHistory('model', responseText);

    } catch (error) {
      console.error(error);
      addToHistory('model', 'Error: Connection to Neural Core interrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-black/90 text-green-400 font-mono text-sm p-1">
      <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={scrollRef}>
        {history.map((msg, idx) => (
          <div key={idx} className={`${msg.role === 'user' ? 'text-blue-300' : 'text-green-400'}`}>
            <span className="opacity-50 mr-2">{msg.role === 'user' ? '>' : '$'}</span>
            <span className="whitespace-pre-wrap">{msg.text}</span>
          </div>
        ))}
        {isProcessing && (
          <div className="text-green-400 opacity-70 animate-pulse">
            # Processing neural request...
          </div>
        )}
      </div>
      <div className="p-2 border-t border-white/10 flex items-center bg-black/40">
        <span className="text-green-500 mr-2 font-bold">{cwd} $</span>
        <input
          autoFocus={isActive}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/20"
          placeholder="Enter command..."
        />
        <button onClick={handleSend} disabled={isProcessing} className="p-2 hover:bg-white/10 rounded">
          {isProcessing ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default GeminiTerminal;