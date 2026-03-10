"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TradeStreamColumnProps {
  isFast: boolean;
}

const TradeStreamColumn = ({ isFast }: TradeStreamColumnProps) => {
  const tradeData = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      price: (Math.random() * 40000 + 20000).toFixed(2),
      size: (Math.random() * 2).toFixed(3),
      side: Math.random() > 0.5,
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_15%,#000_85%,transparent_100%)]">
        <motion.div
            animate={{ y: ['-50%', '0%'] }}
            transition={{
                duration: isFast ? 0.2 : 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: 'linear'
            }}
        >
            {[...tradeData, ...tradeData].map((d, i) => ( 
                <div key={i} className={`flex justify-between font-mono text-xs ${d.side ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                    <span>{d.price}</span>
                    <span>{d.size}</span>
                </div>
            ))}
        </motion.div>
    </div>
  );
};

export default TradeStreamColumn;