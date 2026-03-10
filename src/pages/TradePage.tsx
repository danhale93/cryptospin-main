"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import PayIDModal from '../components/PayIDModal';
import FreeSpinsBonus from '../components/FreeSpinsBonus';
import SlotMachine from '../components/SlotMachine';
import ControlPanel from '../components/ControlPanel';
import StatsPanel from '../components/StatsPanel';
import GamblePanel from '../components/GamblePanel';
import { useAudio } from '../hooks/useAudio';
import { TOKENS, BET_AMOUNTS, SUITS } from '../constants/game';

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

interface TradePageProps {
  walletAddress: string;
  initialBalance: number;
  initialWinAmount: number;
  initialFreeSpins: number;
  initialHouseTvl: number;
  onLogout: () => void;
}

export default function TradePage({
  walletAddress,
  initialBalance,
  initialWinAmount,
  initialFreeSpins,
  initialHouseTvl,
  onLogout
}: TradePageProps) {
  const { playSound } = useAudio();
  const [balance, setBalance] = useState(initialBalance);
  const [houseLiquidity, setHouseLiquidity] = useState(initialHouseTvl);
  const [bet, setBet] = useState(1);
  const [grid, setGrid] = useState(generateGrid());
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(initialWinAmount);
  const [winningCells, setWinningCells] = useState<{r: number, c: number}[]>([]);
  const [losingCells, setLosingCells] = useState<{r: number, c: number}[]>([]);
  const [freeSpins, setFreeSpins] = useState(initialFreeSpins);
  const [gambleMode, setGambleMode] = useState(false);
  const [gambleCard, setGambleCard] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>(["Welcome! Set your bet and risk, then hit Execute."]);
  const [activeTab, setActiveTab] = useState<'chart' | 'logs'>('chart');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MED' | 'HIGH' | 'DEGEN'>('MED');
  const [chartData, setChartData] = useState<{ trade: number, balance: number }[]>([{ trade: 0, balance: initialBalance }]);
  const [tradeCount, setTradeCount] = useState(0);
  const [activeTrade, setActiveTrade] = useState<{ name: string, steps: string[], currentStep: number, isWin: boolean } | null>(null);
  const [tradeResultForAnimation, setTradeResultForAnimation] = useState<"win" | "loss" | null>(null);
  const [showFreeSpinsBonus, setShowFreeSpinsBonus] = useState(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  const [autoSpins, setAutoSpins] = useState(0);
  const isStoppingRef = useRef(false);
  const spinStartTime = useRef(0);
  const [showPayIDModal, setShowPayIDModal] = useState(false);

  const addLog = (msg: string) => setLogs(p => [...p.slice(-19), msg]);

  useEffect(() => {
    if ((freeSpins > 0 || autoSpins > 0) && !spinning && !tradeResultForAnimation && winAmount === 0 && !gambleMode && !showFreeSpinsBonus) {
        const timer = setTimeout(() => {
            handleSpin();
            if (autoSpins > 0) setAutoSpins(prev => prev - 1);
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [freeSpins, autoSpins, spinning, winAmount, tradeResultForAnimation, gambleMode, showFreeSpinsBonus]);

  const handleAnimationComplete = () => {
    const result = tradeResultForAnimation;
    if (result === 'win') {
        playSound('win');
        setWinningCells(Array.from({length: 5}, (_, i) => ({r:1, c:i})));
        addLog(`[TX] ${activeTrade?.name || 'Trade'} closed in PROFIT! +$${winAmount.toFixed(2)}`);
        setTradeResultForAnimation(null);
        if (pendingFreeSpins > 0) setShowFreeSpinsBonus(true);
    } else if (result === 'loss') {
        playSound('lose');
        setLosingCells(Array.from({length: 5}, (_, i) => ({r:1, c:i})));
        addLog(`[TX] ${activeTrade?.name || 'Trade'} RUGGED! Loss: -$${bet.toFixed(2)}`);
        setTimeout(() => {
            setActiveTrade(null);
            setLosingCells([]);
            setGrid(generateGrid()); 
            setTradeResultForAnimation(null);
            if (pendingFreeSpins > 0) setShowFreeSpinsBonus(true);
        }, 1500); 
    }
  };

  const handleStop = () => {
    if(spinning) {
      const elapsed = Date.now() - spinStartTime.current;
      if (elapsed > 500) {
        isStoppingRef.current = true;
      }
    }
  }

  const handleSpin = async () => {
    if (spinning || winAmount > 0 || tradeResultForAnimation) return;
    if (balance < bet && freeSpins === 0) { addLog('ERROR: Insufficient funds.'); setAutoSpins(0); return; }

    playSound('click');
    isStoppingRef.current = false;
    spinStartTime.current = Date.now();
    setSpinning(true);
    setWinningCells([]); setLosingCells([]); setGambleMode(false); setActiveTrade(null);
    if (winAmount > 0) await collectWinnings();
    
    const currentBet = freeSpins > 0 ? 0 : bet;
    
    try {
      const res = await fetch('/api/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, betAmount: currentBet, riskLevel }) });
      const data = await res.json();
      if (data.error) { addLog(`ERROR: ${data.error}`); setSpinning(false); return; }

      const { finalGrid, isWin, strategy, scatters, user, houseTvl } = data;
      setActiveTrade({ name: strategy.name, steps: strategy.steps, currentStep: 0, isWin });
      addLog(`[API] Initiating ${strategy.name} at $${currentBet} (${riskLevel} Risk)...`);

      const spinDuration = 2000 + Math.random() * 1000;
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
          }
      }, 100);

    } catch (e) { addLog(`ERROR: Backend connection failed.`); setSpinning(false); }
  };

  const handleGamble = async (type: 'RED' | 'BLACK' | 'SUIT', suitId?: string) => {
    if (winAmount <= 0) return;
    const originalWinAmount = winAmount;
    try {
      const res = await fetch('/api/gamble', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, type, suitId }) });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      const { won, drawnCard, newWinAmount, houseTvl } = data;
      setGambleCard(drawnCard);
      await new Promise(r => setTimeout(r, 1000));
      setHouseLiquidity(houseTvl);
      if (won) { playSound('gambleWin'); setWinAmount(newWinAmount); addLog(`Gamble WON! New profit: $${newWinAmount.toFixed(2)}`); setGambleCard(null); }
      else { playSound('gambleLose'); setWinAmount(0); setGambleMode(false); addLog('Gamble LOST. Position liquidated.'); setGambleCard(null); setActiveTrade(null); setGrid(generateGrid()); setLosingCells([]); setChartData(p => { const n = [...p]; if(n.length>0) n[n.length-1].balance -= originalWinAmount; return n; }); }
    } catch (e) { addLog(`ERROR: Gamble request failed.`); }
  };

  const collectWinnings = async () => {
    if (tradeResultForAnimation) return;
    try {
      const res = await fetch('/api/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress }) });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      setBalance(data.balance); setWinAmount(0); setGambleMode(false); setActiveTrade(null); setWinningCells([]); setGrid(generateGrid()); addLog('Profits secured to wallet.');
    } catch (e) { addLog(`ERROR: Collect request failed.`); }
  };
  
  const handleDeposit = async (amount: number) => {
    try {
        const res = await fetch('/api/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, amount }) });
        const data = await res.json();
        if (data.error) addLog(`ERROR: ${data.error}`);
        else { setBalance(data.balance); addLog(`[API] Deposit of $${amount} successful. New balance: $${data.balance.toFixed(2)}`); }
    } catch (e) { addLog('ERROR: Deposit request failed.'); }
  };

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 font-sans flex flex-col overflow-hidden text-sm">
      <AnimatePresence>{showPayIDModal && <PayIDModal onClose={() => setShowPayIDModal(false)} onDeposit={handleDeposit} addLog={addLog} />}</AnimatePresence>
      <AnimatePresence>{showFreeSpinsBonus && <FreeSpinsBonus spins={pendingFreeSpins} onStart={() => { setShowFreeSpinsBonus(false); setPendingFreeSpins(0); }} />}</AnimatePresence>

      <Header 
        houseLiquidity={houseLiquidity}
        balance={balance}
        walletAddress={walletAddress}
        isWithdrawing={false}
        tradeResultForAnimation={tradeResultForAnimation}
        spinning={spinning}
        autoSpins={autoSpins}
        onShowDeposit={() => setShowPayIDModal(true)}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-1 sm:p-2 flex flex-col lg:flex-row gap-1 sm:gap-2 min-h-0 overflow-hidden">
        <SlotMachine 
          grid={grid}
          spinning={spinning}
          isStopping={isStoppingRef.current}
          winningCells={winningCells}
          losingCells={losingCells}
          tradeResultForAnimation={tradeResultForAnimation}
          onAnimationComplete={handleAnimationComplete}
          bet={bet}
          winAmount={winAmount}
        />

        <div className="w-full lg:w-72 flex flex-col gap-1 sm:gap-2 shrink-0 min-h-0">
          <AnimatePresence>
            {gambleMode && (
              <GamblePanel 
                winAmount={winAmount}
                gambleCard={gambleCard}
                houseLiquidity={houseLiquidity}
                onGamble={handleGamble}
                onCollect={collectWinnings}
                suits={SUITS}
              />
            )}
          </AnimatePresence>

          <ControlPanel 
            riskLevel={riskLevel}
            setRiskLevel={setRiskLevel}
            bet={bet}
            setBet={setBet}
            spinning={spinning}
            gambleMode={gambleMode}
            tradeResultForAnimation={tradeResultForAnimation}
            autoSpins={autoSpins}
            setAutoSpins={setAutoSpins}
            balance={balance}
            freeSpins={freeSpins}
            isLoggedIn={true}
            winAmount={winAmount}
            houseLiquidity={houseLiquidity}
            onSpin={handleSpin}
            onStop={handleStop}
            onCollect={collectWinnings}
            onGambleMode={() => { playSound('click'); setGambleMode(true); }}
            betAmounts={BET_AMOUNTS}
          />

          <StatsPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            balance={balance}
            tradeCount={tradeCount}
            chartData={chartData}
            logs={logs}
          />
        </div>
      </main>
    </div>
  );
}