import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { WindowState } from '../types';

interface DesktopWindowProps {
  windowState: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

const DesktopWindow: React.FC<DesktopWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  children
}) => {
  const { id, title, x, y, width, height, isMinimized, isMaximized, zIndex } = windowState;
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && !isMaximized) {
        onMove(id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
      }
    };
    
    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, id, onMove, isMaximized]);

  const handleMouseDown = (e: React.PointerEvent) => {
    onFocus(id);
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    if (!isMaximized) {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - x,
        y: e.clientY - y
      };
    }
  };

  if (isMinimized) return null;

  const activeClass = isActive ? 'border-white/20 shadow-2xl shadow-black/50' : 'border-white/5 shadow-lg opacity-90';
  const positionStyle = isMaximized 
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', transform: 'none' } 
    : { transform: `translate(${x}px, ${y}px)`, width, height };

  return (
    <div
      className={`absolute flex flex-col rounded-lg overflow-hidden bg-slate-900/80 backdrop-blur-xl border transition-colors duration-200 ${activeClass}`}
      style={{
        zIndex,
        ...positionStyle,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out, width 0.2s, height 0.2s'
      }}
      onPointerDown={() => onFocus(id)}
    >
      {/* Title Bar */}
      <div 
        className="h-9 flex items-center justify-between px-3 select-none bg-white/5 cursor-default"
        onPointerDown={handleMouseDown}
        onDoubleClick={() => onMaximize(id)}
      >
        <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
          {title}
        </div>
        <div className="window-controls flex items-center gap-2">
           <button onClick={(e) => { e.stopPropagation(); onMinimize(id); }} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
            <Minus size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(id); }} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
            {isMaximized ? <MinimizeIcon /> : <Square size={12} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(id); }} className="p-1 hover:bg-red-500/80 rounded text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Blocker to prevent iframe capture of clicks during drag/blur, if we used iframes. Not needed for React components but good practice. */}
        {!isActive && <div className="absolute inset-0 bg-transparent z-50" />} 
        {children}
      </div>
    </div>
  );
};

// Helper icon
const MinimizeIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="14" width="10" height="10" rx="2" ry="2"></rect>
        <path d="M16 14v-2a2 2 0 0 0-2-2H4"></path>
    </svg>
)

export default DesktopWindow;
