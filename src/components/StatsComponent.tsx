"use client";

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis, XAxis, Tooltip, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface StatsComponentProps {
  balance: number;
  tradeCount: number;
  chartData: Array<{ trade: number; balance: number }>;
  initialBalance: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[9px] font-mono shadow-xl">
        <div className="text-zinc-400">Trade #{data.trade}</div>
        <div className="text-emerald-400">Balance: ${data.balance.toFixed(2)}</div>
        <div className={`font-bold ${data.balance >= 1000 ? 'text-emerald-400' : 'text-red-400'}`}>
          PnL: ${(data.balance - 1000).toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

export default function StatsComponent({
  balance,
  tradeCount,
  chartData,
  initialBalance = 1000
}: StatsComponentProps) {
  const pnl = balance - initialBalance;
  const pnlPercentage = ((pnl / initialBalance) * 100).toFixed(2);

  // Calculate win rate
  const wins = chartData.filter((d, i) => i > 0 && d.balance > chartData[i-1].balance).length;
  const winRate = tradeCount > 0 ? ((wins / tradeCount) * 100).toFixed(0) : '0';

  // Calculate max drawdown
  const drawdowns = chartData.map(d => initialBalance - d.balance).filter(d => d > 0);
  const maxDrawdown = drawdowns.length > 0 ? Math.max(...drawdowns) : 0;

  // Calculate average trade
  const totalPnL = Math.abs(pnl);
  const avgTrade = tradeCount > 0 ? (totalPnL / tradeCount).toFixed(2) : '0.00';

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="text-[8px] text-zinc-500 font-mono">NET PNL</div>
          <div className={`text-lg font-bold font-mono ${
            pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
            <span className="text-xs text-zinc-500 ml-1">
              ({pnlPercentage}%)
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-zinc-500 font-mono">TRADES</div>
          <div className="text-xs font-bold text-white font-mono">{tradeCount}</div>
        </div>
      </div>

      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={pnl >= 0 ? "#34d399" : "#ef4444"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={pnl >= 0 ? "#34d399" : "#ef4444"} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="trade" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={initialBalance} stroke="#3f3f46" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke={pnl >= 0 ? "#34d399" : "#ef4444"} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorPnl)" 
              dot={false} 
              isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800">
        <div className="text-center">
          <div className="text-[7px] text-zinc-500 uppercase">Win Rate</div>
          <div className="text-[10px] font-bold text-emerald-400">
            {winRate}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[7px] text-zinc-500 uppercase">Avg Trade</div>
          <div className="text-[10px] font-bold text-white">
            ${avgTrade}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[7px] text-zinc-500 uppercase">Max Drawdown</div>
          <div className="text-[10px] font-bold text-red-400">
            ${maxDrawdown.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}