import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Play, Zap, Activity, Search, Image as ImageIcon, Mic, Brain, Sparkles, BarChart2, Server, Database, X, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';
import LoginPage from './LoginPage';

const TOKENS = [
  { id: 'BTC', symbol: '₿', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50', name: 'Bitcoin', mult: 10 },
  { id: 'ETH', symbol: 'Ξ', color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400/50', name: 'Ethereum', mult: 5 },
  { id: 'SOL', symbol: '◎', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/50', name: 'Solana', mult: 3 },
  { id: 'DOGE', symbol: 'Ð', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50', name: 'Dogecoin', mult: 2 },
  { id: 'USDT', symbol: '₮', color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/50', name: 'Tether', mult: 0.5 },
  { id: 'XRP', symbol: '✕', color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400/50', name: 'Ripple', mult: 1.5 },
  { id: 'ADA', symbol: '₳', color: 'text-blue-300', bg: 'bg-blue-300/20', border: 'border-blue-300/50', name: 'Cardano', mult: 1.2 },
  { id: 'AVAX', symbol: '🔺', color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/50', name: 'Avalanche', mult: 2.5 },
  { id: 'LINK', symbol: '🔗', color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/50', name: 'Chainlink', mult: 2 },
  { id: 'SCATTER', symbol: '🎰', color: 'text-pink-500', bg: 'bg-pink-500/20', border: 'border-pink-500/50', name: 'Free Spins', mult: 0 },
];

const BET_AMOUNTS = [0.5, 1, 2, 5, 10, 50, 100, 500, 1000];
const SUITS = [
  { id: 'HEART', symbol: '♥', color: 'text-red-500', type: 'RED' },
  { id: 'DIAMOND', symbol: '♦', color: 'text-red-500', type: 'RED' },
  { id: 'SPADE', symbol: '♠', color: 'text-zinc-800', type: 'BLACK' },
  { id: 'CLUB', symbol: '♣', color: 'text-zinc-800', type: 'BLACK' }
];

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

const playSound = (type: 'spin' | 'win' | 'lose' | 'click' | 'gambleWin' | 'gambleLose' | 'freeSpinTrigger') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'spin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'win') {
      osc.type = 'square';
      [400, 500, 600, 800, 1000, 1200].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
      });
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'freeSpinTrigger') {
      osc.type = 'sawtooth';
      [300, 600, 400, 800, 500, 1000, 600, 1200].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
      });
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (type === 'lose') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'gambleWin') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.setValueAtTime(750, now + 0.1);
      osc.frequency.setValueAtTime(1000, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'gambleLose') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export default function App() {
  const [balance, setBalance] = useState(1000);
  const [houseLiquidity, setHouseLiquidity] = useState(10000);
  const [bet, setBet] = useState(1);
  const [grid, setGrid] = useState(generateGrid());
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winLines, setWinLines] = useState<string[]>([]);
  const [winningCells, setWinningCells] = useState<{r: number, c: number}[]>([]);
  const [losingCells, setLosingCells] = useState<{r: number, c: number}[]>([]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [gambleMode, setGambleMode] = useState(false);
  const [gambleCard, setGambleCard] = useState<typeof SUITS[0] | null>(null);
  const [logs, setLogs] = useState<string[]>(['System initialized.']);
  const [activeTab, setActiveTab] = useState<'chart' | 'logs' | 'ai'>('chart');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MED' | 'HIGH' | 'DEGEN'>('MED');
  const [volatility, setVolatility] = useState(12.5);
  const [showStrategiesModal, setShowStrategiesModal] = useState(false);
  const [strategies, setStrategies] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Live Data
  const [prices, setPrices] = useState<Record<string, number>>({ BTC: 0, ETH: 0, SOL: 0, XRP: 0, ADA: 0, AVAX: 0, LINK: 0, DOGE: 0 });

  // Tracker & Workflow State
  const [chartData, setChartData] = useState<{ trade: number, balance: number }[]>([{ trade: 0, balance: 1000 }]);
  const [tradeCount, setTradeCount] = useState(0);
  const [activeTrade, setActiveTrade] = useState<{ name: string, steps: string[], currentStep: number, isWin: boolean } | null>(null);

  const addLog = (msg: string) => setLogs(p => [...p.slice(-19), msg]);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await fetch('/api/strategies');
        const data = await res.json();
        setStrategies(data);
      } catch (e) {
        addLog('Failed to fetch strategies.');
        console.error('Failed to fetch strategies', e);
      }
    };
    fetchStrategies();
  }, []);

  useEffect(() => {
    if (freeSpins > 0 && !spinning) {
      if (winAmount > 0) {
        const t = setTimeout(() => collectWinnings(), 1500);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => handleSpin(), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [freeSpins, spinning, winAmount]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = '["BTCUSDT","ETHUSDT","SOLUSDT","XRPUSDT","ADAUSDT","AVAXUSDT","LINKUSDT","DOGEUSDT"]';
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbols}`);
        const data: { symbol: string, price: string }[] = await res.json();
        const newPrices: Record<string, number> = {};
        data.forEach((item) => {
          const symbol = item.symbol.replace('USDT', '');
          newPrices[symbol] = parseFloat(item.price);
        });
        setPrices(prev => ({ ...prev, ...newPrices }));
      } catch (e) { console.error('Price fetch error', e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    const volInterval = setInterval(() => setVolatility(v => +(v + (Math.random() * 2 - 1)).toFixed(1)), 3000);
    return () => {
      clearInterval(interval);
      clearInterval(volInterval);
    };
  }, []);

  const handleLogin = async (address: string) => {
    addLog('Attempting to authenticate with backend...');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!res.ok) {
        addLog(`API auth failed with status: ${res.status}`);
        const errorText = await res.text();
        addLog(`Error: ${errorText}`);
        return;
      }

      const data = await res.json();
      addLog('Backend authentication successful. Updating state.');
      
      // Update state atomically
      setBalance(data.user.balance);
      setWinAmount(data.user.win_amount);
      setFreeSpins(data.user.free_spins);
      setHouseLiquidity(data.houseTvl);
      setWalletAddress(address);
      setIsLoggedIn(true);
      localStorage.setItem('walletAddress', address);

    } catch (e: any) {
      console.error("Login process failed", e);
      addLog("Login process failed.");
      if (e.message) {
        addLog(`Error details: ${e.message}`);
      }
    }
  };
  
  // Auto-login on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      addLog('Found stored address. Attempting to auto-login...');
      handleLogin(storedAddress);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    setIsLoggedIn(false);
    setWalletAddress('');
    addLog('Wallet disconnected.');
  };

  const handleDeposit = async () => {
    if (!isLoggedIn) return addLog('Connect wallet first.');
    const amount = prompt("Enter amount to deposit (simulated):", "100");
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, amount: Number(amount) })
      });
      const data = await res.json();
      setBalance(data.balance);
      setHouseLiquidity(data.houseTvl);
      addLog(`Deposited $${amount} successfully.`);
    } catch (e) {
      addLog('Deposit failed.');
    }
  };

  const handleWithdraw = async () => {
    if (!isLoggedIn) return addLog('Connect wallet first.');
    if (balance <= 0) return addLog('No balance to withdraw.');
    const amount = prompt(`Enter amount to withdraw (Max: $${balance}):`, balance.toString());
    if (!amount || isNaN(Number(amount)) || Number(amount) > balance) return;

    setIsWithdrawing(true);
    addLog(`Initiating withdrawal of $${amount}...`);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, amount: Number(amount) })
      });
      const data = await res.json();
      if (data.error) {
        addLog(`Withdraw Error: ${data.error}`);
      } else {
        setBalance(data.balance);
        setHouseLiquidity(data.houseTvl);
        addLog(data.message);
      }
    } catch (e) {
      addLog('Withdraw failed.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const sessionRef = useRef<any>(null);

  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize random trade data for visualization to prevent jumping on re-renders
  const hftVisualData = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      isBuy: Math.random() > 0.5,
      token: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'AVAX', 'LINK', 'DOGE'][Math.floor(Math.random() * 8)],
      price: (Math.random() * 60000).toFixed(Math.random() > 0.5 ? 2 : 6),
      size: (Math.random() * 10).toFixed(2),
      speed: 0.3 + Math.random() * 0.8,
      delay: Math.random() * 1,
      left: `${Math.random() * 100}%`
    }));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setEditingImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateVeoVideo = async () => {
    setAiResponse("Video generation is currently disabled.");
  };

  const editImageWithGemini = async () => {
    if (!editingImage || !editPrompt) return alert("Upload photo & enter prompt!");
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: editingImage.split(',')[1], mimeType: 'image/png' } },
              { text: editPrompt },
            ],
          },
        })
      });
      const data = await res.json();
      for (const part of data.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setEditingImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) {
      setAiResponse("Image editing failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSpin = async () => {
    if (!isLoggedIn) return addLog('ERROR: Connect Web3 wallet first.');
    if (spinning || winAmount > 0) return;
    if (balance < bet && freeSpins === 0) return addLog('ERROR: Insufficient funds.');
    if (!strategies) return addLog('ERROR: Strategies not loaded yet.');

    playSound('click');
    setSpinning(true);
    setWinAmount(0);
    setWinLines([]);
    setWinningCells([]);
    setLosingCells([]);
    setGambleMode(false);
    
    if (freeSpins > 0) {
        addLog(`[FREE SPIN] ${freeSpins} remaining...`);
    }
    
    addLog(`[API] Routing trade to Backend...`);
    try {
      const res = await fetch('/api/spin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, betAmount: bet, riskLevel })
      });
      const data = await res.json();
      if (data.error) {
        addLog(`ERROR: ${data.error}`);
        setSpinning(false);
        return;
      }

      const { finalGrid, isWin, strategy, scatters, user, houseTvl } = data;
      
      setActiveTrade({ name: strategy.name, steps: strategy.steps, currentStep: 0, isWin });
      addLog(`[API] Initiating ${strategy.name} at $${bet} (${riskLevel} Risk)...`);

      // Animate Grid & Log Steps
      for (let i = 0; i < 10; i++) {
        playSound('spin');
        setGrid(generateGrid());
        if (i === 2) {
          setActiveTrade(prev => prev ? { ...prev, currentStep: 1 } : null);
          addLog(`[STEP 1] ${strategy.steps[0]} - Analyzing mempool & orderbooks...`);
        }
        if (i === 5) {
          setActiveTrade(prev => prev ? { ...prev, currentStep: 2 } : null);
          const asset = TOKENS[Math.floor(Math.random() * (TOKENS.length - 1))]; // Exclude scatter
          const price = prices[asset.id as keyof typeof prices] || (Math.random() * 1000).toFixed(2);
          addLog(`[STEP 2] ${strategy.steps[1]} - Target asset: ${asset.name} @ $${price}`);
        }
        if (i === 8) {
          setActiveTrade(prev => prev ? { ...prev, currentStep: 3 } : null);
          addLog(`[STEP 3] ${strategy.steps[2]} - Executing payload...`);
        }
        await new Promise(r => setTimeout(r, 150));
      }

      setGrid(finalGrid);
      setSpinning(false);

      // Sync state with backend response
      setBalance(user.balance);
      setFreeSpins(user.free_spins);
      setWinAmount(user.win_amount);
      setHouseLiquidity(houseTvl);

      if (scatters >= 3) {
        playSound('freeSpinTrigger');
        addLog(`🎰 ${user.free_spins - freeSpins + 5} FREE SPINS TRIGGERED! 🎰`); // Calculate how many were added
      }

      // Process Result
      if (isWin) {
        playSound('win');
        setWinLines([`${strategy.name} Successful`]);
        setWinningCells([{r:1, c:0}, {r:1, c:1}, {r:1, c:2}, {r:1, c:3}, {r:1, c:4}]);
        addLog(`[STEP 4] ${strategy.steps[3]} - SUCCESS!`);
        addLog(`[TX] ${strategy.name} closed in PROFIT! +$${user.win_amount.toFixed(2)}`);
        setChartData(prev => [...prev, { trade: tradeCount + 1, balance: user.balance + user.win_amount }]);
      } else {
        playSound('lose');
        setLosingCells([{r:1, c:0}, {r:1, c:1}, {r:1, c:2}, {r:1, c:3}, {r:1, c:4}]);
        addLog(`[STEP 4] ${strategy.steps[3]} - FAILED (Slippage/Outbid)`);
        addLog(`[TX] ${strategy.name} failed. Loss: -$${bet.toFixed(2)}`);
        setChartData(prev => [...prev, { trade: tradeCount + 1, balance: user.balance }]);
        setTimeout(() => setActiveTrade(null), 2000);
      }
      setTradeCount(c => c + 1);
    } catch (e) {
      addLog(`ERROR: Backend connection failed.`);
      setSpinning(false);
    }
  };

  const handleGamble = async (type: 'RED' | 'BLACK' | 'SUIT', suitId?: string) => {
    if (winAmount <= 0) return;
    playSound('click');
    const originalWinAmount = winAmount; // Store original win amount before gamble
    
    try {
      const res = await fetch('/api/gamble', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, type, suitId })
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);

      const { won, drawnCard, newWinAmount, houseTvl } = data;
      setGambleCard(drawnCard);
      await new Promise(r => setTimeout(r, 1000));

      setHouseLiquidity(houseTvl);

      if (won) {
        playSound('gambleWin');
        setWinAmount(newWinAmount);
        addLog(`Gamble WON! New profit: $${newWinAmount.toFixed(2)}`);
        setGambleCard(null);
      } else {
        playSound('gambleLose');
        setWinAmount(0);
        setGambleMode(false);
        addLog('Gamble LOST. Position liquidated.');
        setGambleCard(null);
        setActiveTrade(null);
        setChartData(prev => {
          const newData = [...prev];
          const lastEntry = newData[newData.length - 1];
          // The loss was already accounted for in the balance from the spin, 
          // but the profit from the win needs to be removed from the chart.
          if (lastEntry) {
            newData[newData.length - 1] = { ...lastEntry, balance: lastEntry.balance - originalWinAmount };
          }
          return newData;
        });
      }
    } catch (e) {
      addLog(`ERROR: Gamble request failed.`);
    }
  };

  const collectWinnings = async () => {
    playSound('click');
    try {
      const res = await fetch('/api/collect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);

      setBalance(data.balance);
      setWinAmount(0);
      setGambleMode(false);
      setActiveTrade(null);
      setWinLines([]);
      setWinningCells([]);
      addLog('Profits secured to wallet.');
    } catch (e) {
      addLog(`ERROR: Collect request failed.`);
    }
  };

  // AI Features
  const runMarketAnalysis = async () => {
    setAiLoading(true); setAiResponse(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3.1-pro-preview",
          contents: "Analyze the current high-frequency trading landscape for crypto. Provide a complex reasoning about arbitrage opportunities on decentralized exchanges vs centralized ones.",
        })
      });
      const data = await res.json();
      setAiResponse(data.text);
    } catch (e) { setAiResponse("Analysis failed."); } finally { setAiLoading(false); }
  };

  const getMarketNews = async () => {
    setAiLoading(true); setAiResponse(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: "What are the top 3 crypto news stories in the last 24 hours? Focus on market-moving events.",
          config: { tools: [{ googleSearch: {} }] }
        })
      });
      const data = await res.json();
      setAiResponse(data.text);
    } catch (e) { setAiResponse("News fetch failed."); } finally { setAiLoading(false); }
  };

  const generateLuckyToken = async () => {
    setAiLoading(true); setGeneratedImage(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: 'A futuristic, glowing 3D crypto token with a frog face, cyberpunk style, neon green and purple lighting, 8k resolution' }] },
          config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
        })
      });
      const data = await res.json();
      for (const part of data.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) { setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`); break; }
      }
    } catch (e) { setAiResponse("Image generation failed."); } finally { setAiLoading(false); }
  };

  const toggleLiveAssistant = async () => {
    setAiResponse("Live assistant is currently disabled.");
  };
  
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} addLog={addLog} />;
  }

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 font-sans flex flex-col overflow-hidden text-sm">


      {/* Global Win/Lose Popups */}

      <AnimatePresence>

        {/* Removed global popups to keep reels unobstructed */}

      </AnimatePresence>


      {/* Live Price Ticker */}

      <div className="bg-[#050505] border-b border-zinc-800 py-1 px-2 flex justify-center shrink-0 overflow-hidden">


        <div className="flex gap-4 text-[9px] sm:text-[10px] font-mono text-zinc-500 whitespace-nowrap animate-[marquee_20s_linear_infinite]">


          <span className="flex items-center gap-1">


            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE


          </span>


          {Object.entries(prices).map(([symbol, price]) => (

            <span key={symbol}>{symbol} <span className="text-emerald-400">${(price as number) > 0 ? (price as number).toLocaleString(undefined, { minimumFractionDigits: (price as number) < 1 ? 4 : 2, maximumFractionDigits: (price as number) < 1 ? 4 : 2 }) : '---'}</span></span>


          ))}

        </div>

      </div>


      {/* Header */}

      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-40 shrink-0 h-12">


        <div className="max-w-7xl mx-auto px-2 h-full flex items-center justify-between">


          <div className="flex items-center gap-2">


            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]">


              <Activity className="w-3 h-3 text-emerald-400" />


            </div>


            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">


              CryptoSpin.ai


            </h1>


            <div className="hidden sm:flex items-center gap-1 ml-2 px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-mono text-zinc-400">


              <Database className="w-3 h-3 text-blue-400" /> Local API Connected


            </div>


          </div>


          <div className="flex items-center gap-4">


            <div className="hidden sm:flex flex-col items-end">


              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">House TVL</span>


              <span className="text-xs font-mono font-bold text-purple-400">${houseLiquidity.toFixed(2)}</span>


            </div>


            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-full shadow-inner">


              <Wallet className="w-3 h-3 text-zinc-500" />


              <span className="font-mono font-medium text-emerald-400 text-xs">${balance.toFixed(2)}</span>


            </div>


            {isLoggedIn ? (

              <div className="flex items-center gap-2">


                <button onClick={handleDeposit} disabled={isWithdrawing} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 text-[10px] font-mono font-medium px-2 py-1 rounded transition-colors disabled:opacity-50">


                  Deposit


                </button>


                <button onClick={handleWithdraw} disabled={isWithdrawing} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 text-[10px] font-mono font-medium px-2 py-1 rounded transition-colors disabled:opacity-50">


                  {isWithdrawing ? '...' : 'Withdraw'}


                </button>


                <button onClick={handleLogout} disabled={isWithdrawing} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-medium px-2 py-1 rounded-full disabled:opacity-50">


                   {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}


                </button>


              </div>


            ) : ( <div /> )}

          </div>


        </div>


      </header>


      {/* Main Game Area */}

      <main className="flex-1 max-w-7xl mx-auto w-full p-1 sm:p-2 flex flex-col lg:flex-row gap-1 sm:gap-2 min-h-0 overflow-hidden">


        

        {/* Left: Execution Engine */}

        <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-2 relative shadow-2xl overflow-hidden min-h-0">


          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />


          

          <div className="flex items-center justify-between mb-2 shrink-0">


            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">


              <Zap className="w-3 h-3 text-emerald-400" /> Engine


            </h2>


            {activeTrade && (

              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${activeTrade.isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>


                {activeTrade.name}


              </span>


            )}

          </div>


          <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">


            {/* High-Frequency Trade Visualization Background */}

            <AnimatePresence>

              {spinning && (

                <motion.div

                  initial={{ opacity: 0 }}

                  animate={{ opacity: 1 }}

                  exit={{ opacity: 0 }}

                  className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center"


                >


                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1)_0%,transparent_70%)] animate-pulse" />


                  {hftVisualData.map((trade) => (

                    <motion.div

                      key={trade.id}

                      initial={{ y: '50vh', opacity: 0, scale: 0.8 }}

                      animate={{ y: '-50vh', opacity: [0, 0.6, 0], scale: 1 }}

                      transition={{ 

                        duration: trade.speed, 

                        repeat: Infinity, 

                        delay: trade.delay,

                        ease: "linear" 

                      }}

                      className={`absolute text-[10px] font-mono whitespace-nowrap ${trade.isBuy ? 'text-emerald-500/40' : 'text-red-500/40'}`}

                      style={{ left: trade.left }}

                    >


                      {trade.isBuy ? 'EXEC BUY' : 'EXEC SELL'} {trade.size} {trade.token} @ {trade.price}


                    </motion.div>


                  ))}

                </motion.div>


              )}

            </AnimatePresence>


            {/* Grid */}

            <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-[320px] sm:max-w-[420px] aspect-[5/3] mb-2 shrink-0 relative z-10">


              {grid.map((row, i) => row.map((token, j) => {

                const isWinningCell = winningCells.some(c => c.r === i && c.c === j);

                const isLosingCell = losingCells.some(c => c.r === i && c.c === j);

                return (

                  <div key={`${i}-${j}`} className={`flex flex-col items-center justify-center rounded-lg border-2 shadow-inner relative overflow-hidden bg-zinc-950 transition-all duration-300


                    ${isWinningCell ? 'border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.5)] bg-emerald-500/10' : 

                      isLosingCell ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-500/10' : 

                      `${token.bg} ${token.border}`}`}>



                    <AnimatePresence mode="wait">


                      <motion.div

                        key={spinning ? `spinning-${i}-${j}` : `static-${token.id}-${i}-${j}`}

                        initial={spinning ? { y: -30, opacity: 0 } : { y: 10, opacity: 0 }}

                        animate={{ y: 0, opacity: 1 }}

                        exit={spinning ? { y: 30, opacity: 0 } : { opacity: 0 }}

                        transition={spinning ? { repeat: Infinity, duration: 0.1, ease: "linear", delay: j * 0.05 } : { type: "spring", stiffness: 300, damping: 15 }}

                        className="flex flex-col items-center justify-center"

                      >


                        <div className={`text-2xl sm:text-3xl ${token.color} drop-shadow-[0_0_10px_currentColor] ${spinning ? 'blur-[1px]' : ''}`}>


                          {token.symbol}


                        </div>


                      </motion.div>


                    </AnimatePresence>


                    <div className="absolute bottom-1 text-[6px] sm:text-[7px] font-bold text-white/50 uppercase tracking-wider hidden sm:block">


                      {token.name}


                    </div>


                  </div>


                );

              }))}

            </div>


            {/* Trade Workflow Visualization */}

            <div className="w-full max-w-[280px] bg-zinc-950 border border-zinc-800 rounded-lg p-2 shrink-0">


              <div className="flex justify-between items-center relative">


                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800 z-0" />


                {activeTrade ? activeTrade.steps.map((step, idx) => {

                  const isActive = activeTrade.currentStep >= idx;

                  const isCurrent = activeTrade.currentStep === idx;

                  const isLast = idx === activeTrade.steps.length - 1;

                  const isFailure = isLast && !activeTrade.isWin && isActive;

                  return (

                    <div key={idx} className="relative z-10 flex flex-col items-center gap-1 w-1/4">


                      <motion.div 

                        animate={isActive ? { scale: [1, 1.2, 1] } : {}}

                        transition={{ duration: 0.3 }}

                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center bg-zinc-950


                          ${isFailure ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 

                            isActive ? 'border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'border-zinc-700'}`}


                      >


                        {isActive && <div className={`w-1 h-1 rounded-full ${isFailure ? 'bg-red-500' : 'bg-emerald-500'}`} />}

                      </motion.div>


                      <span className={`text-[7px] sm:text-[8px] font-mono text-center leading-tight ${isCurrent ? 'text-white font-bold' : isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>


                        {step}


                      </span>


                    </div>


                  );

                }) : (

                  <div className="w-full text-center text-[9px] font-mono text-zinc-600 py-1">


                    Awaiting Trade Execution...


                  </div>


                )}

              </div>


            </div>


          </div>


        </div>


        {/* Right: Controls & Dashboard */}

        <div className="w-full lg:w-72 flex flex-col gap-1 sm:gap-2 shrink-0 min-h-0">


          

          {/* Gamble UI */}

          <AnimatePresence>

            {gambleMode && (

              <motion.div 

                initial={{ opacity: 0, height: 0 }} 

                animate={{ opacity: 1, height: 'auto' }} 

                exit={{ opacity: 0, height: 0 }}

                className="bg-zinc-900 border border-purple-500/50 rounded-xl p-2 shadow-[0_0_20px_rgba(168,85,247,0.15)] shrink-0 overflow-hidden"

              >


                <div className="flex flex-col items-center gap-2">


                  <div className="flex justify-between items-center w-full">


                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Gamble Profit</span>


                    <span className="text-sm font-mono font-bold text-white">${winAmount.toFixed(2)}</span>


                  </div>


                  

                  <div className="w-12 h-16 bg-white rounded flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">


                    {gambleCard ? (

                      <span className={gambleCard.color}>{gambleCard.symbol}</span>


                    ) : (

                      <div className="w-full h-full bg-zinc-800 rounded border border-white flex items-center justify-center">


                        <Zap className="w-4 h-4 text-zinc-600" />


                      </div>


                    )}

                  </div>


                  <div className="w-full flex flex-col gap-1">


                    <div className="flex gap-1">


                      <button onClick={() => handleGamble('RED')} disabled={!!gambleCard || houseLiquidity < winAmount} className="flex-1 py-1 bg-red-500 hover:bg-red-400 text-white font-bold rounded text-[9px] disabled:opacity-50" title={houseLiquidity < winAmount ? "Not enough House TVL" : ""}>RED (2x)</button>


                      <button onClick={() => handleGamble('BLACK')} disabled={!!gambleCard || houseLiquidity < winAmount} className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-[9px] disabled:opacity-50" title={houseLiquidity < winAmount ? "Not enough House TVL" : ""}>BLACK (2x)</button>


                    </div>


                    <div className="flex gap-1">


                      {SUITS.map(s => (

                        <button key={s.id} onClick={() => handleGamble('SUIT', s.id)} disabled={!!gambleCard || houseLiquidity < (winAmount * 3)} className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm rounded flex justify-center disabled:opacity-50" title={houseLiquidity < (winAmount * 3) ? "Not enough House TVL" : ""}>


                          <span className={s.color}>{s.symbol}</span>


                        </button>


                      ))}

                    </div>


                    <button onClick={collectWinnings} disabled={!!gambleCard} className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold rounded text-[9px] transition-colors disabled:opacity-50 mt-1">


                      Take Win & Exit


                    </button>


                  </div>


                </div>


              </motion.div>


            )}

          </AnimatePresence>


          {/* Controls */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-xl shrink-0">


            <div className="mb-1.5">


              <div className="flex justify-between items-center mb-0.5">


                <label className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">


                  Risk Profile


                  <button onClick={() => setShowStrategiesModal(true)} className="text-zinc-500 hover:text-emerald-400 transition-colors" title="View Strategies">


                    <Info className="w-3 h-3" />


                  </button>


                </label>


                <span className="text-[8px] font-mono text-orange-400">VOL: {volatility}%</span>


              </div>


              <div className="grid grid-cols-4 gap-1">


                {['LOW', 'MED', 'HIGH', 'DEGEN'].map(r => (

                  <button 

                    key={r} 

                    onClick={() => setRiskLevel(r as any)} 

                    disabled={spinning || gambleMode}

                    className={`py-1 rounded border font-mono text-[9px] transition-all disabled:opacity-50 ${riskLevel === r ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}


                  >


                    {r}


                  </button>


                ))}

              </div>


            </div>


            <div className="mb-2">


              <label className="block text-[9px] font-medium text-zinc-400 mb-0.5 uppercase tracking-wider">Trade Size</label>


              <div className="grid grid-cols-5 gap-1">


                {BET_AMOUNTS.slice(0, 5).map((amount) => (

                  <motion.button

                    key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

                    onClick={() => setBet(amount)} disabled={spinning || gambleMode}

                    className={`py-1 rounded border font-mono text-[9px] transition-all ${bet === amount ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-50'}`}


                  >


                    ${amount < 1 ? amount.toFixed(2) : amount}


                  </motion.button>


                ))}

              </div>


              <div className="grid grid-cols-4 gap-1 mt-1">


                {BET_AMOUNTS.slice(5).map((amount) => (

                  <motion.button

                    key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

                    onClick={() => setBet(amount)} disabled={spinning || gambleMode}

                    className={`py-1 rounded border font-mono text-[9px] transition-all ${bet === amount ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-50'}`}


                  >


                    ${amount}


                  </motion.button>


                ))}

              </div>


            </div>


            <div className="flex items-center gap-2 relative">


              <motion.div

                animate={spinning ? { y: [0, -10, 0], rotate: [0, 10, -10, 0] } : { y: [0, -3, 0] }}

                transition={spinning ? { repeat: Infinity, duration: 0.4 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }}

                className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"


              >


                🐸


              </motion.div>


              

              {winAmount > 0 && !gambleMode ? (

                <>

                  <motion.button

                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}

                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52,211,153,0.4)" }} whileTap={{ scale: 0.98 }}

                    onClick={collectWinnings}

                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group"


                  >


                    TAKE WIN (${winAmount.toFixed(2)})


                  </motion.button>


                  <AnimatePresence>

                    <motion.button

                      initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }}

                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168,85,247,0.6)" }} whileTap={{ scale: 0.95 }}

                      onClick={() => { playSound('click'); setGambleMode(true); }}

                      disabled={houseLiquidity < winAmount}

                      className={`absolute -top-10 right-0 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/50 flex items-center justify-center gap-1 z-10 ${houseLiquidity < winAmount ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}


                      title={houseLiquidity < winAmount ? "Not enough House TVL to gamble" : ""}


                    >


                      <Zap className="w-3 h-3 fill-current" /> GAMBLE


                    </motion.button>


                  </AnimatePresence>

                </>

              ) : (

                <motion.button

                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52,211,153,0.4)" }} whileTap={{ scale: 0.98 }}

                  onClick={handleSpin} disabled={spinning || (balance < bet && freeSpins === 0) || gambleMode || !isLoggedIn}

                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-1.5 relative overflow-hidden group"


                >


                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />


                  {spinning ? <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> : <><Play className="w-4 h-4 fill-current" />{freeSpins > 0 ? `FREE SPIN (${freeSpins})` : 'EXECUTE'}</>}


                </motion.button>


              )}

            </div>


          </div>


          {/* Dashboard Tabs */}

          <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl min-h-0">


            <div className="bg-zinc-900/80 border-b border-zinc-800 px-1 py-1 flex items-center gap-1 shrink-0">


              <button 

                onClick={() => setActiveTab('chart')}

                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${activeTab === 'chart' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}


              >


                <BarChart2 className="w-3 h-3" /> CHART


              </button>


              <button 

                onClick={() => setActiveTab('logs')}

                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeTab === 'logs' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}


              >


                LOGS


              </button>


              <button 

                onClick={() => setActiveTab('ai')}

                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${activeTab === 'ai' ? 'bg-zinc-800 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}


              >


                <Sparkles className="w-3 h-3" /> DEGEN AI


              </button>


            </div>


            <div className="p-2 flex-1 overflow-y-auto min-h-0">


              {activeTab === 'chart' ? (

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

                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}

                          labelFormatter={(label) => `Trade ${label}`}

                        />


                        <ReferenceLine y={1000} stroke="#3f3f46" strokeDasharray="3 3" />


                        <Line type="monotone" dataKey="balance" stroke={balance >= 1000 ? '#34d399' : '#ef4444'} strokeWidth={2} dot={false} isAnimationActive={true} />


                      </LineChart>


                    </ResponsiveContainer>


                  </div>


                </div>


              ) : activeTab === 'logs' ? (

                <div className="space-y-1 flex flex-col justify-end h-full font-mono text-[9px] sm:text-[10px]">


                  {logs.map((log, i) => (

                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className={`flex gap-1 ${log.includes('PROFIT') || log.includes('WON') ? 'text-emerald-400' : log.includes('Loss') || log.includes('LOST') || log.includes('failed') ? 'text-red-400' : log.includes('API') ? 'text-blue-400' : 'text-zinc-500'}`}>


                      <span className="shrink-0">{">"}</span>


                      <span className="break-all">{log}</span>


                    </motion.div>


                  ))}

                </div>


              ) : (

                <div className="space-y-2 h-full flex flex-col">


                  <div className="grid grid-cols-3 gap-1 shrink-0">


                    <button onClick={runMarketAnalysis} disabled={aiLoading} className="p-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-bold flex flex-col items-center gap-0.5 hover:border-purple-500/50 transition-colors disabled:opacity-50">


                      <Brain className="w-3 h-3 text-purple-400" /> ANALYZE


                    </button>


                    <button onClick={getMarketNews} disabled={aiLoading} className="p-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-bold flex flex-col items-center gap-0.5 hover:border-emerald-500/50 transition-colors disabled:opacity-50">


                      <Search className="w-3 h-3 text-emerald-400" /> NEWS


                    </button>


                    <button onClick={generateLuckyToken} disabled={aiLoading} className="p-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-bold flex flex-col items-center gap-0.5 hover:border-cyan-500/50 transition-colors disabled:opacity-50">


                      <ImageIcon className="w-3 h-3 text-cyan-400" /> TOKEN


                    </button>


                    <button onClick={toggleLiveAssistant} className={`p-1 border rounded text-[8px] font-bold flex flex-col items-center gap-0.5 transition-colors ${isLive ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-red-500/50'}`}>


                      <Mic className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`} /> {isLive ? 'STOP' : 'VOICE'}


                    </button>


                    <button onClick={() => fileInputRef.current?.click()} className="p-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-bold flex flex-col items-center gap-0.5 hover:border-orange-500/50 transition-colors">


                      <ImageIcon className="w-3 h-3 text-orange-400" /> UPLOAD


                    </button>


                    <button onClick={generateVeoVideo} disabled={aiLoading || !editingImage} className="p-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-bold flex flex-col items-center gap-0.5 hover:border-pink-500/50 transition-colors disabled:opacity-50">


                      <Sparkles className="w-3 h-3 text-pink-400" /> VEO


                    </button>


                  </div>


                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />


                  {editingImage && (

                    <div className="flex gap-1 shrink-0">


                      <input 

                        type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} 

                        placeholder="Edit prompt..." 

                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] focus:outline-none focus:border-purple-500"


                      />


                      <button onClick={editImageWithGemini} disabled={aiLoading} className="bg-purple-500 hover:bg-purple-400 text-white px-2 py-0.5 rounded text-[9px] font-bold disabled:opacity-50">


                        EDIT


                      </button>


                    </div>


                  )}


                  <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 p-1.5 overflow-y-auto text-[9px] leading-relaxed relative min-h-0">


                    {aiLoading && (

                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">


                        <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />


                      </div>


                    )}

                    {generatedVideo ? (

                      <video src={generatedVideo} controls autoPlay loop className="w-full rounded border border-zinc-800" />


                    ) : editingImage ? (

                      <div className="space-y-1">


                        <img src={editingImage} alt="Uploaded" className="w-full rounded border border-zinc-800" />


                        <p className="text-center text-zinc-500 italic">Ready for Editing/Veo</p>


                      </div>


                    ) : generatedImage ? (

                      <div className="space-y-1">


                        <img src={generatedImage} alt="Generated Token" className="w-full rounded border border-zinc-800" />


                        <p className="text-center text-zinc-500 italic">AI Lucky Token</p>


                      </div>


                    ) : aiResponse ? (

                      <div className="whitespace-pre-wrap text-zinc-300 font-mono">{aiResponse}</div>


                    ) : isLive ? (

                      <div className="whitespace-pre-wrap text-emerald-400 font-mono italic">{transcription}</div>


                    ) : (

                      <div className="h-full flex items-center justify-center text-zinc-600 text-center italic">


                        Select an AI tool.


                      </div>


                    )}

                  </div>


                </div>


              )}

            </div>


          </div>


        </div>


      </main>


    </div>


  );

}
