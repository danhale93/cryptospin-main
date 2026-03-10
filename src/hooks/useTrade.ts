"use client";

import { useState, useRef, useEffect } from 'react';
import { useAudio } from './useAudio';
import { TOKENS } from '../constants/game';

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

export const useTrade = (walletAddress: string, initialData: any) => {
  const { playSound } = useAudio();
  const [balance, setBalance] = useState(initialData.balance);
  const [houseLiquidity, setHouseLiquidity] = useState(initialData.houseTvl);
  const [bet, setBet] = useState(1);
  const [grid, setGrid] = useState(generateGrid());
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(initialData.winAmount);
  const [winningCells, setWinningCells] = useState<{r: number, c: number}[]>([]);
  const [losingCells, setLosingCells] = useState<{r: number, c: number}[]>([]);
  const [freeSpins, setFreeSpins] = useState(initialData.freeSpins);
  const [gambleMode, setGambleMode] = useState(false);
  const [gambleCard, setGambleCard] = useState<any>(null);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MED' | 'HIGH' | 'DEGEN'>('MED');
  const [chartData, setChartData] = useState<{ trade: number, balance: number }[]>([{ trade: 0, balance: initialData.balance }]);
  const [tradeCount, setTradeCount] = useState(0);
  const [activeTrade, setActiveTrade] = useState<{ name: string, steps: string[], currentStep: number, isWin: boolean } | null>(null);
  const [tradeResultForAnimation, setTradeResultForAnimation] = useState<"win" | "loss" | null>(null);
  const [showFreeSpinsBonus, setShowFreeSpinsBonus] = useState(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  const [autoSpins, setAutoSpins] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [aiAlpha, setAiAlpha] = useState<string>("Waiting for market signal...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState({ sentiment: 'NEUTRAL', status: 'SCANNING MARKET...', score: 50 });
  const isStoppingRef = useRef(false);
  const spinStartTime = useRef(0);

  const fetchAiAlpha = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-alpha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });
      const data = await res.json();
      setAiAlpha(data.alpha);
    } catch (e) {
      setAiAlpha("Market's cooked. Signal lost.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchSentiment = async () => {
    try {
      const res = await fetch('/api/market-sentiment');
      const data = await res.json();
      setSentimentData(data);
    } catch (e) {
      console.error("Sentiment fetch failed");
    }
  };

  useEffect(() => {
    fetchSentiment();
    const interval = setInterval(fetchSentiment, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = async (addLog: (msg: string) => void) => {
    if (spinning || winAmount > 0 || tradeResultForAnimation) return;
    if (balance < bet && freeSpins === 0) { 
      addLog('ERROR: Insufficient funds.'); 
      setAutoSpins(0); 
      return; 
    }

    playSound('click');
    isStoppingRef.current = false;
    spinStartTime.current = Date.now();
    setSpinning(true);
    setWinningCells([]); 
    setLosingCells([]); 
    setGambleMode(false); 
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

      const { finalGrid, isWin, strategy, scatters, user, houseTvl } = data;
      setActiveTrade({ name: strategy.name, steps: strategy.steps, currentStep: 0, isWin });
      addLog(`[API] Initiating ${strategy.name} at $${currentBet} (${riskLevel} Risk)...`);

      const spinDuration = turboMode ? 500 : 2000 + Math.random() * 1000;
      const spinInterval = setInterval(() => {
          if(isStoppingRef.current || (Date.now() - spinStartTime.current > spinDuration)) {
              clearInterval(spinInterval);
              isStoppingRef.current = false;
              setActiveTrade(prev => prev ? { ...prev, currentStep: 4 } : null);
              setGrid(finalGrid);
              setSpinning(false);
              setBalance(user.balance);
              setFreeSpins(user.free_spins);
              setWinAmount(user.win_amount);
              setHouseLiquidity(houseTvl);

              if (scatters >= 3) {
                playSound('freeSpinTrigger');
                const spinsWon = user.free_spins - freeSpins + 5;
                addLog(`🎰 ${spinsWon} FREE SPINS TRIGGERED! 🎰`);
                setPendingFreeSpins(spinsWon);
              }

              if (isWin) setChartData(prev => [...prev, { trade: tradeCount + 1, balance: user.balance + user.win_amount }]);
              else setChartData(prev => [...prev, { trade: tradeCount + 1, balance: user.balance }]);
              setTradeCount(c => c + 1);
              setTradeResultForAnimation(isWin ? 'win' : 'loss');
              
              if ((tradeCount + 1) % 3 === 0 || isWin) {
                fetchAiAlpha();
                fetchSentiment();
              }
          }
      }, 100);

    } catch (e) { 
      addLog(`ERROR: Backend connection failed.`); 
      setSpinning(false); 
    }
  };

  const handleGamble = async (type: 'RED' | 'BLACK' | 'SUIT', addLog: (msg: string) => void, suitId?: string) => {
    if (winAmount <= 0) return;
    const originalWinAmount = winAmount;
    try {
      const res = await fetch('/api/gamble', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress, type, suitId }) 
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      const { won, drawnCard, newWinAmount, houseTvl } = data;
      setGambleCard(drawnCard);
      await new Promise(r => setTimeout(r, 1000));
      setHouseLiquidity(houseTvl);
      if (won) { 
        playSound('gambleWin'); 
        setWinAmount(newWinAmount); 
        addLog(`Gamble WON! New profit: $${newWinAmount.toFixed(2)}`); 
        setGambleCard(null); 
      } else { 
        playSound('gambleLose'); 
        setWinAmount(0); 
        setGambleMode(false); 
        addLog('Gamble LOST. Position liquidated.'); 
        setGambleCard(null); 
        setActiveTrade(null); 
        setGrid(generateGrid()); 
        setLosingCells([]); 
        setChartData(p => { 
          const n = [...p]; 
          if(n.length>0) n[n.length-1].balance -= originalWinAmount; 
          return n; 
        }); 
        fetchAiAlpha();
        fetchSentiment();
      }
    } catch (e) { 
      addLog(`ERROR: Gamble request failed.`); 
    }
  };

  const collectWinnings = async (addLog: (msg: string) => void) => {
    if (tradeResultForAnimation) return;
    try {
      const res = await fetch('/api/collect', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress }) 
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      setBalance(data.balance); 
      setWinAmount(0); 
      setGambleMode(false); 
      setActiveTrade(null); 
      setWinningCells([]); 
      setGrid(generateGrid()); 
      addLog('Profits secured to wallet.');
      fetchAiAlpha();
      fetchSentiment();
    } catch (e) { 
      addLog(`ERROR: Collect request failed.`); 
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
    balance, setBalance,
    houseLiquidity, setHouseLiquidity,
    bet, setBet,
    grid, setGrid,
    spinning,
    winAmount, setWinAmount,
    winningCells, setWinningCells,
    losingCells, setLosingCells,
    freeSpins, setFreeSpins,
    gambleMode, setGambleMode,
    gambleCard, setGambleCard,
    riskLevel, setRiskLevel,
    chartData, setChartData,
    tradeCount, setTradeCount,
    activeTrade, setActiveTrade,
    tradeResultForAnimation, setTradeResultForAnimation,
    showFreeSpinsBonus, setShowFreeSpinsBonus,
    pendingFreeSpins, setPendingFreeSpins,
    autoSpins, setAutoSpins,
    turboMode, setTurboMode,
    aiAlpha, isAiLoading, fetchAiAlpha,
    sentimentData, fetchSentiment,
    isStopping: isStoppingRef.current,
    handleSpin,
    handleStop,
    handleGamble,
    collectWinnings,
    generateGrid
  };
};