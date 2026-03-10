"use client";

import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { useApp } from './useApp';

export default function useTrade({
  walletAddress,
  initialBalance = 1000,
  initialWinAmount = 0,
  initialFreeSpins = 0,
  initialHouseTvl = 100000,
  initialXp = 0,
  initialLevel = 1
}: {
  walletAddress: string;
  initialBalance: number;
  initialWinAmount: number;
  initialFreeSpins: number;
  initialHouseTvl: number;
  initialXp: number;
  initialLevel: number;
}) {
  const { addLog } = useUser();
  const { onRefreshAi } = useApp();

  const [balance, setBalance] = useState(initialBalance);
  const [winAmount, setWinAmount] = useState(initialWinAmount);
  const [freeSpins, setFreeSpins] = useState(initialFreeSpins);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierSpinsRemaining, setMultiplierSpinsRemaining] = useState(0);
  const [level, setLevel] = useState(initialLevel);
  const [xp, setXp] = useState(initialXp);
  const [houseTvl, setHouseTvl] = useState(initialHouseTvl);
  const [tradeCount, setTradeCount] = useState(0);
  const [sentimentData, setSentimentData] = useState({ sentiment: 'NEUTRAL', status: 'SCANNING MARKET...', score: 50 });
  const [aiAlpha, setAiAlpha] = useState("Market's cooked. Signal lost in the mempool. Just HODL.");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chartData, setChartData] = useState<Array<{ trade: number; balance: number }>>([{ trade: 0, balance: initialBalance }]);

  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshAi();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSpin = async (betAmount: number) => {
    if (balance < betAmount && freeSpins === 0) {
      addLog('[SPIN] Insufficient balance');
      return;
    }

    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          betAmount,
          riskLevel: 'MED',
          multiplier
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Trade failed');

      setBalance(data.balance);
      setWinAmount(data.winAmount);
      setFreeSpins(prev => Math.max(0, prev - 1));
      setTradeCount(prev => prev + 1);
      setChartData(prev => [...prev, { trade: tradeCount + 1, balance: data.balance }]);
      addLog(`[TRADE] ${data.isWin ? 'WON' : 'LOST'} $${data.winAmount.toFixed(2)}`);
    } catch (error: any) {
      addLog(`[TRADE] Error: ${error.message}`);
    }
  };

  const handleCollectWinnings = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Collect failed');

      setBalance(data.balance);
      setWinAmount(0);
      addLog(`[COLLECT] Successfully collected. New balance: $${data.balance.toFixed(2)}`);
    } catch (error: any) {
      addLog(`[COLLECT] Error: ${error.message}`);
    }
  };

  const handleGamble = async (type: string) => {
    if (!walletAddress) {
      addLog('[GAMBLE] Wallet not connected');
      return;
    }

    try {
      const response = await fetch('/api/gamble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          type
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gamble failed');

      setWinAmount(data.newWinAmount);
      addLog(`[GAMBLE] ${data.won ? 'WON' : 'LOST'}! New win amount: $${data.newWinAmount.toFixed(2)}`);
    } catch (error: any) {
      addLog(`[GAMBLE] Error: ${error.message}`);
    }
  };

  const handleBonusBuy = async (type: string, cost: number, spins: number, multiplier?: number) => {
    if (!walletAddress) {
      addLog('[BONUS BUY] Wallet not connected');
      return;
    }

    try {
      const response = await fetch('/api/bonus-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          bonusType: type,
          cost,
          spins,
          multiplier
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bonus buy failed');

      setBalance(data.balance);
      setFreeSpins(prev => prev + data.freeSpins);
      if (data.multiplier) {
        setMultiplier(prev => Math.max(prev, data.multiplier));
      }
      addLog(`[BONUS BUY] Successfully purchased ${type} for $${cost}.`);
    } catch (error: any) {
      addLog(`[BONUS BUY] Error: ${error.message}`);
    }
  };

  return {
    balance,
    winAmount,
    freeSpins,
    multiplier,
    multiplierSpinsRemaining,
    level,
    xp,
    houseTvl,
    tradeCount,
    sentimentData,
    aiAlpha,
    isAiLoading,
    onRefreshAi,
    onTrade: handleSpin,
    onCollect: handleCollectWinnings,
    onGamble: handleGamble,
    onBonusBuy: handleBonusBuy,
    addLog,
    chartData
  };
}