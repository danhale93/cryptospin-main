"use client";

import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface ChartComponentProps {
  balance: number;
  tradeCount: number;
  chartData: any[];
}

const ChartComponent = ({ balance, tradeCount, chartData }: ChartComponentProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-1">
        <div>
          <div className="text-[9px] text-zinc-500 font-mono">NET PNL</div>
          <div className={`text-sm font-bold font-mono ${balance >= 1000 ? 'text-emerald-400' : 'text-red-400'}`}>
            {balance >= 1000 ? '+' : '-'}${Math.abs(balance - 1000).toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-zinc-500 font-mono">TRADES</div>
          <div className="text-xs font-bold text-white font-mono">{tradeCount}</div>
        </div>
      </div>
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', padding: '4px' }} 
              itemStyle={{ color: '#34d399' }} 
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'Balance']} 
              labelFormatter={(l) => `Trade ${l}`} 
            />
            <ReferenceLine y={1000} stroke="#3f3f46" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke={balance >= 1000 ? '#34d399' : '#ef4444'} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartComponent;