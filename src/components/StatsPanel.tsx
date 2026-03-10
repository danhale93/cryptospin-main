"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Brain, RefreshCw, Trophy, History, MessageSquare, Send, Target, CheckCircle2 } from 'lucide-react';
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

interface Message {
  id: number;
  address: string;
  text: string;
  is_ai: boolean;
  timestamp: string;
}

interface StatsPanelProps {
  activeTab: 'chart' | 'history' | 'ai' | 'leaderboard' | 'quests' | 'chat';
  setActiveTab: (tab: any) => void;
  balance: number;
  tradeCount: number;
  chartData: any[];
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
  aiAlpha,
  isAiLoading,
  onRefreshAi,
  leaderboard,
  tradeHistory,
  currentAddress
}: StatsPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: currentAddress, text: inputText })
      });
      setInputText('');
      fetchMessages();
    } catch (e) {}
  };

  const quests = [
    { id: 1, title: 'The High Roller', desc: 'Execute a trade with $100+ size', progress: tradeHistory.some(t => t.bet_amount >= 100) ? 100 : 0 },
    { id: 2, title: 'Risk Taker', desc: 'Win a trade at DEGEN risk level', progress: tradeHistory.some(t => t.risk_level === 'DEGEN' && t.is_win) ? 100 : 0 },
    { id: 3, title: 'Profit Hunter', desc: 'Accumulate $5000 in total balance', progress: Math.min(100, (balance / 5000) * 100) },
    { id: 4, title: 'Veteran Trader', desc: 'Complete 50 total trades', progress: Math.min(100, (tradeCount / 50) * 100) }
  ];

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
          onClick={() => setActiveTab('chat')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'chat' ? 'bg-zinc-800 text-pink-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MessageSquare className="w-3 h-3" /> CHAT
        </button>
        <button 
          onClick={() => setActiveTab('quests')} 
          className={`px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'quests' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Target className="w-3 h-3" /> QUESTS
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
        ) : activeTab === 'chat' ? (
          <ChatComponent 
            messages={messages}
            inputText={inputText}
            setInputText={setInputText}
            handleSendMessage={handleSendMessage}
            currentAddress={currentAddress}
          />
        ) : activeTab === 'quests' ? (
          <QuestComponent 
            quests={quests}
            balance={balance}
            tradeCount={tradeCount}
            tradeHistory={tradeHistory}
          />
        ) : activeTab === 'history' ? (
          <HistoryComponent 
            tradeHistory={tradeHistory}
          />
        ) : activeTab === 'ai' ? (
          <AIComponent 
            aiAlpha={aiAlpha}
            isAiLoading={isAiLoading}
            onRefreshAi={onRefreshAi}
          />
        ) : (
          <LeaderboardComponent 
            leaderboard={leaderboard}
            currentAddress={currentAddress}
          />
        )}
      </div>
    </div>
  );
};

export default StatsPanel;