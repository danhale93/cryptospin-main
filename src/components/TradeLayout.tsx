"use client";

import React, { useState } from 'react';
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

  const handleBonusBuy = (type: string, cost: number, spins: number, multiplier?: number) => {
    if (trade.balance < cost) {
      addLog('[BONUS BUY] Insufficient balance!');
      return;
    }

    trade.setBalance(prev => prev - cost);
    trade.setFreeSpins(prev => prev + spins);
    if (multiplier && multiplier > 1) {
      trade.setMultiplier(prev => Math.max(prev, multiplier));
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

  const sampleQuests: Quest[] = [
    { id: 1, title: 'First Spin', description: 'Make your first spin', progress: trade.tradeCount > 0 ? 1 : 0, target: 1, reward: 10, completed: trade.tradeCount > 0, category: 'trading' },
    { id: 2, title: 'High Roller', description: 'Reach $10,000 balance', progress: trade.balance, target: 10000, reward: 100, completed: trade.balance >= 10000, category: 'balance' },
    { id: 3, title: 'Spin Master', description: 'Use 100 free spins', progress: 100 - trade.freeSpins, target: 100, reward: 50, completed: trade.freeSpins >= 100, category: 'spins' },
    { id: 4, title: 'Level 10', description: 'Reach level 10', progress: trade.level, target: 10, reward: 75, completed: trade.level >= 10, category: 'achievements' },
  ];

  const sampleLeaderboard: LeaderboardUser[] = [
    { address: '0x1234...5678', balance: 25000, rank: 1, change: 12.5 },
    { address: '0x8765...4321', balance: 18000, rank: 2, change: 8.3 },
    { address: '0xabcd...efgh', balance: 15000, rank: 3, change: -2.1 },
    { address: walletAddress, balance: trade.balance, rank: 42, change: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Header
        houseLiquidity={trade.houseTvl}
        jackpot={5000}
        balance={trade.balance}
        level={trade.level}
        xp={trade.xp}
        walletAddress={walletAddress}
        isWithdrawing={false}
        tradeResultForAnimation={trade.tradeResultForAnimation}
        spinning={false}
        autoSpins={0}
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
              grid={[]}
              spinning={false}
              isStopping={false}
              winningCells={[]}
              losingCells={[]}
              tradeResultForAnimation={null}
              onAnimationComplete={() => {}}
              bet={0}
              winAmount={0}
              activeTrade={null}
              riskLevel="MED"
            />

            <ControlPanel
              riskLevel="MED"
              setRiskLevel={() => {}}
              bet={0}
              setBet={() => {}}
              spinning={false}
              gambleMode={false}
              tradeResultForAnimation={null}
              autoSpins={0}
              setAutoSpins={() => {}}
              turboMode={false}
              setTurboMode={() => {}}
              balance={trade.balance}
              freeSpins={trade.freeSpins}
              isLoggedIn={!!walletAddress}
              winAmount={trade.winAmount}
              houseLiquidity={trade.houseTvl}
              onSpin={() => {}}
              onStop={() => {}}
              onCollect={() => {}}
              onGambleMode={() => {}}
              onBonusBuy={() => setShowBonusBuyModal(true)}
              betAmounts={BET_AMOUNTS}
              multiplier={trade.multiplier}
              multiplierSpinsRemaining={trade.multiplierSpinsRemaining}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'stats', label: 'Stats', icon: BarChart3 },
                { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
                { id: 'quests', label: 'Quests', icon: Activity },
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'ai', label: 'AI', icon: Brain },
              ].map((tab) => {
                const Icon = tab.icon;
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
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="h-[400px]">
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
                  leaderboard={sampleLeaderboard}
                  currentAddress={walletAddress}
                />
              )}
              {activeTab === 'quests' && (
                <QuestsComponent
                  quests={sampleQuests}
                  balance={trade.balance}
                  tradeCount={trade.tradeCount}
                  freeSpins={trade.freeSpins}
                  level={trade.level}
                />
              )}
              {activeTab === 'chat' && (
                <ChatComponent
                  messages={[]}
                  inputText={''}
                  setInputText={() => {}}
                  handleSendMessage={() => {}}
                  currentAddress={walletAddress}
                />
              )}
              {activeTab === 'ai' && (
                <AIComponent
                  aiAlpha={trade.aiAlpha || "Market's cooked. Signal lost in the mempool. Just HODL."}
                  isAiLoading={trade.isAiLoading}
                  onRefreshAi={onRefreshAi}
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