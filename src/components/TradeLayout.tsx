"use client";

import React, { useState, useEffect } from 'react';
import TradeLayout from '../components/TradeLayout';
import { useTrade } from '../hooks/useTrade';
import { useUser } from '../hooks/useUser';
import { useApp } from '../hooks/useApp';
import Header from './Header';
import SlotMachine from './SlotMachine';
import ControlPanel from './ControlPanel';
import StatsComponent from './StatsComponent';
import LeaderboardComponent from './LeaderboardComponent';
import QuestsComponent from './QuestsComponent';
import ChatComponent from './ChatComponent';
import AIComponent from './AIComponent';
import BonusBuyModal from './BonusBuyModal';
import WithdrawModal from './WithdrawModal';
import { BET_AMOUNTS } from '../constants/bets';
import { Quest, LeaderboardUser } from '../types';

export default function TradeLayout({
  walletAddress,
  initialBalance,
  initialWinAmount,
  initialFreeSpins,
  initialHouseTvl,
  initialXp,
  initialLevel
}: any) {
  const trade = useTrade({
    walletAddress,
    initialBalance,
    initialWinAmount,
    initialFreeSpins,
    initialHouseTvl,
    initialXp,
    initialLevel
  });

  const { addLog } = useUser();
  const { onRefreshAi } = useApp();

  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard' | 'quests' | 'chat' | 'ai'>('stats');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBonusBuyModal, setShowBonusBuyModal] = useState(false);

  // Generate sample quests based on actual state
  const generateQuests = (): Quest[] => {
    const currentBalance = trade.balance;
    const tradeCount = trade.tradeCount;
    const freeSpins = trade.freeSpins;
    const level = trade.level;

    return [
      {
        id: 1,
        title: 'First Spin',
        description: 'Make your first spin',
        progress: tradeCount > 0 ? 1 : 0,
        target: 1,
        reward: 10,
        completed: tradeCount > 0,
        category: 'trading'
      },
      {
        id: 2,
        title: 'High Roller',
        description: 'Reach $10,000 balance',
        progress: Math.min(currentBalance, 10000),
        target: 10000,
        reward: 100,
        completed: currentBalance >= 10000,
        category: 'balance'
      },
      {
        id: 3,
        title: 'Spin Master',
        description: 'Use 100 free spins',
        progress: Math.max(0, 100 - freeSpins),
        target: 100,
        reward: 50,
        completed: freeSpins >= 100,
        category: 'spins'
      },
      {
        id: 4,
        title: 'Level 10',
        description: 'Reach level 10',
        progress: level,
        target: 10,
        reward: 75,
        completed: level >= 10,
        category: 'achievements'
      },
      {
        id: 5,
        title: 'Whale Status',
        description: 'Reach $50,000 balance',
        progress: Math.min(currentBalance, 50000),
        target: 50000,
        reward: 500,
        completed: currentBalance >= 50000,
        category: 'balance'
      },
      {
        id: 6,
        title: 'Degen Trader',
        description: 'Complete 100 trades',
        progress: tradeCount,
        target: 100,
        reward: 100,
        completed: tradeCount >= 100,
        category: 'trading'
      }
    ];
  };

  const handleBonusBuy = (type: string, cost: number, spins: number, multiplier?: number) => {
    if (trade.balance < cost) {
      addLog('[BONUS BUY] Insufficient balance!');
      return;
    }

    // Deduct cost immediately for UX
    trade.setBalance(prev => prev - cost);
    trade.setFreeSpins(prev => prev + spins);
    if (multiplier && multiplier > 1) {
      trade.setMultiplier(prev => Math.max(prev, multiplier));
      trade.setMultiplierSpinsRemaining(prev => prev + 10); // 10 spins with multiplier
    }

    addLog(`[BONUS BUY] Purchased ${type} for $${cost}. Added ${spins} free spins${multiplier ? ` and ${multiplier}x multiplier` : ''}!`);
    setShowBonusBuyModal(false);
  };

  const handleWithdraw = async (amount: number) => {
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, amount })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Withdraw failed');

      trade.setBalance(data.balance);
      addLog(`[WITHDRAW] Successfully withdrew $${amount}. New balance: $${data.balance.toFixed(2)}`);
      setShowWithdrawModal(false);
    } catch (error: any) {
      addLog(`[WITHDRAW] Error: ${error.message}`);
    }
  };

  const quests = generateQuests();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Header
        houseLiquidity={trade.houseTvl}
        jackpot={trade.jackpot}
        balance={trade.balance}
        level={trade.level}
        xp={trade.xp}
        walletAddress={walletAddress}
        isWithdrawing={false}
        tradeResultForAnimation={trade.tradeResultForAnimation}
        spinning={trade.spinning}
        autoSpins={trade.autoSpins}
        onShowDeposit={() => {}}
        onShowWithdraw={() => setShowWithdrawModal(true)}
        onLogout={() => {}}
        sentimentData={trade.sentimentData}
        addLog={addLog}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <SlotMachine
              grid={trade.grid}
              spinning={trade.spinning}
              isStopping={trade.isStopping}
              winningCells={trade.winningCells}
              losingCells={trade.losingCells}
              tradeResultForAnimation={trade.tradeResultForAnimation}
              onAnimationComplete={() => {
                setTradeResultForAnimation(null);
              }}
              bet={trade.bet}
              winAmount={trade.winAmount}
              activeTrade={trade.activeTrade}
              riskLevel={trade.riskLevel}
            />

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
              isLoggedIn={!!walletAddress}
              winAmount={trade.winAmount}
              houseLiquidity={trade.houseTvl}
              onSpin={() => trade.onSpin(trade.bet)}
              onStop={trade.onStop}
              onCollect={trade.onCollect}
              onGambleMode={() => trade.setGambleMode(true)}
              onBonusBuy={() => setShowBonusBuyModal(true)}
              betAmounts={BET_AMOUNTS}
              multiplier={trade.multiplier}
              multiplierSpinsRemaining={trade.multiplierSpinsRemaining}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'stats', label: 'Stats', icon: 'BarChart3' },
                { id: 'leaderboard', label: 'Leaderboard', icon: 'TrendingUp' },
                { id: 'quests', label: 'Quests', icon: 'Activity' },
                { id: 'chat', label: 'Chat', icon: 'MessageSquare' },
                { id: 'ai', label: 'AI', icon: 'Brain' },
              ].map((tab) => {
                const IconComponent = require('lucide-react')[tab.icon as keyof typeof require('lucide-react')];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <IconComponent size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="h-[500px]">
              {activeTab === 'stats' && (
                <StatsComponent
                  balance={trade.balance}
                  tradeCount={trade.tradeCount}
                  chartData={trade.chartData || []}
                  initialBalance={1000}
                />
              )}
              {activeTab === 'leaderboard' && (
                <LeaderboardComponent
                  leaderboard={trade.leaderboard}
                  currentAddress={walletAddress}
                />
              )}
              {activeTab === 'quests' && (
                <QuestsComponent
                  quests={quests}
                  balance={trade.balance}
                  tradeCount={trade.tradeCount}
                  freeSpins={trade.freeSpins}
                  level={trade.level}
                />
              )}
              {activeTab === 'chat' && (
                <ChatComponent
                  messages={trade.messages}
                  inputText={trade.inputText}
                  setInputText={trade.setInputText}
                  handleSendMessage={trade.onSendMessage}
                  currentAddress={walletAddress}
                />
              )}
              {activeTab === 'ai' && (
                <AIComponent
                  aiAlpha={trade.aiAlpha}
                  isAiLoading={trade.isAiLoading}
                  onRefreshAi={trade.onRefreshAi}
                  balance={trade.balance}
                  tradeCount={trade.tradeCount}
                  sentimentData={trade.sentimentData}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        balance={trade.balance}
        addLog={addLog}
      />

      <BonusBuyModal
        isOpen={showBonusBuyModal}
        onClose={() => setShowBonusBuyModal(false)}
        onPurchase={handleBonusBuy}
        balance={trade.balance}
        addLog={addLog}
      />
    </div>
  );
}