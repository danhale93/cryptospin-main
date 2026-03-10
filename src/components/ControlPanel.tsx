"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Stop, Wallet, Zap, Gift, Trophy, TrendingUp, Activity, Target, Brain, History, MessageSquare, Send, RefreshCw, Coins } from 'lucide-react';

interface ControlPanelProps {
  riskLevel: string;
  setRiskLevel: (level: any) => void;
  bet: number;
  setBet: (bet: number) => void;
  spinning: boolean;
  gambleMode: boolean;
  tradeResultForAnimation: any;
  autoSpins: number;
  setAutoSpins: (count: number) => void;
  turboMode: boolean;
  setTurboMode: (enabled: boolean) => void;
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
  multiplier: number;
  multiplierSpinsRemaining: number;
}

const RISK_LEVELS = ['LOW', 'MED', 'HIGH', 'DEGEN'];

export default function ControlPanel({
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
  betAmounts,
  multiplier,
  multiplierSpinsRemaining
}: ControlPanelProps) {
  const canSpin = isLoggedIn && (balance >= bet || freeSpins > 0) && !spinning;
  const canCollect = winAmount > 0 && !spinning;
  const canGamble = winAmount > 0 && !spinning && !gambleMode;
  const canBuyBonus = balance >= 50;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'from-emerald-600 to-green-600';
      case 'MED': return 'from-blue-600 to-cyan-600';
      case 'HIGH': return 'from-orange-600 to-amber-600';
      case 'DEGEN': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-cyan-600';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'MED': return 'bg-blue-500/20 border-blue-500/30';
      case 'HIGH': return 'bg-orange-500/20 border-orange-500/30';
      case 'DEGEN': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6"
    >
      <div className="space-y-6">
        {/* Risk Level Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
          <div className="grid grid-cols-4 gap-2">
            {RISK_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`py-2 px-2 rounded-lg font-bold text-xs transition-all ${
                  riskLevel === level
                    ? `bg-gradient-to-r ${getRiskColor(level)} text-white shadow-lg`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {betAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setBet(amount)}
                className={`py-2 px-2 rounded-lg font-bold text-xs transition-all ${
                  bet === amount
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplier Display */}
        {multiplier > 1 && (
          <div className={`p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl`}>
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-medium text-sm">Active Multiplier</span>
              <span className="text-2xl font-bold text-purple-400">{multiplier}x</span>
            </div>
            {multiplierSpinsRemaining > 0 && (
              <div className="text-center text-sm text-purple-300 mt-1">
                {multiplierSpinsRemaining} spins remaining
              </div>
            )}
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {spinning ? (
            <button
              onClick={onStop}
              className="col-span-2 py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg flex items-center justify-center gap-2"
            >
              <Stop className="w-5 h-5" />
              STOP
            </button>
          ) : (
            <button
              onClick={() => onSpin()}
              disabled={!canSpin}
              className={`col-span-2 py-4 rounded-xl font-bold text-lg transition-all ${
                canSpin
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {freeSpins > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  FREE SPINS: {freeSpins}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  SPIN (${bet})
                </span>
              )}
            </button>
          )}

          {canCollect && (
            <button
              onClick={onCollect}
              className="py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Collect ${winAmount.toFixed(2)}
            </button>
          )}

          {canGamble && (
            <button
              onClick={onGambleMode}
              className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Gamble Win
            </button>
          )}
        </div>

        {/* Bonus Buy Button */}
        {canBuyBonus && (
          <button
            onClick={onBonusBuy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Gift size={20} />
            Buy Bonuses
          </button>
        )}

        {/* Auto Spins & Turbo Mode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Auto Spins</label>
            <select
              value={autoSpins}
              onChange={(e) => setAutoSpins(Number(e.target.value))}
              className="w-full py-2 px-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
            >
              <option value={0}>Off</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Turbo Mode</label>
            <button
              onClick={() => setTurboMode(!turboMode)}
              className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all ${
                turboMode
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {turboMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Balance</span>
            <span className="font-bold text-white font-mono">${balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">Free Spins</span>
            <span className="font-bold text-cyan-400">{freeSpins}</span>
          </div>
          {multiplier > 1 && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-400">Multiplier</span>
              <span className="font-bold text-purple-400">{multiplier}x</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}