"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import PayIDModal from '../components/PayIDModal';
import WithdrawModal from '../components/WithdrawModal';
import FreeSpinsBonus from '../components/FreeSpinsBonus';
import SlotMachine from '../components/SlotMachine';
import ControlPanel from '../components/ControlPanel';
import StatsPanel from '../components/StatsPanel';
import GamblePanel from '../components/GamblePanel';
import { useAudio } from '../hooks/useAudio';
import { useTrade } from '../hooks/useTrade';
import { BET_AMOUNTS, SUITS } from '../constants/game';

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
  const trade = useTrade(walletAddress, {
    balance: initialBalance,
    winAmount: initialWinAmount,
    freeSpins: initialFreeSpins,
    houseTvl: initialHouseTvl
  });

  const [logs, setLogs] = useState<string[]>(["Welcome! Set your bet and risk, then hit Execute."]);
  const [activeTab, setActiveTab] = useState<'chart' | 'logs'>('chart');
  const [showPayIDModal, setShowPayIDModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const addLog = (msg: string) => setLogs(p => [...p.slice(-19), msg]);

  useEffect(() => {
    if ((trade.freeSpins > 0 || trade.autoSpins > 0) && !trade.spinning && !trade.tradeResultForAnimation && trade.winAmount === 0 && !trade.gambleMode && !trade.showFreeSpinsBonus) {
        const timer = setTimeout(() => {
            trade.handleSpin(addLog);
            if (trade.autoSpins > 0) trade.setAutoSpins(prev => prev - 1);
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [trade.freeSpins, trade.autoSpins, trade.spinning, trade.winAmount, trade.tradeResultForAnimation, trade.gambleMode, trade.showFreeSpinsBonus]);

  const handleAnimationComplete = () => {
    const result = trade.tradeResultForAnimation;
    if (result === 'win') {
        playSound('win');
        trade.setWinningCells(Array.from({length: 5}, (_, i) => ({r:1, c:i})));
        addLog(`[TX] ${trade.activeTrade?.name || 'Trade'} closed in PROFIT! +$${trade.winAmount.toFixed(2)}`);
        trade.setTradeResultForAnimation(null);
        if (trade.pendingFreeSpins > 0) trade.setShowFreeSpinsBonus(true);
    } else if (result === 'loss') {
        playSound('lose');
        trade.setLosingCells(Array.from({length: 5}, (_, i) => ({r:1, c:i})));
        addLog(`[TX] ${trade.activeTrade?.name || 'Trade'} RUGGED! Loss: -$${trade.bet.toFixed(2)}`);
        setTimeout(() => {
            trade.setActiveTrade(null);
            trade.setLosingCells([]);
            trade.setGrid(trade.generateGrid()); 
            trade.setTradeResultForAnimation(null);
            if (trade.pendingFreeSpins > 0) trade.setShowFreeSpinsBonus(true);
        }, 1500); 
    }
  };

  const handleDeposit = async (amount: number) => {
    try {
        const res = await fetch('/api/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, amount }) });
        const data = await res.json();
        if (data.error) addLog(`ERROR: ${data.error}`);
        else { 
          trade.setBalance(data.balance); 
          trade.setHouseLiquidity(data.houseTvl);
          addLog(`[API] Deposit of $${amount} successful. New balance: $${data.balance.toFixed(2)}`); 
        }
    } catch (e) { addLog('ERROR: Deposit request failed.'); }
  };

  const handleWithdraw = async (amount: number) => {
    try {
        const res = await fetch('/api/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, amount }) });
        const data = await res.json();
        if (data.error) addLog(`ERROR: ${data.error}`);
        else { 
          trade.setBalance(data.balance); 
          trade.setHouseLiquidity(data.houseTvl);
          addLog(`[API] Withdrawal of $${amount} successful. New balance: $${data.balance.toFixed(2)}`); 
        }
    } catch (e) { addLog('ERROR: Withdrawal request failed.'); }
  };

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 font-sans flex flex-col overflow-hidden text-sm">
      <AnimatePresence>{showPayIDModal && <PayIDModal onClose={() => setShowPayIDModal(false)} onDeposit={handleDeposit} addLog={addLog} />}</AnimatePresence>
      <AnimatePresence>{showWithdrawModal && <WithdrawModal balance={trade.balance} onClose={() => setShowWithdrawModal(false)} onWithdraw={handleWithdraw} />}</AnimatePresence>
      <AnimatePresence>{trade.showFreeSpinsBonus && <FreeSpinsBonus spins={trade.pendingFreeSpins} onStart={() => { trade.setShowFreeSpinsBonus(false); trade.setPendingFreeSpins(0); }} />}</AnimatePresence>

      <Header 
        houseLiquidity={trade.houseLiquidity}
        balance={trade.balance}
        walletAddress={walletAddress}
        isWithdrawing={false}
        tradeResultForAnimation={trade.tradeResultForAnimation}
        spinning={trade.spinning}
        autoSpins={trade.autoSpins}
        onShowDeposit={() => setShowPayIDModal(true)}
        onShowWithdraw={() => setShowWithdrawModal(true)}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-1 sm:p-2 flex flex-col lg:flex-row gap-1 sm:gap-2 min-h-0 overflow-hidden">
        <SlotMachine 
          grid={trade.grid}
          spinning={trade.spinning}
          isStopping={trade.isStopping}
          winningCells={trade.winningCells}
          losingCells={trade.losingCells}
          tradeResultForAnimation={trade.tradeResultForAnimation}
          onAnimationComplete={handleAnimationComplete}
          bet={trade.bet}
          winAmount={trade.winAmount}
        />

        <div className="w-full lg:w-72 flex flex-col gap-1 sm:gap-2 shrink-0 min-h-0">
          <AnimatePresence>
            {trade.gambleMode && (
              <GamblePanel 
                winAmount={trade.winAmount}
                gambleCard={trade.gambleCard}
                houseLiquidity={trade.houseLiquidity}
                onGamble={(type, suitId) => trade.handleGamble(type, addLog, suitId)}
                onCollect={() => trade.collectWinnings(addLog)}
                suits={SUITS}
              />
            )}
          </AnimatePresence>

          <ControlPanel 
            riskLevel={trade.riskLevel}
            setRiskLevel={trade.setRiskLevel}
            bet={trade.bet}
            setBet={trade.setBet}
            spinning={trade.spinning}
            gambleMode={trade.gambleMode}
            tradeResultForAnimation={trade.tradeResultForAnimation}
            autoSpins={trade.autoSpins}
            setAutoSpins={trade.setAutoSpins}
            balance={trade.balance}
            freeSpins={trade.freeSpins}
            isLoggedIn={true}
            winAmount={trade.winAmount}
            houseLiquidity={trade.houseLiquidity}
            onSpin={() => trade.handleSpin(addLog)}
            onStop={trade.handleStop}
            onCollect={() => trade.collectWinnings(addLog)}
            onGambleMode={() => { playSound('click'); trade.setGambleMode(true); }}
            betAmounts={BET_AMOUNTS}
          />

          <StatsPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            balance={trade.balance}
            tradeCount={trade.tradeCount}
            chartData={trade.chartData}
            logs={logs}
          />
        </div>
      </main>
    </div>
  );
}