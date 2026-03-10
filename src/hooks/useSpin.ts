"use client";

import { useRef, useState, useEffect } from 'react';
import { useAudio } from './useAudio';
import { TOKENS } from '../constants/game';

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

export const useSpin = (walletAddress: string, bet: number, riskLevel: string, freeSpins: number, turboMode: boolean) => {
  const { playSound } = useAudio();
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState(generateGrid());
  const [winningCells, setWinningCells] = useState<{r: number, c: number}[]>([]);
  const [losingCells, setLosingCells] = useState<{r: number, c: number}[]>([]);
  const [activeTrade, setActiveTrade] = useState<{ name: string, steps: string[], currentStep: number, isWin: boolean } | null>(null);
  const [tradeResultForAnimation, setTradeResultForAnimation] = useState<"win" | "loss" | null>(null);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  const [showFreeSpinsBonus, setShowFreeSpinsBonus] = useState(false);
  const isStoppingRef = useRef(false);
  const spinStartTime = useRef(0);

  const handleSpin = async (addLog: (msg: string) => void, onComplete: () => void, onUpdateState: (updates: any) => void) => {
    if (spinning || tradeResultForAnimation) return;

    playSound('click');
    isStoppingRef.current = false;
    spinStartTime.current = Date.now();
    setSpinning(true);
    setWinningCells([]); 
    setLosingCells([]); 
    setActiveTrade(null);
    
    const currentBet = freeSpins > 0 ? 0 : bet;
    
    try {
      const res = await fetch('/api/spin', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress, betAmount: currentBet, riskLevel }) 
      });
      const data = await res.json();
      if (data.error) { 
        addLog(`ERROR: ${data.error}`); 
        setSpinning(false); 
        return; 
      }

      const { finalGrid, isWin, strategy, scatters, user, houseTvl, jackpot: newJackpot } = data;
      setActiveTrade({ name: strategy.name, steps: strategy.steps, currentStep: 0, isWin });
      addLog(`[API] Initiating ${strategy.name} at $${currentBet} (${riskLevel} Risk)...`);

      const spinDuration = turboMode ? 500 : 2000 + Math.random() * 1000;
      const stepDuration = spinDuration / strategy.steps.length;

      const spinInterval = setInterval(() => {
          const elapsed = Date.now() - spinStartTime.current;
          const currentStep = Math.min(Math.floor(elapsed / stepDuration), strategy.steps.length - 1);
          
          setActiveTrade(prev => prev ? { ...prev, currentStep } : null);

          if(isStoppingRef.current || (elapsed > spinDuration)) {
              clearInterval(spinInterval);
              isStoppingRef.current = false;
              setActiveTrade(prev => prev ? { ...prev, currentStep: strategy.steps.length } : null);
              setGrid(finalGrid);
              setSpinning(false);
              
              onUpdateState({
                balance: user.balance,
                freeSpins: user.free_spins,
                winAmount: user.win_amount,
                xp: user.xp,
                level: user.level,
                houseLiquidity: houseTvl,
                jackpot: newJackpot
              });

              if (scatters >= 3) {
                playSound('freeSpinTrigger');
                const spinsWon = user.free_spins - freeSpins + 5;
                addLog(`🎰 ${spinsWon} FREE SPINS TRIGGERED! 🎰`);
                setPendingFreeSpins(spinsWon);
              }

              setTradeResultForAnimation(isWin ? 'win' : 'loss');
              onComplete();
          }
      }, 100);

    } catch (e) { 
      addLog(`ERROR: Backend connection failed.`); 
      setSpinning(false); 
    }
  };

  const handleStop = () => {
    if(spinning) {
      const elapsed = Date.now() - spinStartTime.current;
      if (elapsed > 500) {
        isStoppingRef.current = true;
      }
    }
  };

  return {
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
    handleSpin,
    handleStop,
    setGrid,
    setWinningCells,
    setLosingCells,
    setActiveTrade,
    setTradeResultForAnimation
  };
};