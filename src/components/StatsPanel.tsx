"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface StatsPanelProps {
  activeTab: 'chart' | 'logs';
  setActiveTab: (tab: 'chart' | 'logs') => void;
  balance: number;
  tradeCount: number;
  chartData: any[];
  logs: string[];
}

const StatsPanel = ({
  activeTab,
  setActiveTab,
  balance,
  tradeCount,
  chartData,
  logs
}: StatsPanelProps) => {
  return (
    <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl min-h-0">
      <div className="bg-zinc-900/80 border-b border-zinc-800 px-1 py-1 flex items-center gap-1 shrink-0">
        <button 
          onClick={() => setActiveTab('chart')} 
          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${
            activeTab === 'chart' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BarChart2 className="w-3 h-3" /> CHART
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${
            activeTab === 'logs' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Info className="w-3 h-3"/> LOGS
        </button>
      </div>
      <div className="p-2 flex-1 overflow-y-auto min-h-0">
        {activeTab === 'chart' ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-end mb-1">
              <div>
                <div className="text-[9px] text-zinc-500 font-mono">NET PNL</div>
                <div className={`text-sm font-bold font-mono ${balance >= 1000 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {balance >= 1000 ? '+' : '-'}${Math.abs(balance - 1000).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-zinc-500 font-mono">TRADES</div>
                <div className="text-xs font-bold text-white font-mono">{tradeCount}</div>
              </div>
            </div>
            <div className="flex-1 min-h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', padding: '4px' }} 
                    itemStyle={{ color: '#34d399' }} 
                    formatter={(v: number) => [`$${v.toFixed(2)}`, 'Balance']} 
                    labelFormatter={(l) => `Trade ${l}`}
                  />
                  <ReferenceLine y={1000} stroke="#3f3f46" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={balance >= 1000 ? '#34d399' : '#ef4444'} 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-1 flex flex-col justify-end h-full font-mono text-[9px] sm:text-[10px]">
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -5 }} 
                animate={{ opacity: 1, x: 0 }} 
                className={`flex gap-1 ${
                  log.includes('PROFIT') || log.includes('WON') 
                    ? 'text-emerald-400' 
                    : log.includes('Loss') || log.includes('RUGGED') || log.includes('failed') 
                      ? 'text-red-400' 
                      : log.includes('API') 
                        ? 'text-blue-400' 
                        : 'text-zinc-500'
                }`}
              >
                <span className="shrink-0">{'>'}</span>
                <span className="break-all">{log}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;