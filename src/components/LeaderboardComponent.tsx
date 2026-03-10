"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react';

interface LeaderboardUser {
  address: string;
  balance: number;
  rank: number;
  change: number;
}

interface LeaderboardComponentProps {
  leaderboard: LeaderboardUser[];
  currentAddress: string;
}

export default function LeaderboardComponent({
  leaderboard,
  currentAddress
}: LeaderboardComponentProps) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-zinc-500">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    } else if (change < 0) {
      return <TrendingDown className="w-3 h-3 text-red-400" />;
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Top Degens</span>
        </div>
        <div className="flex gap-1">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-[8px] px-2 py-1 rounded ${
                timeframe === tf
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        <AnimatePresence>
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`p-2 rounded-lg border transition-all ${
                user.address === currentAddress
                  ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                  : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-800">
                    {getRankBadge(user.rank)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-300">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </span>
                    {user.change !== 0 && (
                      <div className="flex items-center gap-1">
                        {getChangeIcon(user.change)}
                        <span className={`text-[8px] ${user.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {user.change > 0 ? '+' : ''}{user.change.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  {user.address === currentAddress && (
                    <span className="text-[8px] text-yellow-400 font-bold uppercase">YOU</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {leaderboard.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono italic">
            No players yet...
          </div>
        )}
      </div>
    </div>
  );
}