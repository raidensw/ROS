import React, { useState, useEffect } from 'react';
import { WindowProps } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateData = (prev: any[]) => {
  const newTime = new Date().toLocaleTimeString();
  const newCpu = Math.floor(Math.random() * 40) + 30 + (Math.random() > 0.8 ? 30 : 0); // Random spikes
  const newMem = Math.floor(Math.random() * 20) + 40;
  
  const newData = [...prev, { time: newTime, cpu: newCpu, mem: newMem }];
  if (newData.length > 20) newData.shift();
  return newData;
};

const SystemMonitor: React.FC<WindowProps> = () => {
  const [data, setData] = useState<any[]>([
      { time: '10:00:00', cpu: 20, mem: 40 },
      { time: '10:00:05', cpu: 25, mem: 42 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(current => generateData(current));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 h-1/2">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col">
                <h3 className="text-xs uppercase tracking-wider text-blue-400 mb-2">CPU Usage</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-right text-2xl font-mono text-blue-400 mt-1">{data[data.length-1].cpu}%</div>
            </div>
             <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col">
                <h3 className="text-xs uppercase tracking-wider text-purple-400 mb-2">Memory Usage</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Area type="monotone" dataKey="mem" stroke="#a855f7" fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-right text-2xl font-mono text-purple-400 mt-1">{data[data.length-1].mem}%</div>
            </div>
        </div>
        
        <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10 overflow-auto font-mono text-xs text-slate-400">
            <div className="text-green-400 border-b border-white/10 pb-1 mb-2">Processes</div>
            <div className="flex justify-between py-1"><span>System</span><span>Running</span></div>
            <div className="flex justify-between py-1"><span>WindowServer</span><span>Running</span></div>
            <div className="flex justify-between py-1"><span>GeminiKernel</span><span>Active</span></div>
            <div className="flex justify-between py-1"><span>ReactRenderer</span><span>Active</span></div>
            <div className="flex justify-between py-1"><span>NetworkService</span><span>Idle</span></div>
        </div>
    </div>
  );
};

export default SystemMonitor;
