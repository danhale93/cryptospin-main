"use client";

import React from 'react';
import { Activity, Wallet, PlusCircle, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  houseLiquidity: number;
  balance: number;
  walletAddress: string;
  isWithdrawing: boolean;
  tradeResultForAnimation: any;
  spinning: boolean;
  autoSpins: number;
  onShowDeposit: () => void;
  onShowWithdraw: () => void;
  onLogout: () => void;
}

const Header = ({
  houseLiquidity,
  balance,
  walletAddress,
  isWithdrawing,
  tradeResultForAnimation,
  spinning,
  autoSpins,
  onShowDeposit,
  onShowWithdraw,
  onLogout
}: HeaderProps) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-30 shrink-0 h-12 flex items-center">
      <div className="max-w-7xl mx-auto px-2 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
            CryptoSpin.ai
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">House TVL</span>
            <span className="text-xs font-mono font-bold text-purple-400">${houseLiquidity.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-full shadow-inner">
            <Wallet className="w-3 h-3 text-zinc-500" />
            <span className="font-mono font-medium text-emerald-400 text-xs">${balance.toFixed(2)}</span>
            <div className="flex items-center gap-0.5 ml-1">
              <button onClick={onShowDeposit} title="Deposit">
                <PlusCircle className="w-3.5 h-3.5 text-zinc-600 hover:text-emerald-400 transition-colors" />
              </button>
              <button onClick={onShowWithdraw} title="Withdraw">
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onLogout} 
              disabled={isWithdrawing || !!tradeResultForAnimation || spinning || autoSpins > 0} 
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-medium px-2 py-1 rounded-full disabled:opacity-50"
            >
              {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;