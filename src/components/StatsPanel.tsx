"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Info, Brain, RefreshCw, Trophy, History } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface TradeRecord {
  trade_id: number;
  bet_amount: number;
  risk_level: string;
  is_win: boolean;
  win_amount: number;
  strategy_name: string;
  timestamp: string;
}

interface StatsPanelProps {
  activeTab: 'chart' | 'history' | 'ai' | 'leaderboard' | 'logs';
  setActiveTab: (tab: 'chart' | 'history' | 'ai' | 'leaderboard' | 'logs') => void;
  balance: number;
  tradeCount: number;
  chartData: any[];
  logs: string[];
  aiAlpha: string;
  isAiLoading: boolean;
  onRefreshAi: () => void;
  leaderboard: { address: string, balance: number }[];
  tradeHistory: TradeRecord[];
  currentAddress: string;
}

const StatsPanel = ({
  activeTab,
  setActiveTab,
  balance,
  tradeCount,
  chartData,
  logs,
  aiAlpha,
  isAiLoading,
  onRefreshAi,
  leaderboard,
  tradeHistory,
  currentAddress
}: StatsPanelProps) => {
  return (
    <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl min-h-0">
      <div className="bg-zinc-900/80 border-b border-zinc-800 px-1 py-1 flex items-center gap-0.5 shrink-0 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('chart')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'chart' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BarChart2 className="w-3 h-3" /> CHART
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'history' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <History className="w-3 h-3"/> HISTORY
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'ai' ? 'bg-zinc-800 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Brain className="w-3 h-3"/> AI
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'leaderboard' ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Trophy className="w-3 h-3"/> RANKS
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'logs' ? 'bg-zinc-900 text-zinc-400' : 'text-zinc-600 hover:text-zinc-400'
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
        ) : activeTab === 'history' ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Trade History</span>
              <span className="text-[8px] text-zinc-500 font-mono uppercase">Last {tradeHistory.length} TXs</span>
            </div>
            <div className="flex-1 space-y-1.5">
              {tradeHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono italic">
                  No trades executed yet...
                </div>
              ) : (
                tradeHistory.map((trade) => (
                  <div key={trade.trade_id} className="bg-zinc-900/50 border border-zinc-800 rounded p-1.5 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">{trade.strategy_name}</span>
                      <span className={`text-[10px] font-mono font-bold ${trade.is_win ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.is_win ? `+$${trade.win_amount.toFixed(2)}` : `-$${trade.bet_amount.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                      <div className="flex gap-2">
                        <span>SIZE: ${trade.bet_amount}</span>
                        <span>RISK: {trade.risk_level}</span>
                      </div>
                      <span>{new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'ai' ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">DegenBot Analysis</span>
              <button 
                onClick={onRefreshAi} 
                disabled={isAiLoading}
                className="p-1 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-zinc-500 ${isAiLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex-1 bg-zinc-950/50 border border-purple-500/20 rounded-lg p-3 font-mono text-[11px] leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              {isAiLoading ? (
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-3/4 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-zinc-800 animate-pulse rounded" />
                </div>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-purple-300"
                >
                  {aiAlpha}
                </motion.p>
              )}
              <div className="mt-4 text-[8px] text-zinc-600 uppercase tracking-tighter">
                Powered by Gemini 1.5 Flash
              </div>
            </div>
          </div>
        ) : activeTab === 'leaderboard' ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">Top Degens</span>
              <Trophy className="w-3 h-3 text-yellow-500" />
            </div>
            <div className="flex-1 space-y-1">
              {leaderboard.map((user, i) => (
                <div 
                  key={user.address} 
                  className={`flex justify-between items-center p-1.5 rounded border ${
                    user.address === currentAddress 
                      ? 'bg-yellow-500/10 border-yellow-500/50' 
                      : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold w-3 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    ${user.balance.toFixed(0)}
                  </span>
                </div>
              ))}
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