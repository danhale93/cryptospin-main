"use client";

export const useBonusBuy = (walletAddress: string, bet: number) => {
  const handleBonusBuy = async (addLog: (msg: string) => void) => {
    try {
      const res = await fetch('/api/bonus-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, betAmount: bet })
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      return { success: true, user: data.user };
    } catch (e) { 
      addLog('ERROR: Bonus Buy failed.'); 
      return { success: false };
    }
  };

  return { handleBonusBuy };
};