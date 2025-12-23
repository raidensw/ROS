import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  FileText, 
  Settings as SettingsIcon,
  Folder, 
  Monitor, 
  Image as ImageIcon,
  Globe,
  Code2
} from 'lucide-react';

import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import DesktopWindow from './components/DesktopWindow';
import GeminiTerminal from './components/apps/GeminiTerminal';
import Notepad from './components/apps/Notepad';
import SystemMonitor from './components/apps/SystemMonitor';
import FileExplorer from './components/apps/FileExplorer';
import CodeStudio from './components/apps/CodeStudio';
import Browser from './components/apps/Browser';
import Settings from './components/apps/Settings'; // New Import

import { AppId, AppConfig, WindowState, SystemState } from './types';
import { INITIAL_WALLPAPER } from './constants';

// --- App Definitions ---
const APPS: Record<string, AppConfig> = {
  [AppId.TERMINAL]: {
    id: AppId.TERMINAL,
    title: 'Terminal',
    icon: Terminal,
    defaultWidth: 600,
    defaultHeight: 400,
    component: (props: any) => <GeminiTerminal {...props} />
  },
  [AppId.EXPLORER]: {
    id: AppId.EXPLORER,
    title: 'File Explorer',
    icon: Folder,
    defaultWidth: 600,
    defaultHeight: 450,
    component: (props: any) => <FileExplorer {...props} />
  },
  [AppId.BROWSER]: {
    id: AppId.BROWSER,
    title: 'Browser',
    icon: Globe,
    defaultWidth: 800,
    defaultHeight: 600,
    component: (props: any) => <Browser {...props} />
  },
  [AppId.CODE]: {
    id: AppId.CODE,
    title: 'Code Studio',
    icon: Code2,
    defaultWidth: 700,
    defaultHeight: 500,
    component: (props: any) => <CodeStudio {...props} />
  },
  [AppId.NOTEPAD]: {
    id: AppId.NOTEPAD,
    title: 'Notepad',
    icon: FileText,
    defaultWidth: 500,
    defaultHeight: 400,
    component: Notepad
  },
  [AppId.MONITOR]: {
    id: AppId.MONITOR,
    title: 'System Monitor',
    icon: Monitor,
    defaultWidth: 500,
    defaultHeight: 350,
    component: SystemMonitor
  },
  [AppId.MEDIA]: {
      id: AppId.MEDIA,
      title: 'Gallery',
      icon: ImageIcon,
      defaultWidth: 600,
      defaultHeight: 500,
      component: () => (
          <div className="h-full bg-black flex items-center justify-center overflow-hidden">
             <img src="https://picsum.photos/600/500" className="max-w-full max-h-full object-contain" alt="Gallery" />
          </div>
      )
  },
  [AppId.SETTINGS]: {
      id: AppId.SETTINGS,
      title: 'Settings',
      icon: SettingsIcon,
      defaultWidth: 500,
      defaultHeight: 550,
      component: (props: any) => <Settings {...props} />
  }
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(10);
  const [isStartOpen, setIsStartOpen] = useState(false);
  
  const [systemState, setSystemState] = useState<SystemState>({
    theme: 'dark',
    wallpaper: INITIAL_WALLPAPER,
    volume: 50,
    brightness: 100
  });

  // --- Window Manager Actions ---

  const openApp = (appId: string, props?: any) => {
    const app = APPS[appId];
    if (!app) return;

    const newWindow: WindowState = {
      id: Date.now().toString(),
      appId: app.id as AppId,
      title: app.title,
      x: 50 + (windows.length * 30),
      y: 50 + (windows.length * 30),
      width: app.defaultWidth,
      height: app.defaultHeight,
      zIndex: zIndexCounter + 1,
      isMinimized: false,
      isMaximized: false,
      props: props
    };

    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setZIndexCounter(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: zIndexCounter + 1 } : w
    ));
    setZIndexCounter(prev => prev + 1);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const maximizeWindow = (id: string) => {
      setWindows(prev => prev.map(w =>
          w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ));
      focusWindow(id);
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, x, y } : w
    ));
  };

  const toggleStartMenu = () => setIsStartOpen(prev => !prev);

  // --- OS Command Interface (for Gemini) ---
  
  const executeCommand = (command: string, args: any) => {
      console.log('Executing OS Command:', command, args);
      switch(command) {
          case 'openApp':
              if (args.appId && APPS[args.appId]) {
                  openApp(args.appId, { filePath: args.filePath });
              }
              break;
          case 'closeApp':
              if (args.target === 'active' && activeWindowId) {
                  closeWindow(activeWindowId);
              }
              break;
          case 'changeWallpaper':
              const randomId = Math.floor(Math.random() * 100) + 10;
              setSystemState(prev => ({
                  ...prev,
                  wallpaper: `https://picsum.photos/id/${randomId}/1920/1080`
              }));
              break;
          default:
              break;
      }
  };

  // --- Render ---

  return (
    <div 
        className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${systemState.wallpaper})` }}
        onPointerDown={(e) => {
            if(e.target === e.currentTarget) {
                setIsStartOpen(false);
                setActiveWindowId(null);
            }
        }}
    >
        {/* Desktop Icons Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-4 z-0 flex-wrap h-[90%] content-start">
             {Object.values(APPS).filter(a => a.id !== AppId.NOTEPAD).map(app => (
                 <button 
                    key={app.id}
                    onDoubleClick={() => openApp(app.id)}
                    className="flex flex-col items-center gap-1 group w-20 p-2 rounded hover:bg-white/10 transition-colors"
                 >
                     <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:bg-white/10 backdrop-blur-sm">
                        <app.icon className="text-white drop-shadow-md" size={24} />
                     </div>
                     <span className="text-white text-xs drop-shadow font-medium text-center line-clamp-2">{app.title}</span>
                 </button>
             ))}
        </div>

        {/* Windows */}
        {windows.map(win => {
            const AppComp = APPS[win.appId].component;
            return (
                <DesktopWindow
                    key={win.id}
                    windowState={win}
                    isActive={activeWindowId === win.id}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    onFocus={focusWindow}
                    onMove={moveWindow}
                >
                    {/* @ts-ignore */}
                    <AppComp 
                        windowId={win.id} 
                        isActive={activeWindowId === win.id}
                        onExecuteCommand={executeCommand}
                        initialProps={win.props}
                    />
                </DesktopWindow>
            );
        })}

        {/* UI Overlays */}
        <StartMenu 
            apps={APPS} 
            isOpen={isStartOpen} 
            onOpenApp={openApp}
            onClose={() => setIsStartOpen(false)}
        />
        
        <Taskbar 
            apps={APPS}
            windows={windows}
            activeWindowId={activeWindowId}
            onOpenApp={openApp}
            onToggleMinimize={minimizeWindow}
            onToggleStartMenu={toggleStartMenu}
            isStartOpen={isStartOpen}
        />
    </div>
  );
};

export default App;
