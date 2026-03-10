"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface Suit {
  id: string;
  symbol: string;
  color: string;
  type: string;
}

interface GamblePanelProps {
  winAmount: number;
  gambleCard: Suit | null;
  houseLiquidity: number;
  onGamble: (type: 'RED' | 'BLACK' | 'SUIT', suitId?: string) => void;
  onCollect: () => void;
  suits: Suit[];
}

const GamblePanel = ({
  winAmount,
  gambleCard,
  houseLiquidity,
  onGamble,
  onCollect,
  suits
}: GamblePanelProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }} 
      animate={{ opacity: 1, height: 'auto' }} 
      exit={{ opacity: 0, height: 0 }} 
      className="bg-zinc-900 border border-purple-500/50 rounded-xl p-2 shadow-[0_0_20px_rgba(168,85,247,0.15)] shrink-0 overflow-hidden"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-between items-center w-full">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Gamble Profit</span>
          <span className="text-sm font-mono font-bold text-white">${winAmount.toFixed(2)}</span>
        </div>
        <div className="w-12 h-16 bg-white rounded flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          {gambleCard ? (
            <span className={gambleCard.color}>{gambleCard.symbol}</span>
          ) : (
            <div className="w-full h-full bg-zinc-800 rounded border border-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-zinc-600" />
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-1">
          <div className="flex gap-1">
            <button 
              onClick={() => onGamble('RED')} 
              disabled={!!gambleCard || houseLiquidity < winAmount} 
              className="flex-1 py-1 bg-red-500 hover:bg-red-400 text-white font-bold rounded text-[9px] disabled:opacity-50"
            >
              RED (2x)
            </button>
            <button 
              onClick={() => onGamble('BLACK')} 
              disabled={!!gambleCard || houseLiquidity < winAmount} 
              className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-[9px] disabled:opacity-50"
            >
              BLACK (2x)
            </button>
          </div>
          <div className="flex gap-1">
            {suits.map(s => (
              <button 
                key={s.id} 
                onClick={() => onGamble('SUIT', s.id)} 
                disabled={!!gambleCard || houseLiquidity < (winAmount * 3)} 
                className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm rounded flex justify-center disabled:opacity-50"
              >
                <span className={s.color}>{s.symbol}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={onCollect} 
            disabled={!!gambleCard} 
            className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold rounded text-[9px] transition-colors disabled:opacity-50 mt-1"
          >
            Take Win & Exit
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GamblePanel;