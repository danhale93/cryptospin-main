"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BigWinOverlayProps {
  amount: number;
  onComplete: () => void;
}

const BigWinOverlay = ({ amount, onComplete }: BigWinOverlayProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none overflow-hidden"
    >
      {/* Money Rain Effect */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0 }}
          animate={{ 
            y: window.innerHeight + 100, 
            rotate: 360,
            x: (Math.random() - 0.5) * 200 + (i * (window.innerWidth / 40))
          }}
          transition={{ 
            duration: 2 + Math.random() * 3, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 2
          }}
          className="absolute text-4xl opacity-40"
        >
          {['💵', '💰', '💎', '🚀', '🤑'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.2, 1], rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.h2 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-4xl font-black text-yellow-400 uppercase tracking-[0.2em] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
        >
          MASSIVE PROFIT
        </motion.h2>
        <motion.div 
          className="text-9xl font-black text-white mt-4 font-mono drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
        >
          ${amount.toFixed(2)}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 px-6 py-2 bg-emerald-500 text-zinc-950 font-black rounded-full text-xl uppercase tracking-widest"
        >
          LFG! 🚀🚀🚀
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.2)_0%,transparent_70%)]" />
    </motion.div>
  );
};

export default BigWinOverlay;