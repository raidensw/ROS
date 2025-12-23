import React from 'react';
import { LucideIcon } from 'lucide-react';

export enum AppId {
  TERMINAL = 'terminal',
  NOTEPAD = 'notepad',
  EXPLORER = 'explorer',
  SETTINGS = 'settings',
  MONITOR = 'monitor',
  MEDIA = 'media',
  BROWSER = 'browser',
  CODE = 'code',
}

export interface AppConfig {
  id: AppId;
  title: string;
  icon: LucideIcon;
  defaultWidth: number;
  defaultHeight: number;
  component: React.FC<WindowProps>;
}

export interface WindowState {
  id: string; // Unique instance ID
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  props?: any; // Extra props to pass to the component (e.g. file path)
}

export interface WindowProps {
  windowId: string;
  isActive: boolean;
  onExecuteCommand?: (command: string, args: any) => void;
  initialProps?: any;
}

export type FileType = 'file' | 'folder';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  content?: string; // For text/code files
  children?: Record<string, FileSystemNode>; // For folders
  parentId?: string;
}

export type Theme = 'dark' | 'light' | 'cyberpunk' | 'retro';

export interface SystemState {
  theme: Theme;
  wallpaper: string;
  volume: number;
  brightness: number;
}
