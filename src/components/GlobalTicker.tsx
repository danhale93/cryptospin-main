"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface GlobalWin {
  address: string;
  amount: number;
  strategy: string;
}

const GlobalTicker = () => {
  const [wins, setWins] = useState<GlobalWin[]>([]);

  const fetchGlobalWins = async () => {
    try {
      const res = await fetch('/api/global-wins');
      const data = await res.json();
      setWins(data);
    } catch (e) {
      console.error("Ticker fetch failed");
    }
  };

  useEffect(() => {
    fetchGlobalWins();
    const interval = setInterval(fetchGlobalWins, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 bg-zinc-900/50 border-t border-zinc-800 flex items-center overflow-hidden shrink-0">
      <div className="px-3 bg-zinc-900 h-full flex items-center gap-1.5 border-r border-zinc-800 z-10">
        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">LIVE FEED</span>
      </div>
      <div className="flex-1 relative flex items-center">
        <motion.div 
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap items-center"
        >
          {wins.map((win, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500">{win.address.slice(0,6)}...{win.address.slice(-4)}</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">WON ${win.amount.toFixed(2)}</span>
              <span className="text-[9px] font-mono text-zinc-600">via {win.strategy}</span>
            </div>
          ))}
          {wins.length === 0 && (
            <span className="text-[10px] font-mono text-zinc-600 italic">Scanning mempool for big wins...</span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalTicker;