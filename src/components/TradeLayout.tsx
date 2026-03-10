const handleBonusBuy = async (type: string, cost: number, spins: number, multiplierBonus?: number) => {
  if (!walletAddress) {
    throw new Error('Please connect wallet first');
  }

  try {
    const response = await fetch('/api/bonus-buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        bonusType: type,
        cost
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to purchase bonus');
    }

    // Update local state
    trade.setBalance(data.newBalance);
    trade.setFreeSpins(prev => prev + data.freeSpins);
    if (data.multiplier) {
      trade.setMultiplier(prev => Math.max(prev, data.multiplier));
      trade.setMultiplierSpinsRemaining(prev => prev + data.freeSpins);
    }

    addLog(`[BONUS BUY] Successfully purchased ${type}!`);
  } catch (error: any) {
    addLog(`[BONUS BUY] Error: ${error.message}`);
    throw error; // Re-throw so modal knows it failed
  }
};