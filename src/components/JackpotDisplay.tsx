"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface JackpotDisplayProps {
  amount: number;
}

const JackpotDisplay = ({ amount }: JackpotDisplayProps) => {
  return (
    <motion.div 
      animate={{ 
        boxShadow: ["0 0 10px rgba(234,179,8,0.2)", "0 0 20px rgba(234,179,8,0.5)", "0 0 10px rgba(234,179,8,0.2)"] 
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
    >
      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-yellow-500/70 uppercase tracking-widest leading-none">GLOBAL JACKPOT</span>
        <motion.span 
          key={amount}
          initial={{ scale: 1.1, color: '#fff' }}
          animate={{ scale: 1, color: '#eab308' }}
          className="text-xs font-mono font-black"
        >
          ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default JackpotDisplay;