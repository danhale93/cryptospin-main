"use client";

import { useAudio } from './useAudio';

export const useCollect = (walletAddress: string) => {
  const { playSound } = useAudio();

  const collectWinnings = async (addLog: (msg: string) => void) => {
    try {
      const res = await fetch('/api/collect', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress }) 
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      addLog('Profits secured to wallet.');
      return { success: true, balance: data.balance };
    } catch (e) { 
      addLog(`ERROR: Collect request failed.`); 
      return { success: false };
    }
  };

  return { collectWinnings };
};