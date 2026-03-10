"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import SlotMachine from './SlotMachine';
import ControlPanel from './ControlPanel';
import StatsPanel from './StatsPanel';
import GlobalTicker from './GlobalTicker';
import { useTrade } from '../hooks/useTrade';
import { BET_AMOUNTS } from '../constants/game'; // Added import

interface TradeLayoutProps {
  walletAddress: string;
  initialBalance: number;
  initialWinAmount: number;
  initialFreeSpins: number;
  initialHouseTvl: number;
  initialXp: number;
  initialLevel: number;
}

const TradeLayout = ({ 
  walletAddress, 
  initialBalance,
  initialWinAmount,
  initialFreeSpins,
  initialHouseTvl,
  initialXp,
  initialLevel
}: TradeLayoutProps) => {
  const trade = useTrade({
    walletAddress,
    initialBalance,
    initialWinAmount,
    initialFreeSpins,
    initialHouseTvl,
    initialXp,
    initialLevel
  });

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 font-sans flex flex-col overflow-hidden text-sm">
      <Header 
        houseLiquidity={trade.houseLiquidity}
        jackpot={trade.jackpot}
        balance={trade.balance}
        level={trade.level}
        xp={trade.xp}
        walletAddress={walletAddress}
        isWithdrawing={false}
        tradeResultForAnimation={trade.tradeResultForAnimation}
        spinning={trade.spinning}
        autoSpins={trade.autoSpins}
        onShowDeposit={() => { /* now handled via PayID modal */ }}
        onShowWithdraw={() => { /* handled via withdraw modal */ }}
        onLogout={() => { /* handled by parent */ }}
        sentimentData={trade.sentimentData as any}
        addLog={() => {}} // No-op addLog for Header
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-1 sm:p-2 flex flex-col lg:flex-row gap-1 sm:gap-2 min-h-0 overflow-hidden">
        <SlotMachine 
          grid={trade.grid}
          spinning={trade.spinning}
          isStopping={trade.isStopping}
          winningCells={trade.winningCells}
          losingCells={trade.losingCells}
          tradeResultForAnimation={trade.tradeResultForAnimation}
          onAnimationComplete={() => { /* animation complete handler */ }}
          bet={trade.bet}
          winAmount={trade.winAmount}
          activeTrade={trade.activeTrade}
          riskLevel={trade.riskLevel}
        />

        <div className="w-full lg:w-72 flex flex-col gap-1 sm:gap-2 shrink-0 min-h-0">
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
            turboMode={trade.turboMode}
            setTurboMode={trade.setTurboMode}
            balance={trade.balance}
            freeSpins={trade.freeSpins}
            isLoggedIn={true}
            winAmount={trade.winAmount}
            houseLiquidity={trade.houseLiquidity}
            onSpin={() => trade.handleSpin(() => {})}
            onStop={trade.handleStop}
            onCollect={() => trade.collectWinnings(() => {})}
            onGambleMode={() => { /* gamble mode toggle */ }}
            onBonusBuy={() => trade.handleBonusBuy(() => {})}
            betAmounts={BET_AMOUNTS} // Added betAmounts prop
          />

          <StatsPanel 
            activeTab="chart"
            setActiveTab={() => {}}
            balance={trade.balance}
            tradeCount={trade.tradeCount}
            chartData={trade.chartData}
            aiAlpha={trade.aiAlpha}
            isAiLoading={trade.isAiLoading}
            onRefreshAi={() => trade.fetchAiAlpha()}
            leaderboard={[]}
            tradeHistory={[]}
            currentAddress={walletAddress}
          />
        </div>
      </main>
      <GlobalTicker />
    </div>
  );
};

export default TradeLayout;