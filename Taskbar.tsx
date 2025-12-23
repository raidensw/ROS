import React, { useState, useEffect } from 'react';
import { AppConfig, WindowState } from '../types';
import { LayoutGrid, Wifi, Volume2, Battery } from 'lucide-react';
import { format } from 'date-fns';

interface TaskbarProps {
  apps: Record<string, AppConfig>;
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (appId: string) => void;
  onToggleMinimize: (windowId: string) => void;
  onToggleStartMenu: () => void;
  isStartOpen: boolean;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
  apps, 
  windows, 
  activeWindowId, 
  onOpenApp, 
  onToggleMinimize, 
  onToggleStartMenu,
  isStartOpen
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Group windows by app to show indicators
  const getAppStatus = (appId: string) => {
    const appWindows = windows.filter(w => w.appId === appId);
    const isOpen = appWindows.length > 0;
    const isActive = appWindows.some(w => w.id === activeWindowId && !w.isMinimized);
    return { isOpen, isActive };
  };

  // Pinned apps (all defined apps for this demo)
  const pinnedApps = Object.values(apps) as AppConfig[];

  return (
    <div className="absolute bottom-0 w-full h-12 bg-slate-900/60 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-2 z-[9999]">
      
      {/* Start & Pinned */}
      <div className="flex items-center gap-1 h-full">
        <button 
            onClick={onToggleStartMenu}
            className={`h-10 w-10 flex items-center justify-center rounded transition-all duration-200 hover:bg-white/10 active:scale-95 ${isStartOpen ? 'bg-white/10' : ''}`}
        >
          <LayoutGrid className="text-blue-400" />
        </button>

        <div className="w-[1px] h-6 bg-white/10 mx-2" />

        {pinnedApps.map(app => {
          const { isOpen, isActive } = getAppStatus(app.id);
          return (
            <button
              key={app.id}
              onClick={() => {
                // If open, toggle minimize of the most recent window of this type, else open new
                if (isOpen) {
                    const lastWin = windows.filter(w => w.appId === app.id).pop();
                    if(lastWin) onToggleMinimize(lastWin.id);
                } else {
                    onOpenApp(app.id);
                }
              }}
              className={`relative group h-10 w-10 flex items-center justify-center rounded hover:bg-white/10 transition-all active:scale-95 ${isActive ? 'bg-white/10' : ''}`}
            >
              <app.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'opacity-80'}`} />
              {isOpen && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'w-4 bg-blue-400' : 'bg-slate-400'}`} />
              )}
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none whitespace-nowrap">
                {app.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-3 px-3 h-full hover:bg-white/5 rounded transition-colors cursor-default text-xs text-white/80">
        <div className="flex flex-col items-end leading-none gap-0.5">
            <span className="font-medium">{format(time, 'HH:mm')}</span>
            <span className="text-[10px] opacity-70">{format(time, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex gap-2 pl-2 border-l border-white/10">
            <Wifi size={14} />
            <Volume2 size={14} />
            <Battery size={14} />
        </div>
      </div>
    </div>
  );
};

export default Taskbar;