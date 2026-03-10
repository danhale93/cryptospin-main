"use client";

import React from 'react';

interface LeaderboardComponentProps {
  leaderboard: { address: string, balance: number }[];
  currentAddress: string;
}

const LeaderboardComponent = ({ leaderboard, currentAddress }: LeaderboardComponentProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">Top Degens</span>
        <Trophy className="w-3 h-3 text-yellow-500" />
      </div>
      <div className="flex-1 space-y-1">
        {leaderboard.map((user, i) => (
          <div 
            key={user.address} 
            className={`flex justify-between items-center p-1.5 rounded border ${
              user.address === currentAddress 
                ? 'bg-yellow-500/10 border-yellow-500/50' 
                : 'bg-zinc-900/50 border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold w-3 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                {i + 1}
              </span>
              <span className="text-[10px] font-mono text-zinc-300">
                {user.address.slice(0, 6)}...{user.address.slice(-4)}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              ${user.balance.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardComponent;