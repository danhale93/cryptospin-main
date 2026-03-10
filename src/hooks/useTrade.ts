"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSpin } from './useSpin';
import { useGamble } from './useGamble';
import { useCollect } from './useCollect';
import { useChartData } from './useChartData';
import { useMarketData } from './useMarketData';
import { useBonusBuy } from './useBonusBuy';
import { useDepositWithdraw } from './useDepositWithdraw';
import { BET_AMOUNTS, RISK_LEVELS } from '../constants/game';

interface UseTradeProps {
  walletAddress: string;
  initialBalance: number;
  initialWinAmount: number;
  initialFreeSpins: number;
  initialHouseTvl: number;
  initialXp: number;
  initialLevel: number;
}

export const useTrade = ({
  walletAddress,
  initialBalance,
  initialWinAmount,
  initialFreeSpins,
  initialHouseTvl,
  initialXp,
  initialLevel
}: UseTradeProps) => {
  const [balance, setBalance] = useState(initialBalance);
  const [winAmount, setWinAmount] = useState(initialWinAmount);
  const [freeSpins, setFreeSpins] = useState(initialFreeSpins);
  const [houseLiquidity, setHouseLiquidity] = useState(initialHouseTvl);
  const [jackpot, setJackpot] = useState(5000);
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [bet, setBet] = useState(BET_AMOUNTS[2]);
  const [riskLevel, setRiskLevel] = useState<string>(RISK_LEVELS[1]);
  const [autoSpins, setAutoSpins] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [gambleMode, setGambleMode] = useState(false);

  const {
    spinning,
    grid,
    winningCells,
    losingCells,
    activeTrade,
    tradeResultForAnimation,
    pendingFreeSpins,
    showFreeSpinsBonus,
    setShowFreeSpinsBonus,
    setPendingFreeSpins,
    handleSpin: handleSpinInternal,
    handleStop,
    setGrid,
    setWinningCells,
    setLosingCells,
    setActiveTrade,
    setTradeResultForAnimation
  } = useSpin(walletAddress, bet, riskLevel, freeSpins, turboMode);

  const {
    gambleCard,
    setGambleCard,
    handleGamble
  } = useGamble(walletAddress, winAmount, houseLiquidity, jackpot);

  const { collectWinnings } = useCollect(walletAddress);

  const {
    chartData,
    tradeCount,
    addTradePoint,
    resetChartData
  } = useChartData(initialBalance);

  const {
    aiAlpha,
    isAiLoading,
    fetchAiAlpha,
    sentimentData,
    fetchSentiment
  } = useMarketData(walletAddress, tradeCount, balance);

  const { handleBonusBuy } = useBonusBuy(walletAddress, bet);
  const { handleDeposit, handleWithdraw } = useDepositWithdraw(walletAddress);

  const handleSpin = useCallback((addLog: (msg: string) => void) => {
    handleSpinInternal(addLog, () => {
      if (autoSpins > 0) {
        setAutoSpins(prev => prev - 1);
      }
    }, (updates: any) => {
      if (updates.balance !== undefined) setBalance(updates.balance);
      if (updates.freeSpins !== undefined) setFreeSpins(updates.freeSpins);
      if (updates.winAmount !== undefined) setWinAmount(updates.winAmount);
      if (updates.xp !== undefined) setXp(updates.xp);
      if (updates.level !== undefined) setLevel(updates.level);
      if (updates.houseLiquidity !== undefined) setHouseLiquidity(updates.houseLiquidity);
      if (updates.jackpot !== undefined) setJackpot(updates.jackpot);
    });
  }, [handleSpinInternal, autoSpins]);

  const collectWinningsWithLog = useCallback((addLog: (msg: string) => void) => {
    return collectWinnings(addLog);
  }, [collectWinnings]);

  const handleGambleWithLog = useCallback((type: 'RED' | 'BLACK' | 'SUIT', addLog: (msg: string) => void, suitId?: string) => {
    return handleGamble(type, addLog, suitId);
  }, [handleGamble]);

  const handleBonusBuyWithLog = useCallback((addLog: (msg: string) => void) => {
    return handleBonusBuy(addLog);
  }, [handleBonusBuy]);

  const handleDepositWithLog = useCallback((amount: number, addLog: (msg: string) => void) => {
    return handleDeposit(amount, addLog);
  }, [handleDeposit]);

  const handleWithdrawWithLog = useCallback((amount: number, addLog: (msg: string) => void) => {
    return handleWithdraw(amount, addLog);
  }, [handleWithdraw]);

  const generateGrid = useCallback(() => {
    return Array(3).fill(0).map(() => 
      Array(5).fill(0).map(() => ({
        id: 'BTC',
        symbol: '₿',
        color: 'text-orange-500',
        name: 'Bitcoin',
        mult: 10
      }))
    );
  }, []);

  return {
    balance,
    setBalance,
    winAmount,
    setWinAmount,
    freeSpins,
    setFreeSpins,
    houseLiquidity,
    setHouseLiquidity,
    jackpot,
    setJackpot,
    xp,
    setXp,
    level,
    setLevel,
    bet,
    setBet,
    riskLevel,
    setRiskLevel,
    autoSpins,
    setAutoSpins,
    turboMode,
    setTurboMode,
    gambleMode,
    setGambleMode,
    spinning,
    grid,
    setGrid,
    winningCells,
    setWinningCells,
    losingCells,
    setLosingCells,
    activeTrade,
    setActiveTrade,
    tradeResultForAnimation,
    setTradeResultForAnimation,
    pendingFreeSpins,
    setPendingFreeSpins,
    showFreeSpinsBonus,
    setShowFreeSpinsBonus,
    gambleCard,
    setGambleCard,
    handleSpin,
    handleStop,
    handleGamble: handleGambleWithLog,
    collectWinnings: collectWinningsWithLog,
    handleBonusBuy: handleBonusBuyWithLog,
    handleDeposit: handleDepositWithLog,
    handleWithdraw: handleWithdrawWithLog,
    chartData,
    tradeCount,
    addTradePoint,
    resetChartData,
    aiAlpha,
    isAiLoading,
    fetchAiAlpha,
    sentimentData,
    fetchSentiment,
    generateGrid
  };
};