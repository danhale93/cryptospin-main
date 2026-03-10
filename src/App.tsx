"use client";

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import TradePage from './pages/TradePage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(p => [...p.slice(-19), msg]);

  const handleLogin = async (address: string) => {
    try {
      const res = await fetch('/api/auth', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ address }) 
      });
      if (!res.ok) throw new Error(`API auth failed: ${res.statusText}`);
      const data = await res.json();
      
      setUserData({
        address: data.user.address,
        balance: data.user.balance,
        winAmount: data.user.win_amount,
        freeSpins: data.user.free_spins,
        xp: data.user.xp,
        level: data.user.level,
        houseTvl: data.houseTvl
      });
      setIsLoggedIn(true);
      localStorage.setItem('walletAddress', address);
    } catch (e: any) {
      console.error("Login failed", e);
      handleLogout();
    }
  };

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) handleLogin(storedAddress);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    setIsLoggedIn(false);
    setUserData(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} addLog={addLog} />;
  }

  return (
    <TradePage 
      walletAddress={userData.address}
      initialBalance={userData.balance}
      initialWinAmount={userData.winAmount}
      initialFreeSpins={userData.freeSpins}
      initialHouseTvl={userData.houseTvl}
      initialXp={userData.xp}
      initialLevel={userData.level}
    />
  );
}