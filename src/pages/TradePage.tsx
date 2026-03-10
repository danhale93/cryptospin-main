"use client";

import React from 'react';
import TradeLayout from '../components/TradeLayout';

export default function TradePage({
  walletAddress,
  initialBalance,
  initialWinAmount,
  initialFreeSpins,
  initialHouseTvl,
  initialXp,
  initialLevel,
  onLogout
}: any) {
  return (
    <TradeLayout
      walletAddress={walletAddress}
      initialBalance={initialBalance}
      initialWinAmount={initialWinAmount}
      initialFreeSpins={initialFreeSpins}
      initialHouseTvl={initialHouseTvl}
      initialXp={initialXp}
      initialLevel={initialLevel}
      onLogout={onLogout}
    />
  );
}