export interface User {
  address: string;
  balance: number;
  winAmount: number;
  freeSpins: number;
  level: number;
  xp: number;
  houseTvl: number;
}

export interface Trade {
  trade_id: number;
  bet_amount: number;
  risk_level: string;
  is_win: boolean;
  win_amount: number;
  strategy_name: string;
  timestamp: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  category: 'trading' | 'balance' | 'spins' | 'achievements';
}

export interface LeaderboardUser {
  address: string;
  balance: number;
  rank: number;
  change: number;
}

export interface Message {
  id: number;
  address: string;
  text: string;
  timestamp: string;
  is_ai?: boolean;
}