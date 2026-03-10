"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketSentimentProps {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  status: string;
  score: number;
}

const MarketSentiment = ({ sentiment, status, score }: MarketSentimentProps) => {
  const color = sentiment === 'BULLISH' ? 'text-emerald-400' : sentiment === 'BEARISH' ? 'text-red-400' : 'text-zinc-400';
  const Icon = sentiment === 'BULLISH' ? TrendingUp : sentiment === 'BEARISH' ? TrendingDown : Minus;

  return (
    <div className="flex items-center gap-3 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full shadow-inner">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className={`text-[10px] font-black tracking-tighter ${color}`}>{sentiment}</span>
      </div>
      <div className="h-3 w-[1px] bg-zinc-800" />
      <div className="flex flex-col">
        <motion.span 
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] font-mono font-bold text-zinc-500 uppercase truncate max-w-[120px]"
        >
          {status}
        </motion.span>
      </div>
      <div className="hidden sm:block w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className={`h-full ${sentiment === 'BULLISH' ? 'bg-emerald-500' : sentiment === 'BEARISH' ? 'bg-red-500' : 'bg-zinc-500'}`}
        />
      </div>
    </div>
  );
};

export default MarketSentiment;