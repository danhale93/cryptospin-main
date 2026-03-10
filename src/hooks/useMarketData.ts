"use client";

import { useState, useEffect, useCallback } from 'react';

export const useMarketData = (walletAddress: string, tradeCount: number, balance: number) => {
  const [aiAlpha, setAiAlpha] = useState<string>("Waiting for market signal...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState({ sentiment: 'NEUTRAL', status: 'SCANNING MARKET...', score: 50 });

  const fetchAiAlpha = useCallback(async () => {
    if (!walletAddress) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-alpha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });
      const data = await res.json();
      setAiAlpha(data.alpha || "Market's cooked. Signal lost in the mempool. Just HODL.");
    } catch (e) {
      setAiAlpha("Market's cooked. Signal lost in the mempool. Just HODL.");
    } finally {
      setIsAiLoading(false);
    }
  }, [walletAddress]);

  const fetchSentiment = useCallback(async () => {
    try {
      const res = await fetch('/api/market-sentiment');
      const data = await res.json();
      setSentimentData(data);
    } catch (e) {
      setSentimentData({ sentiment: 'NEUTRAL', status: 'MARKET IS TOTALLY COOKED', score: 50 });
    }
  }, []);

  useEffect(() => {
    if ((tradeCount + 1) % 3 === 0 || balance !== 1000) {
      fetchAiAlpha();
      fetchSentiment();
    }
  }, [tradeCount, balance, fetchAiAlpha, fetchSentiment]);

  return {
    aiAlpha,
    isAiLoading,
    fetchAiAlpha,
    sentimentData,
    fetchSentiment
  };
};