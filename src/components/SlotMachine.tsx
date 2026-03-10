"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TradeStreamColumn from './TradeStreamColumn';
import ReelResultAnimation from './ReelResultAnimation';

interface Token {
  id: string;
  symbol: string;
  color: string;
  name: string;
}

interface SlotMachineProps {
  grid: Token[][];
  spinning: boolean;
  isStopping: boolean;
  winningCells: {r: number, c: number}[];
  losingCells: {r: number, c: number}[];
  tradeResultForAnimation: "win" | "loss" | null;
  onAnimationComplete: () => void;
  bet: number;
  winAmount: number;
}

const SlotMachine = ({
  grid,
  spinning,
  isStopping,
  winningCells,
  losingCells,
  tradeResultForAnimation,
  onAnimationComplete,
  bet,
  winAmount
}: SlotMachineProps) => {
  return (
    <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-2 relative shadow-2xl overflow-hidden min-h-0">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
        <div className="relative grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-[320px] sm:max-w-[420px] aspect-[5/3] mb-2 shrink-0 z-10">
          <AnimatePresence>
            {tradeResultForAnimation && (
              <ReelResultAnimation 
                result={tradeResultForAnimation} 
                onComplete={onAnimationComplete} 
                betAmount={bet} 
                winAmount={winAmount} 
              />
            )}
          </AnimatePresence>
          {grid.map((row, i) => row.map((token, j) => (
            <div 
              key={`${i}-${j}`} 
              className={`rounded-lg border-2 shadow-inner relative overflow-hidden bg-zinc-950/80 transition-all duration-300 ${
                winningCells.some(c => c.r === i && c.c === j) 
                  ? 'border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.5)] bg-emerald-500/10' 
                  : losingCells.some(c => c.r === i && c.c === j) 
                    ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-500/10' 
                    : 'border-zinc-800'
              }`}
            >
              <AnimatePresence>
                {spinning ? (
                  <motion.div 
                    key={`spinning-${j}`} 
                    exit={{ opacity: 0, y: 30 }} 
                    transition={{ duration: 0.3 + j * 0.1 }} 
                    className="w-full h-full"
                  >
                    <TradeStreamColumn isFast={isStopping} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key={`static-${token.id}-${i}-${j}`} 
                    initial={{ opacity: 0, y: -30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 + j * 0.1 }} 
                    className="w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className={`text-2xl sm:text-3xl ${token.color} drop-shadow-[0_0_10px_currentColor]`}>
                      {token.symbol}
                    </div>
                    <div className="absolute bottom-1 text-[7px] font-bold text-white/50 uppercase tracking-wider hidden sm:block">
                      {token.name}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;