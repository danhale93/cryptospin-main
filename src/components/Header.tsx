"use client";

import React from 'react';
import { Activity, PlusCircle, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import MarketSentiment from './MarketSentiment';
import JackpotDisplay from './JackpotDisplay';
import { motion } from 'framer-motion';

interface HeaderProps {
  houseLiquidity: number;
  jackpot: number;
  balance: number;
  level: number;
  xp: number;
  walletAddress: string;
  isWithdrawing: boolean;
  tradeResultForAnimation: any;
  spinning: boolean;
  autoSpins: number;
  onShowDeposit: () => void;
  onShowWithdraw: () => void;
  onLogout: () => void;
  sentimentData: { sentiment: any, status: string, score: number };
}

const Header = ({
  houseLiquidity,
  jackpot,
  balance,
  level,
  xp,
  walletAddress,
  isWithdrawing,
  tradeResultForAnimation,
  spinning,
  autoSpins,
  onShowDeposit,
  onShowWithdraw,
  onLogout,
  sentimentData
}: HeaderProps) => {
  const getRank = (lvl: number) => {
    if (lvl >= 50) return { label: 'WHALE', color: 'text-purple-400', bg: 'bg-purple-500/10' };
    if (lvl >= 25) return { label: 'SHARK', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (lvl >= 10) return { label: 'DEGEN', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    return { label: 'SHRIMP', color: 'text-zinc-500', bg: 'bg-zinc-500/10' };
  };

  const rank = getRank(level);
  const xpToNextLevel = level * 100;
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-30 shrink-0 h-14 flex items-center">
      <div className="max-w-7xl mx-auto px-2 w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-base font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              CRYPTOSPIN.AI
            </h1>
          </div>
          <div className="hidden md:block">
            <MarketSentiment {...sentimentData} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <JackpotDisplay amount={jackpot} />
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 pl-2 pr-1 py-1 rounded-full shadow-inner">
            <div className="flex flex-col items-end mr-1">
                <div className={`px-2 py-0.5 rounded-full ${rank.bg} border border-current/20 flex items-center gap-1`}>
                    <ShieldCheck className={`w-2.5 h-2.5 ${rank.color}`} />
                    <span className={`text-[8px] font-black ${rank.color}`}>{rank.label} LVL {level}</span>
                </div>
                <div className="w-16 h-1 bg-zinc-800 rounded-full mt-0.5 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </div>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-emerald-400 text-xs">${balance.toFixed(2)}</span>
              <div className="flex items-center gap-0.5">
                <button onClick={onShowDeposit} className="p-0.5 hover:bg-zinc-800 rounded-full transition-colors">
                  <PlusCircle className="w-4 h-4 text-zinc-500 hover:text-emerald-400" />
                </button>
                <button onClick={onShowWithdraw} className="p-0.5 hover:bg-zinc-800 rounded-full transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout} 
            disabled={isWithdrawing || !!tradeResultForAnimation || spinning || autoSpins > 0} 
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full disabled:opacity-50 transition-all"
          >
            {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;