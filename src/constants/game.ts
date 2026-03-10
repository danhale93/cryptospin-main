"use client";

export const TOKENS = [
  { id: 'BTC', symbol: '₿', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50', name: 'Bitcoin', mult: 10 },
  { id: 'ETH', symbol: 'Ξ', color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400/50', name: 'Ethereum', mult: 5 },
  { id: 'SOL', symbol: '◎', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/50', name: 'Solana', mult: 3 },
  { id: 'DOGE', symbol: 'Ð', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50', name: 'Dogecoin', mult: 2 },
  { id: 'USDT', symbol: '₮', color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/50', name: 'Tether', mult: 0.5 },
  { id: 'XRP', symbol: '✕', color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400/50', name: 'Ripple', mult: 1.5 },
  { id: 'ADA', symbol: '₳', color: 'text-blue-300', bg: 'bg-blue-300/20', border: 'border-blue-300/50', name: 'Cardano', mult: 1.2 },
  { id: 'AVAX', symbol: '🔺', color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/50', name: 'Avalanche', mult: 2.5 },
  { id: 'LINK', symbol: '🔗', color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/50', name: 'Chainlink', mult: 2 },
  { id: 'SCATTER', symbol: '🎰', color: 'text-pink-500', bg: 'bg-pink-500/20', border: 'border-pink-500/50', name: 'Free Spins', mult: 0 },
];

export const BET_AMOUNTS = [0.5, 1, 2, 5, 10, 50, 100, 500, 1000];

export const SUITS = [
  { id: 'HEART', symbol: '♥', color: 'text-red-500', type: 'RED' },
  { id: 'DIAMOND', symbol: '♦', color: 'text-red-500', type: 'RED' },
  { id: 'SPADE', symbol: '♠', color: 'text-zinc-800', type: 'BLACK' },
  { id: 'CLUB', symbol: '♣', color: 'text-zinc-800', type: 'BLACK' }
];

export const RISK_LEVELS = ['LOW', 'MED', 'HIGH', 'DEGEN'] as const;