"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface AIComponentProps {
  aiAlpha: string;
  isAiLoading: boolean;
  onRefreshAi: () => void;
  balance: number;
  tradeCount: number;
  sentimentData: {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    status: string;
    score: number;
  };
}

export default function AIComponent({
  aiAlpha,
  isAiLoading,
  onRefreshAi,
  balance,
  tradeCount,
  sentimentData
}: AIComponentProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'insights'>('analysis');

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'text-emerald-400';
      case 'BEARISH': return 'text-red-400';
      case 'NEUTRAL': return 'text-amber-400';
      default: return 'text-zinc-400';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'BEARISH': return 'bg-red-500/10 border-red-500/30';
      case 'NEUTRAL': return 'bg-amber-500/10 border-amber-500/30';
      default: return 'bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">DegenBot Analysis</span>
        </div>
        <button
          onClick={onRefreshAi}
          disabled={isAiLoading}
          className="p-1 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-zinc-500 ${isAiLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-1 text-[8px] font-medium rounded transition-all ${
            activeTab === 'analysis'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-1 text-[8px] font-medium rounded transition-all ${
            activeTab === 'insights'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
          }`}
        >
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'analysis' && (
          <div className="space-y-3">
            {/* Market Sentiment */}
            <div className={`p-2 rounded-lg border ${getSentimentBg(sentimentData.sentiment)}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-zinc-400">Market Sentiment</span>
                <div className="flex items-center gap-1">
                  {sentimentData.sentiment === 'BULLISH' && <TrendingUp size={10} className="text-emerald-400" />}
                  {sentimentData.sentiment === 'BEARISH' && <TrendingDown size={10} className="text-red-400" />}
                  {sentimentData.sentiment === 'NEUTRAL' && <Minus size={10} className="text-amber-400" />}
                  <span className={`text-[8px] font-bold ${getSentimentColor(sentimentData.sentiment)}`}>
                    {sentimentData.sentiment}
                  </span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-zinc-300">
                {sentimentData.status}
              </div>
              <div className="mt-1 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${sentimentData.score}%` }}
                  className={`h-full ${
                    sentimentData.sentiment === 'BULLISH' ? 'bg-emerald-500' :
                    sentimentData.sentiment === 'BEARISH' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* AI Alpha */}
            <div className="bg-zinc-950/50 border border-purple-500/20 rounded-lg p-3 font-mono text-[11px] leading-relaxed">
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
              
              <div className="mt-4 text-[8px] text-zinc-600 uppercase tracking-tighter flex items-center gap-1">
                <Zap size={8} className="text-purple-400" />
                Powered by Gemini 1.5 Flash
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-2">
            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-2">AI Insights</div>
            
            {/* Performance Insight */}
            <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-blue-400">Performance</span>
                <span className="text-[8px] font-mono text-zinc-500">
                  {tradeCount} trades
                </span>
              </div>
              <div className="text-[9px] text-zinc-300">
                {balance > 1000 ? (
                  <span className="text-emerald-400">You're outperforming the market! Consider scaling up.</span>
                ) : balance < 900 ? (
                  <span className="text-red-400">Your balance is down. Consider reducing bet sizes.</span>
                ) : (
                  <span className="text-amber-400">You're near break-even. Stay consistent.</span>
                )}
              </div>
            </div>

            {/* Risk Insight */}
            <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-amber-400">Risk Assessment</span>
              </div>
              <div className="text-[9px] text-zinc-300">
                {balance > 5000 ? (
                  <span className="text-red-400">High balance detected. Consider taking profits.</span>
                ) : balance < 500 ? (
                  <span className="text-emerald-400">Low balance - good time to build position.</span>
                ) : (
                  <span className="text-zinc-300">Your risk level is appropriate for your balance.</span>
                )}
              </div>
            </div>

            {/* Market Insight */}
            <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-purple-400">Market Signal</span>
              </div>
              <div className="text-[9px] text-zinc-300">
                {sentimentData.sentiment === 'BULLISH' ? (
                  <span className="text-emerald-400">Market is pumping! Time to be aggressive.</span>
                ) : sentimentData.sentiment === 'BEARISH' ? (
                  <span className="text-red-400">Market is dumping. Time to be defensive.</span>
                ) : (
                  <span className="text-amber-400">Market is choppy. Wait for clear signals.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}