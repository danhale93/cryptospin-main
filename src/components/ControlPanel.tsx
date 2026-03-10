"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCw, Zap, FastForward, ShoppingCart } from 'lucide-react';

interface ControlPanelProps {
  riskLevel: string;
  setRiskLevel: (level: any) => void;
  bet: number;
  setBet: (amount: number) => void;
  spinning: boolean;
  gambleMode: boolean;
  tradeResultForAnimation: any;
  autoSpins: number;
  setAutoSpins: (val: any) => void;
  turboMode: boolean;
  setTurboMode: (val: boolean) => void;
  balance: number;
  freeSpins: number;
  isLoggedIn: boolean;
  winAmount: number;
  houseLiquidity: number;
  onSpin: () => void;
  onStop: () => void;
  onCollect: () => void;
  onGambleMode: () => void;
  onBonusBuy: () => void;
  betAmounts: number[];
}

const ControlPanel = ({
  riskLevel,
  setRiskLevel,
  bet,
  setBet,
  spinning,
  gambleMode,
  tradeResultForAnimation,
  autoSpins,
  setAutoSpins,
  turboMode,
  setTurboMode,
  balance,
  freeSpins,
  isLoggedIn,
  winAmount,
  houseLiquidity,
  onSpin,
  onStop,
  onCollect,
  onGambleMode,
  onBonusBuy,
  betAmounts
}: ControlPanelProps) => {
  const isActionDisabled = spinning || gambleMode || !!tradeResultForAnimation || autoSpins > 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-xl shrink-0">
      <div className="mb-1.5 flex justify-between items-center">
        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">Risk Profile</label>
        <div className="flex gap-1">
          <button 
            onClick={onBonusBuy}
            disabled={isActionDisabled || balance < (bet * 50)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 transition-all disabled:opacity-50"
          >
            <ShoppingCart className="w-2.5 h-2.5" /> BUY BONUS (${(bet * 50).toFixed(0)})
          </button>
          <button 
            onClick={() => setTurboMode(!turboMode)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black transition-all ${
              turboMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}
          >
            <FastForward className="w-2.5 h-2.5" /> TURBO
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {['LOW', 'MED', 'HIGH', 'DEGEN'].map(r => (
          <button 
            key={r} 
            onClick={() => setRiskLevel(r)} 
            disabled={isActionDisabled}
            className={`py-1 rounded border font-mono text-[9px] transition-all disabled:opacity-50 ${
              riskLevel === r 
                ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mb-2">
        <label className="block text-[9px] font-black text-zinc-400 mb-0.5 uppercase tracking-widest">Trade Size</label>
        <div className="grid grid-cols-5 gap-1">
          {betAmounts.slice(0, 5).map((amount) => (
            <motion.button 
              key={amount} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setBet(amount)} 
              disabled={isActionDisabled}
              className={`py-1 rounded border font-mono text-[9px] transition-all ${
                bet === amount 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-50'
              }`}
            >
              {`$${amount < 1 ? amount.toFixed(2) : amount}`}
            </motion.button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-1">
          {betAmounts.slice(5).map((amount) => (
            <motion.button 
              key={amount} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setBet(amount)} 
              disabled={isActionDisabled}
              className={`py-1 rounded border font-mono text-[9px] transition-all ${
                bet === amount 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-50'
              }`}
            >
              {`$${amount}`}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex items-stretch gap-2 relative">
        <motion.div 
          animate={spinning ? { y: [0, -10, 0], rotate: [0, 10, -10, 0] } : { y: [0, -3, 0] }} 
          transition={spinning ? { repeat: Infinity, duration: 0.4 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }} 
          className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] flex items-center pl-1"
        >
          🐸
        </motion.div>
        {winAmount > 0 && !gambleMode ? (
          <>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52,211,153,0.4)" }} 
              whileTap={{ scale: 0.98 }} 
              onClick={onCollect} 
              disabled={!!tradeResultForAnimation || autoSpins > 0} 
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group disabled:opacity-50"
            >
              TAKE WIN (${winAmount.toFixed(2)})
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, scale: 0.5, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168,85,247,0.6)" }} 
              whileTap={{ scale: 0.95 }} 
              onClick={onGambleMode} 
              disabled={houseLiquidity < winAmount || !!tradeResultForAnimation || autoSpins > 0} 
              className="absolute -top-10 right-0 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/50 flex items-center justify-center gap-1 z-20 disabled:opacity-50 disabled:grayscale"
            >
              <Zap className="w-3 h-3 fill-current" /> GAMBLE
            </motion.button>
          </>
        ) : (
          <>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52,211,153,0.4)" }} 
              whileTap={{ scale: 0.98 }} 
              onClick={spinning ? onStop : onSpin} 
              disabled={(balance < bet && freeSpins === 0) || gambleMode || !isLoggedIn || !!tradeResultForAnimation || autoSpins > 0} 
              className={`flex-1 py-2 rounded-lg bg-gradient-to-r text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-1.5 relative overflow-hidden group ${
                spinning ? 'from-amber-500 to-red-500' : 'from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              {spinning ? <><Square className="w-4 h-4 fill-current"/>STOP</> : <><Play className="w-4 h-4 fill-current" />{freeSpins > 0 ? `FREE SPIN (${freeSpins})` : autoSpins > 0 ? `AUTOSPIN (${autoSpins})` :'EXECUTE'}</>}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setAutoSpins((p: number) => p > 0 ? 0 : 10)} 
              disabled={spinning || gambleMode || !!tradeResultForAnimation || winAmount > 0 || freeSpins > 0} 
              className={`w-12 py-2 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-0.5 group ${
                autoSpins > 0 ? '!bg-purple-600 !text-white !border-purple-500' : 'hover:border-zinc-500'
              }`}
            >
              {autoSpins > 0 ? <span className='text-sm'>{autoSpins}</span> : <><RotateCw className='w-3 h-3'/><span className='text-[10px]'>AUTO</span></>}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;