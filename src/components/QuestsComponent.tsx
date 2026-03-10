"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, Gift, Zap, Coins, TrendingUp } from 'lucide-react';

interface Quest {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  category: 'trading' | 'balance' | 'spins' | 'achievements';
}

interface QuestsComponentProps {
  quests: Quest[];
  balance: number;
  tradeCount: number;
  freeSpins: number;
  level: number;
}

export default function QuestsComponent({
  quests,
  balance,
  tradeCount,
  freeSpins,
  level
}: QuestsComponentProps) {
  const [filter, setFilter] = useState<'all' | Quest['category']>('all');

  const filteredQuests = filter === 'all'
    ? quests
    : quests.filter(quest => quest.category === filter);

  const categories = [
    { id: 'all', label: 'All', icon: Target },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'balance', label: 'Balance', icon: Coins },
    { id: 'spins', label: 'Spins', icon: Zap },
    { id: 'achievements', label: 'Achievements', icon: CheckCircle },
  ];

  const getQuestIcon = (category: Quest['category']) => {
    switch (category) {
      case 'trading': return TrendingUp;
      case 'balance': return Coins;
      case 'spins': return Zap;
      case 'achievements': return CheckCircle;
      default: return Target;
    }
  };

  const getQuestColor = (category: Quest['category']) => {
    switch (category) {
      case 'trading': return 'text-blue-400';
      case 'balance': return 'text-emerald-400';
      case 'spins': return 'text-purple-400';
      case 'achievements': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Degen Quests</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-zinc-500">
            {quests.filter(q => q.completed).length}/{quests.length} Completed
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = filter === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setFilter(category.id as any)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[8px] font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              <Icon size={10} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Quests List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {filteredQuests.map((quest) => {
            const Icon = getQuestIcon(quest.category);
            const progressPercentage = (quest.progress / quest.target) * 100;
            const isCompleted = quest.completed || quest.progress >= quest.target;
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`p-2 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${isCompleted ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                      <Icon size={12} className={getQuestColor(quest.category)} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold ${isCompleted ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {quest.title}
                      </div>
                      <div className="text-[7px] text-zinc-500">
                        {quest.description}
                      </div>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[7px]">
                    <span className="text-zinc-500">Progress</span>
                    <span className="font-mono text-zinc-400">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full ${
                        isCompleted ? 'bg-emerald-500' : 
                        progressPercentage > 75 ? 'bg-amber-500' :
                        progressPercentage > 50 ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Gift size={10} className="text-amber-400" />
                    <span className="text-[7px] font-bold text-amber-400">
                      Reward: ${quest.reward}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredQuests.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono italic">
            No quests in this category...
          </div>
        )}
      </div>
    </div>
  );
}