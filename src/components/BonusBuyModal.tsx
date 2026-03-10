"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Zap, Coins, Crown, RefreshCw, Star } from 'lucide-react';

interface BonusBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (type: string, cost: number, spins: number, multiplier?: number) => void;
  balance: number;
  addLog: (msg: string) => void;
}

const BonusBuyModal = ({ isOpen, onClose, onPurchase, balance, addLog }: BonusBuyModalProps) => {
  const bonuses = [
    {
      id: 'standard',
      name: 'Standard Bonus',
      description: '5 Free Spins at current bet',
      cost: 50,
      spins: 5,
      multiplier: undefined,
      icon: Gift,
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    },
    {
      id: 'mega',
      name: 'Mega Bonus',
      description: '10 Free Spins + 2x Multiplier',
      cost: 200,
      spins: 10,
      multiplier: 2,
      icon: Crown,
      color: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30'
    },
    {
      id: 'ultra',
      name: 'Ultra Bonus',
      description: '20 Free Spins + 3x Multiplier',
      cost: 500,
      spins: 20,
      multiplier: 3,
      icon: Star,
      color: 'from-amber-500 to-yellow-600',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    },
    {
      id: 'turbo',
      name: 'Turbo Pack',
      description: '50 Free Spins at 1.5x speed',
      cost: 100,
      spins: 50,
      multiplier: undefined,
      icon: RefreshCw,
      color: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    }
  ];

  const handlePurchase = (bonus: any) => {
    if (balance < bonus.cost) {
      addLog('[BONUS BUY] Insufficient balance!');
      return;
    }
    onPurchase(bonus.id, bonus.cost, bonus.spins, bonus.multiplier);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bonus Store</h2>
                  <p className="text-sm text-zinc-400">Boost your gameplay with special offers</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {bonuses.map((bonus) => {
                const Icon = bonus.icon;
                const canAfford = balance >= bonus.cost;
                
                return (
                  <motion.div
                    key={bonus.id}
                    whileHover={{ scale: canAfford ? 1.02 : 1 }}
                    className={`relative p-4 rounded-xl border ${bonus.bg} ${bonus.border} transition-all ${
                      canAfford ? 'cursor-pointer hover:shadow-lg' : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => canAfford && handlePurchase(bonus)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${bonus.bg} border ${bonus.border}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${bonus.cost}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1">{bonus.name}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{bonus.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span className="text-zinc-300">{bonus.spins} spins</span>
                      </div>
                      {bonus.multiplier && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-purple-400" />
                          <span className="text-zinc-300">{bonus.multiplier}x multiplier</span>
                        </div>
                      )}
                    </div>

                    {!canAfford && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <span className="text-sm font-bold text-zinc-400">Insufficient Funds</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-zinc-400">Your Balance</span>
              </div>
              <span className="text-xl font-bold font-mono text-emerald-400">${balance.toFixed(2)}</span>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BonusBuyModal;