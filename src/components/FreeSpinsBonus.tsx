"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FreeSpinsBonusProps {
  spins: number;
  onStart: () => void;
}

const FreeSpinsBonus = ({ spins, onStart }: FreeSpinsBonusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center font-mono"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-lg bg-zinc-900 border-2 border-pink-500/80 rounded-2xl p-8 relative flex flex-col items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.4)] overflow-hidden"
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.2)_0%,transparent_60%)]"
          animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-xl text-zinc-400 tracking-widest">BONUS TRIGGERED</h2>
        <h1 className="text-8xl font-black text-white my-2 bg-gradient-to-br from-pink-400 to-purple-500 bg-clip-text text-transparent">{spins}</h1>
        <h2 className="text-3xl font-bold text-zinc-200">FREE SPINS</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="mt-8 text-xl font-bold px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white shadow-lg"
        >LET'S GO!</motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FreeSpinsBonus;