import React from 'react';
import { AppConfig } from '../types';
import { Search, Power } from 'lucide-react';

interface StartMenuProps {
  apps: Record<string, AppConfig>;
  isOpen: boolean;
  onOpenApp: (appId: string) => void;
  onClose: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ apps, isOpen, onOpenApp, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 left-2 w-[400px] h-[500px] bg-slate-900/90 backdrop-blur-2xl rounded-lg border border-white/10 shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="flex items-center bg-black/20 border border-white/10 rounded-md px-3 py-2">
          <Search size={16} className="text-white/40 mr-2" />
          <input 
            type="text" 
            placeholder="Type to search..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full"
            autoFocus
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 mb-3 px-1">Pinned</div>
        <div className="grid grid-cols-4 gap-4">
          {(Object.values(apps) as AppConfig[]).map(app => (
            <button
              key={app.id}
              onClick={() => { onOpenApp(app.id); onClose(); }}
              className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 group-hover:border-white/20 shadow-sm">
                <app.icon className="w-6 h-6 text-slate-200" />
              </div>
              <span className="text-[11px] text-slate-300">{app.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/20 border-t border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                 U
             </div>
             <div className="text-xs">
                 <div className="font-medium text-slate-200">User</div>
                 <div className="text-slate-500">Administrator</div>
             </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Power size={18} className="text-slate-300" />
        </button>
      </div>
    </div>
  );
};

export default StartMenu;