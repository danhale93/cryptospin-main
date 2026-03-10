"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, PlusCircle, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import MarketSentiment from './MarketSentiment';
import JackpotDisplay from './JackpotDisplay';
import { useTrade } from '../hooks/useTrade';

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
  addLog?: (msg: string) => void; // Added addLog prop
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
  sentimentData,
  addLog
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

  // PayID modal state
  const [showPayIDModal, setShowPayIDModal] = useState(false);

  const handleDepositViaPayID = (amount: number) => {
    if (addLog) addLog(`[PAYID] Manual deposit of $${amount} confirmed.`);
    onShowDeposit();
    setShowPayIDModal(false);
  };

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
                {/* Deposit button now opens PayID modal */}
                <button 
                  onClick={() => setShowPayIDModal(true)} 
                  className="p-0.5 hover:bg-zinc-800 rounded-full transition-colors"
                >
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

// PayID Modal - moved here to avoid circular imports
const PayIDModal = ({ onClose, onDeposit, addLog }: any) => {
  const payId = 'support$payid.crypto.com';

  const handleDeposit = () => {
    const amount = prompt("Enter the amount you sent (simulated):", "100");
    if (amount && !isNaN(Number(amount))) {
      onDeposit(Number(amount));
      if (addLog) addLog(`[PAYID] Manual deposit of $${amount} confirmed.`);
      onClose();
    } else {
      if (addLog) addLog('[PAYID] Invalid amount entered.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-sm p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
        <h2 className="text-xl font-bold text-center text-emerald-400">Deposit via PayID</h2>
        <p className="text-sm text-zinc-400 text-center mt-2">
          Send funds to the following PayID from your exchange or wallet.
        </p>
        <div className="my-4 p-3 bg-zinc-950 rounded-lg border border-zinc-700 text-center">
          <p className="text-xs text-zinc-500">PayID</p>
          <p className="text-lg font-mono text-white">{payId}</p>
        </div>
        <div className="text-xs text-zinc-500 text-center">
          <p>This is a simulated process. After sending, manually confirm the deposit amount below.</p>
        </div>
        <div className="mt-4 flex flex-col gap-2">
            <button onClick={handleDeposit} className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-lg transition-colors">
                Confirm Deposit
            </button>
            <button onClick={onClose} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default Header;