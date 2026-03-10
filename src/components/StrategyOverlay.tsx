"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, CheckCircle2, Circle } from 'lucide-react';

interface StrategyOverlayProps {
  activeTrade: {
    name: string;
    steps: string[];
    currentStep: number;
  } | null;
}

const StrategyOverlay = ({ activeTrade }: StrategyOverlayProps) => {
  if (!activeTrade) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      className="absolute inset-0 z-30 bg-black/40 flex flex-col items-center justify-center p-4 pointer-events-none"
    >
      <div className="w-full max-w-[280px] bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            {activeTrade.name}
          </span>
        </div>
        
        <div className="space-y-3">
          {activeTrade.steps.map((step, i) => {
            const isCompleted = i < activeTrade.currentStep;
            const isActive = i === activeTrade.currentStep;
            
            return (
              <motion.div 
                key={step}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : isActive ? (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Circle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  </motion.div>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-zinc-700" />
                )}
                <span className={`text-[10px] font-mono font-bold uppercase tracking-tighter ${
                  isCompleted ? 'text-zinc-500 line-through' : isActive ? 'text-white' : 'text-zinc-700'
                }`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StrategyOverlay;