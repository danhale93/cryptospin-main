"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from './useUser';
import { useApp } from './useApp';
import { useAudio } from './useAudio';

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
  const { playSound } = useAudio();

  const [balance, setBalance] = useState(initialBalance);
  const [winAmount, setWinAmount] = useState(initialWinAmount);
  const [freeSpins, setFreeSpins] = useState(initialFreeSpins);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierSpinsRemaining, setMultiplierSpinsRemaining] = useState(0);
  const [level, setLevel] = useState(initialLevel);
  const [xp, setXp] = useState(initialXp);
  const [houseTvl, setHouseTvl] = useState(initialHouseTvl);
  const [jackpot, setJackpot] = useState(5000);
  const [tradeCount, setTradeCount] = useState(0);
  const [sentimentData, setSentimentData] = useState({ sentiment: 'NEUTRAL', status: 'SCANNING MARKET...', score: 50 });
  const [aiAlpha, setAiAlpha] = useState("Market's cooked. Signal lost in the mempool. Just HODL.");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chartData, setChartData] = useState<Array<{ trade: number; balance: number }>>([{ trade: 0, balance: initialBalance }]);
  const [spinning, setSpinning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [grid, setGrid] = useState<any[][]>([]);
  const [winningCells, setWinningCells] = useState<{r: number, c: number}[]>([]);
  const [losingCells, setLosingCells] = useState<{r: number, c: number}[]>([]);
  const [tradeResultForAnimation, setTradeResultForAnimation] = useState<"win" | "loss" | null>(null);
  const [activeTrade, setActiveTrade] = useState<{ name: string; steps: string[]; currentStep: number } | null>(null);
  const [riskLevel, setRiskLevel] = useState('MED');
  const [bet, setBet] = useState(1);
  const [autoSpins, setAutoSpins] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [gambleMode, setGambleMode] = useState(false);
  const [gambleCard, setGambleCard] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);

  // Fetch market sentiment
  const fetchSentiment = useCallback(async () => {
    try {
      const res = await fetch('/api/market-sentiment');
      const data = await res.json();
      setSentimentData(data);
    } catch (e) {
      setSentimentData({ sentiment: 'NEUTRAL', status: 'MARKET IS TOTALLY COOKED', score: 50 });
    }
  }, []);

  // Fetch AI alpha
  const fetchAiAlpha = useCallback(async () => {
    if (!walletAddress) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-alpha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });
      const data = await res.json();
      setAiAlpha(data.alpha || "Market's cooked. Signal lost in the mempool. Just HODL.");
    } catch (e) {
      setAiAlpha("Market's cooked. Signal lost in the mempool. Just HODL.");
    } finally {
      setIsAiLoading(false);
    }
  }, [walletAddress]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error("Failed to fetch messages");
    }
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (e) {
      console.error("Failed to fetch leaderboard");
    }
  }, []);

  // Refresh all data
  const onRefreshAi = useCallback(() => {
    fetchSentiment();
    fetchAiAlpha();
    fetchMessages();
    fetchLeaderboard();
  }, [fetchSentiment, fetchAiAlpha, fetchMessages, fetchLeaderboard]);

  useEffect(() => {
    onRefreshAi();
    const interval = setInterval(onRefreshAi, 10000);
    return () => clearInterval(interval);
  }, [onRefreshAi]);

  // Spin logic
  const handleSpin = useCallback(async (betAmount: number) => {
    if (balance < betAmount && freeSpins === 0) {
      addLog('[SPIN] Insufficient balance');
      return;
    }

    setSpinning(true);
    setTradeResultForAnimation(null);
    setActiveTrade(null);

    try {
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          betAmount,
          riskLevel
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Trade failed');

      // Update state
      setBalance(data.user.balance);
      setWinAmount(data.user.win_amount);
      setFreeSpins(prev => Math.max(0, prev - 1));
      setHouseTvl(data.houseTvl);
      setJackpot(data.jackpot);
      setTradeCount(prev => prev + 1);
      setChartData(prev => [...prev, { trade: tradeCount + 1, balance: data.user.balance }]);
      
      // Set grid and animation data
      setGrid(data.finalGrid);
      setWinningCells([]);
      setLosingCells([]);
      
      // Set active trade for overlay
      if (data.strategy) {
        setActiveTrade({
          name: data.strategy.name,
          steps: data.strategy.steps,
          currentStep: 0
        });
      }

      // Animate steps
      if (data.strategy && data.strategy.steps) {
        data.strategy.steps.forEach((step: string, index: number) => {
          setTimeout(() => {
            setActiveTrade(prev => prev ? { ...prev, currentStep: index + 1 } : null);
          }, (index + 1) * 800);
        });
      }

      // Determine result
      const isWin = data.isWin;
      setTradeResultForAnimation(isWin ? 'win' : 'loss');
      playSound(isWin ? 'win' : 'lose');

      if (isWin) {
        addLog(`[TRADE] WON $${data.win_amount.toFixed(2)} via ${data.strategy?.name || 'unknown'}`);
      } else {
        addLog(`[TRADE] LOST $${betAmount.toFixed(2)}`);
      }

      // Auto-spin logic
      if (autoSpins > 0) {
        setTimeout(() => {
          setAutoSpins(prev => prev - 1);
          handleSpin(betAmount);
        }, turboMode ? 500 : 1500);
      } else {
        setTimeout(() => {
          setSpinning(false);
          setActiveTrade(null);
        }, 2000);
      }

    } catch (error: any) {
      addLog(`[TRADE] Error: ${error.message}`);
      setSpinning(false);
      setActiveTrade(null);
    }
  }, [walletAddress, balance, freeSpins, riskLevel, tradeCount, autoSpins, turboMode, addLog, playSound]);

  // Stop spinning
  const handleStop = useCallback(() => {
    setAutoSpins(0);
    setIsStopping(true);
    setTimeout(() => {
      setSpinning(false);
      setIsStopping(false);
      setActiveTrade(null);
    }, 1000);
  }, []);

  // Collect winnings
  const handleCollect = useCallback(async () => {
    if (!walletAddress || winAmount <= 0) return;

    try {
      const response = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Collect failed');

      setBalance(data.balance);
      setWinAmount(0);
      addLog(`[COLLECT] Successfully collected. New balance: $${data.balance.toFixed(2)}`);
      playSound('click');
    } catch (error: any) {
      addLog(`[COLLECT] Error: ${error.message}`);
    }
  }, [walletAddress, winAmount, addLog, playSound]);

  // Gamble winnings
  const handleGamble = useCallback(async (type: 'RED' | 'BLACK' | 'SUIT', suitId?: string) => {
    if (!walletAddress || winAmount <= 0) {
      addLog('[GAMBLE] No winnings to gamble');
      return;
    }

    try {
      const response = await fetch('/api/gamble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          type,
          suitId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gamble failed');

      setGambleCard(data.drawnCard);
      setWinAmount(data.newWinAmount);
      setHouseTvl(data.houseTvl);
      setJackpot(data.jackpot);

      if (data.won) {
        playSound('gambleWin');
        addLog(`[GAMBLE] WON! New win amount: $${data.newWinAmount.toFixed(2)}`);
      } else {
        playSound('gambleLose');
        setGambleMode(false);
        addLog('[GAMBLE] LOST. Position liquidated.');
      }
    } catch (error: any) {
      addLog(`[GAMBLE] Error: ${error.message}`);
    }
  }, [walletAddress, winAmount, addLog, playSound]);

  // Bonus buy
  const handleBonusBuy = useCallback(async (type: string, cost: number, spins: number, multiplier?: number) => {
    if (!walletAddress) {
      addLog('[BONUS BUY] Wallet not connected');
      return;
    }

    if (balance < cost) {
      addLog('[BONUS BUY] Insufficient balance');
      return;
    }

    try {
      const response = await fetch('/api/bonus-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          betAmount: bet,
          type
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bonus buy failed');

      setBalance(data.user.balance);
      setFreeSpins(data.user.free_spins);
      if (data.user.free_spin_bet_amount) {
        setBet(data.user.free_spin_bet_amount);
      }
      addLog(`[BONUS BUY] Purchased ${type} for $${cost}. Added ${spins} free spins!`);
      playSound('freeSpinTrigger');
    } catch (error: any) {
      addLog(`[BONUS BUY] Error: ${error.message}`);
    }
  }, [walletAddress, balance, bet, addLog, playSound]);

  // Send message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !walletAddress) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          text: inputText
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setInputText('');
      fetchMessages(); // Refresh messages
    } catch (error: any) {
      addLog(`[CHAT] Error: ${error.message}`);
    }
  }, [inputText, walletAddress, addLog, fetchMessages]);

  return {
    // State
    balance,
    winAmount,
    freeSpins,
    multiplier,
    multiplierSpinsRemaining,
    level,
    xp,
    houseTvl,
    jackpot,
    tradeCount,
    sentimentData,
    aiAlpha,
    isAiLoading,
    chartData,
    spinning,
    isStopping,
    grid,
    winningCells,
    losingCells,
    tradeResultForAnimation,
    activeTrade,
    riskLevel,
    bet,
    autoSpins,
    turboMode,
    gambleMode,
    gambleCard,
    messages,
    inputText,
    leaderboard,
    quests,

    // Actions
    setRiskLevel,
    setBet,
    setAutoSpins,
    setTurboMode,
    setGambleMode,
    setInputText,
    onRefreshAi,
    onSpin: handleSpin,
    onStop: handleStop,
    onCollect: handleCollect,
    onGamble: handleGamble,
    onBonusBuy: handleBonusBuy,
    onSendMessage: handleSendMessage,
    fetchMessages,
    fetchLeaderboard,
    addLog
  };
}