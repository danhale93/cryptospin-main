"use client";

export const useDepositWithdraw = (walletAddress: string) => {
  const handleDeposit = async (amount: number, addLog: (msg: string) => void) => {
    try {
      const res = await fetch('/api/deposit', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress, amount }) 
      });
      const data = await res.json();
      if (data.error) addLog(`ERROR: ${data.error}`);
      else { 
        addLog(`[API] Deposit of $${amount} successful. New balance: $${data.balance.toFixed(2)}`); 
        return { success: true, balance: data.balance, houseTvl: data.houseTvl, jackpot: data.jackpot };
      }
    } catch (e) { addLog('ERROR: Deposit request failed.'); }
    return { success: false };
  };

  const handleWithdraw = async (amount: number, addLog: (msg: string) => void) => {
    try {
      const res = await fetch('/api/withdraw', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address: walletAddress, amount }) 
      });
      const data = await res.json();
      if (data.error) addLog(`ERROR: ${data.error}`);
      else { 
        addLog(`[API] Withdrawal of $${amount} successful. New balance: $${data.balance.toFixed(2)}`); 
        return { success: true, balance: data.balance, houseTvl: data.houseTvl, jackpot: data.jackpot };
      }
    } catch (e) { addLog('ERROR: Withdraw request failed.'); }
    return { success: false };
  };

  return { handleDeposit, handleWithdraw };
};