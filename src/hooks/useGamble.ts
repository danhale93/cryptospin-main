"use client";

import { useState } from 'react';
import { useAudio } from './useAudio';

export const useGamble = (walletAddress: string, winAmount: number, houseLiquidity: number, jackpot: number) => {
  const { playSound } = useAudio();
  const [gambleMode, setGambleMode] = useState(false);
  const [gambleCard, setGambleCard] = useState<any>(null);

  const handleGamble = async (type: 'RED' | 'BLACK' | 'SUIT', addLog: (msg: string) => void, suitId?: string) => {
    if (winAmount <= 0) return;
    const originalWinAmount = winAmount;
    try {
      const res = await fetch('/api/gamble', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress, type, suitId }) 
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      const { won, drawnCard, newWinAmount, houseTvl, jackpot: newJackpot } = data;
      setGambleCard(drawnCard);
      await new Promise(r => setTimeout(r, 1000));
      
      if (won) { 
        playSound('gambleWin'); 
        setGambleCard(null); 
        return { 
          success: true, 
          newWinAmount, 
          houseLiquidity: houseTvl, 
          jackpot: newJackpot 
        }; 
      } else { 
        playSound('gambleLose'); 
        setGambleMode(false); 
        setGambleCard(null); 
        addLog('Gamble LOST. Position liquidated.'); 
        return { 
          success: false, 
          newWinAmount: 0, 
          houseLiquidity: houseTvl, 
          jackpot: newJackpot 
        }; 
      }
    } catch (e) { 
      addLog(`ERROR: Gamble request failed.`); 
      return { success: false };
    }
  };

  return {
    gambleMode,
    setGambleMode,
    gambleCard,
    setGambleCard,
    handleGamble
  };
};