"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wallet } from 'lucide-react';

interface WithdrawModalProps {
  balance: number;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

const WithdrawModal = ({ balance, onClose, onWithdraw }: WithdrawModalProps) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > balance) return;
    onWithdraw(val);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" /> Withdraw Funds
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1.5">Available Balance</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">${balance.toFixed(2)}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1.5">Amount to Withdraw</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-7 pr-4 text-white font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                max={balance}
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[0.25, 0.5, 1].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAmount((balance * pct).toFixed(2))}
                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded-md transition-colors"
              >
                {pct * 100}%
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:grayscale text-zinc-950 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)]"
          >
            Confirm Withdrawal
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default WithdrawModal;