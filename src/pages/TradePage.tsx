"use client";

import React from 'react';
import TradeLayout from '../components/TradeLayout';
import { useTrade } from '../hooks/useTrade';

export default function TradePage({
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

  return (
    <TradeLayout
      walletAddress={walletAddress}
      initialBalance={trade.balance}
      initialWinAmount={trade.winAmount}
      initialFreeSpins={trade.freeSpins}
      initialHouseTvl={trade.houseLiquidity}
      initialXp={trade.xp}
      initialLevel={trade.level}
      onLogout={() => { /* handle logout */ }}
    />
  );
}