"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReelResultAnimationProps {
  result: 'win' | 'loss';
  onComplete: () => void;
  betAmount: number;
  winAmount: number;
}

const ReelResultAnimation = ({ result, onComplete, betAmount, winAmount }: ReelResultAnimationProps) => {
  const winText = `+$${winAmount.toFixed(2)}`;
  const lossText = `-$${betAmount.toFixed(2)}`;

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ x: "-220px", y: 0, rotate: 0, scale: 1.5 }}
        animate={{ 
          x: result === 'win' ? "220px" : "0px", 
          y: result === 'win' ? [0, -100, 0] : [0, -60, 200], 
          rotate: result === 'win' ? [0, 20, 0] : 360, 
          opacity: result === 'loss' ? 0 : 1,
        }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        className="text-5xl z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      >🐸</motion.div>

      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ delay: 1.5, duration: 0.5, type: 'spring' }}
            className={`absolute font-black text-6xl uppercase ${result === 'win' ? 'text-emerald-400/90' : 'text-red-500/90'}`}>
            {result === 'win' ? "PROFIT" : "RUGGED"}
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.5, type: 'spring' }}
            className={`absolute mt-24 font-mono font-bold text-4xl ${result === 'win' ? 'text-white' : 'text-zinc-300'}`}>
            {result === 'win' ? winText : lossText}
        </motion.div>
      </AnimatePresence>

      {result === 'win' && (
        <motion.div 
          className="absolute w-full h-1/3 top-1/3 left-0 bg-emerald-500/30 filter blur-[30px]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'circOut' }}
        />
      )}
    </div>
  );
};

export default ReelResultAnimation;