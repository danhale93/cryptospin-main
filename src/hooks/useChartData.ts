"use client";

import { useState, useCallback } from 'react';

export const useChartData = (initialBalance: number) => {
  const [chartData, setChartData] = useState<{ trade: number, balance: number }[]>([{ trade: 0, balance: initialBalance }]);
  const [tradeCount, setTradeCount] = useState(0);

  const addTradePoint = useCallback((balance: number, isWin: boolean, betAmount: number) => {
    setTradeCount(prev => {
      const newCount = prev + 1;
      setChartData(prevData => [...prevData, { trade: newCount, balance }]);
      return newCount;
    });
  }, []);

  const resetChartData = useCallback((balance: number) => {
    setChartData([{ trade: 0, balance }]);
    setTradeCount(0);
  }, []);

  return {
    chartData,
    tradeCount,
    addTradePoint,
    resetChartData
  };
};