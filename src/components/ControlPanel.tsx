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

const RISK_LEVELS = ['low', 'medium', 'high'];

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
          <div className="flex gap-2">
            {RISK_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  riskLevel === level
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
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
                className={`py-2 px-4 rounded-lg font-medium transition-all ${
                  bet === amount
                    ? 'bg-cyan-600 text-white'
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
          <div className="p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-medium">Active Multiplier</span>
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
          <button
            onClick={onSpin}
            disabled={!canSpin}
            className={`col-span-2 py-4 rounded-xl font-bold text-lg transition-all ${
              canSpin
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {spinning ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin" size={20} />
                Spinning...
              </span>
            ) : freeSpins > 0 ? (
              `Free Spins: ${freeSpins}`
            ) : (
              'Spin'
            )}
          </button>

          {canCollect && (
            <button
              onClick={onCollect}
              className="py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold transition-all"
            >
              Collect $${winAmount.toFixed(2)}
            </button>
          )}

          {canGamble && (
            <button
              onClick={onGambleMode}
              className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all"
            >
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
              className="w-full py-2 px-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-cyan-500 focus:outline-none"
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
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                turboMode
                  ? 'bg-cyan-600 text-white'
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
            <span className="font-bold text-white">${balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">Free Spins</span>
            <span className="font-bold text-cyan-400">{freeSpins}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}