import React, { useRef } from 'react';
import { WindowProps } from '../../types';
import { Download, Upload, RefreshCcw, Image, Monitor } from 'lucide-react';
import { fileSystem } from '../../services/fileSystemService';

const Settings: React.FC<WindowProps> = ({ onExecuteCommand }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = fileSystem.exportSystem();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ros-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (fileSystem.importSystem(content)) {
        alert('System restored successfully! The interface will now refresh.');
        window.location.reload();
      } else {
        alert('Failed to import: Invalid system file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
      if (confirm('Are you sure you want to factory reset ROS? All files will be lost.')) {
          fileSystem.resetSystem();
          window.location.reload();
      }
  };

  const setWallpaper = (url: string) => {
      // We essentially just "run" the command via the OS handler
      if (onExecuteCommand) {
        // We need to implement a specific wallpaper setter in App.tsx or just use the random one for now
        // For this demo, we'll trigger the random one, but in a real app this would update state directly
        onExecuteCommand('changeWallpaper', {}); 
      }
  };

  return (
    <div className="h-full bg-slate-100 text-slate-900 flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-light mb-6 border-b border-slate-300 pb-2">System Settings</h2>

        <div className="space-y-8">
            {/* Personalization */}
            <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Monitor size={16} /> Personalization
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Desktop Wallpaper</div>
                            <div className="text-xs text-slate-500">Cycle through scenic backgrounds</div>
                        </div>
                        <button 
                            onClick={() => setWallpaper('')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
                        >
                            <Image size={16} /> Change Wallpaper
                        </button>
                    </div>
                </div>
            </section>

            {/* Data Management */}
            <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <RefreshCcw size={16} /> Data & Storage
                </h3>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <div className="font-medium">Backup System</div>
                            <div className="text-xs text-slate-500">Download your entire file system as a .json file</div>
                        </div>
                        <button 
                            onClick={handleExport}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
                        >
                            <Download size={16} /> Export Data
                        </button>
                    </div>

                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <div className="font-medium">Restore System</div>
                            <div className="text-xs text-slate-500">Load a previous backup file</div>
                        </div>
                        <button 
                            onClick={handleImportClick}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
                        >
                            <Upload size={16} /> Import Data
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                    </div>

                    <div className="p-4 bg-red-50 flex items-center justify-between">
                        <div>
                            <div className="font-medium text-red-600">Factory Reset</div>
                            <div className="text-xs text-red-400">Wipe all local data and reset to default</div>
                        </div>
                        <button 
                            onClick={handleReset}
                            className="border border-red-200 hover:bg-red-100 text-red-600 px-4 py-2 rounded text-sm transition-colors"
                        >
                            Reset OS
                        </button>
                    </div>

                </div>
            </section>
        </div>
      </div>
      
      <div className="mt-auto p-4 text-center text-xs text-slate-400 border-t border-slate-200">
          ROS Build 2024.1.0 • Running in Virtualized Environment
      </div>
    </div>
  );
};

export default Settings;