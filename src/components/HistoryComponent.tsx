"use client";

import React from 'react';

interface TradeRecord {
  trade_id: number;
  bet_amount: number;
  risk_level: string;
  is_win: boolean;
  win_amount: number;
  strategy_name: string;
  timestamp: string;
}

interface HistoryComponentProps {
  tradeHistory: TradeRecord[];
}

const HistoryComponent = ({ tradeHistory }: HistoryComponentProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Trade History</span>
        <span className="text-[8px] text-zinc-500 font-mono uppercase">Last {tradeHistory.length} TXs</span>
      </div>
      <div className="flex-1 space-y-1.5">
        {tradeHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono italic">
            No trades executed yet...
          </div>
        ) : (
          tradeHistory.map((trade) => (
            <div key={trade.trade_id} className="bg-zinc-900/50 border border-zinc-800 rounded p-1.5 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">{trade.strategy_name}</span>
                <span className={`text-[10px] font-mono font-bold ${trade.is_win ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trade.is_win ? `+$${trade.win_amount.toFixed(2)}` : `-$${trade.bet_amount.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                <div className="flex gap-2">
                  <span>SIZE: ${trade.bet_amount}</span>
                  <span>RISK: {trade.risk_level}</span>
                </div>
                <span>{new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryComponent;