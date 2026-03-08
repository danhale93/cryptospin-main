import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Play, Zap, Activity, Bot, RotateCw, Square, Info, BarChart2, PlusCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';
import LoginPage from './LoginPage';
import PayIDModal from './PayIDModal';

// --- NEW COMPONENT: TradeStreamColumn ---
const TradeStreamColumn = ({ delay, isFast } : { delay: number, isFast: boolean }) => {
  const tradeData = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      price: (Math.random() * 40000 + 20000).toFixed(2),
      size: (Math.random() * 2).toFixed(3),
      side: Math.random() > 0.5,
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_15%,#000_85%,transparent_100%)]">
        <motion.div
            animate={{ y: ['-50%', '0%'] }}
            transition={{
                duration: isFast ? 0.2 : 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: 'linear'
            }}
        >
            {[...tradeData, ...tradeData].map((d, i) => ( 
                <div key={i} className={`flex justify-between font-mono text-xs ${d.side ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                    <span>{d.price}</span>
                    <span>{d.size}</span>
                </div>
            ))}
        </motion.div>
    </div>
  );
};


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

const ReelResultAnimation = ({ result, onComplete, betAmount, winAmount } : { result: 'win' | 'loss', onComplete: () => void, betAmount: number, winAmount: number }) => {
  const winText = `+$${winAmount.toFixed(2)}`;
  const lossText = `-$${betAmount.toFixed(2)}`;

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000); // Shorter animation duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ x: "-220px", y: 0, rotate: 0, scale: 1.5 }}
        animate={{ x: result === 'win' ? "220px" : "0px", y: result === 'win' ? [0, -100, 0] : [0, -60, 200], rotate: result === 'win' ? [0, 20, 0] : 360, opacity: result === 'loss' ? 0 : 1,}}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        className="text-5xl z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      >🐸</motion.div>

      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ delay: 1.5, duration: 0.5, type: 'spring' }}
            className={`absolute font-black text-6xl uppercase ${result === 'win' ? 'text-emerald-400/90' : 'text-red-500/90'}`}>
            {result === 'win' ? "PROFIT" : "RUGGED"}
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.5, type: 'spring' }}
            className={`absolute mt-24 font-mono font-bold text-4xl ${result === 'win' ? 'text-white' : 'text-zinc-300'}`}>
            {result === 'win' ? winText : lossText}
        </motion.div>
      </AnimatePresence>

      {result === 'win' && (
        <motion.div 
          className="absolute w-full h-1/3 top-1/3 left-0 bg-emerald-500/30 filter blur-[30px]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'circOut' }}
        />
      )}
    </div>
  );
}

const FreeSpinsBonus = ({ spins, onStart } : { spins: number, onStart: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center font-mono"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-lg bg-zinc-900 border-2 border-pink-500/80 rounded-2xl p-8 relative flex flex-col items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.4)] overflow-hidden"
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.2)_0%,transparent_60%)]"
          animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-xl text-zinc-400 tracking-widest">BONUS TRIGGERED</h2>
        <h1 className="text-8xl font-black text-white my-2 bg-gradient-to-br from-pink-400 to-purple-500 bg-clip-text text-transparent">{spins}</h1>
        <h2 className="text-3xl font-bold text-zinc-200">FREE SPINS</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="mt-8 text-xl font-bold px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white shadow-lg"
        >LET'S GO!</motion.button>
      </motion.div>
    </motion.div>
  )
}

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const playSound = (type: 'spin' | 'win' | 'lose' | 'click' | 'gambleWin' | 'gambleLose' | 'freeSpinTrigger') => {
  try {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    const now = audioContext.currentTime;
    if (type === 'click') { osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } else if (type === 'spin') { osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(400, now + 0.1); gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.1); osc.start(now); osc.stop(now + 0.1); } else if (type === 'win') { osc.type = 'square'; [400, 500, 600, 800, 1000, 1200].forEach((freq, i) => { osc.frequency.setValueAtTime(freq, now + i * 0.1); }); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.6); osc.start(now); osc.stop(now + 0.6); } else if (type === 'freeSpinTrigger') { osc.type = 'sawtooth'; [300, 600, 400, 800, 500, 1000, 600, 1200].forEach((freq, i) => { osc.frequency.setValueAtTime(freq, now + i * 0.1); }); gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.8); osc.start(now); osc.stop(now + 0.8); } else if (type === 'lose') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3); } else if (type === 'gambleWin') { osc.type = 'square'; osc.frequency.setValueAtTime(500, now); osc.frequency.setValueAtTime(750, now + 0.1); osc.frequency.setValueAtTime(1000, now + 0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4); } else if (type === 'gambleLose') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.4); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4); }
  } catch (e) { console.error("Audio play failed", e); }
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
  const [logs, setLogs] = useState<string[]>(["Welcome! Set your bet and risk, then hit Execute."]);
  const [activeTab, setActiveTab] = useState<'chart' | 'logs'>('chart');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MED' | 'HIGH' | 'DEGEN'>('MED');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>({ BTC: 0, ETH: 0, SOL: 0, XRP: 0, ADA: 0, AVAX: 0, LINK: 0, DOGE: 0 });
  const [chartData, setChartData] = useState<{ trade: number, balance: number }[]>([{ trade: 0, balance: 1000 }]);
  const [tradeCount, setTradeCount] = useState(0);
  const [activeTrade, setActiveTrade] = useState<{ name: string, steps: string[], currentStep: number, isWin: boolean } | null>(null);
  const [tradeResultForAnimation, setTradeResultForAnimation] = useState<"win" | "loss" | null>(null);
  const [showFreeSpinsBonus, setShowFreeSpinsBonus] = useState(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  const [autoSpins, setAutoSpins] = useState(0);
  const isStoppingRef = useRef(false);
  const spinStartTime = useRef(0);
  const [showPayIDModal, setShowPayIDModal] = useState(false);

  const addLog = (msg: string) => setLogs(p => [...p.slice(-19), msg]);

  useEffect(() => {
    if ((freeSpins > 0 || autoSpins > 0) && !spinning && !tradeResultForAnimation && winAmount === 0 && !gambleMode && !showFreeSpinsBonus) {
        const timer = setTimeout(() => {
            handleSpin();
            if (autoSpins > 0) setAutoSpins(prev => prev - 1);
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [freeSpins, autoSpins, spinning, winAmount, tradeResultForAnimation, gambleMode, showFreeSpinsBonus]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = '["BTCUSDT","ETHUSDT","SOLUSDT","XRPUSDT","ADAUSDT","AVAXUSDT","LINKUSDT","DOGEUSDT"]';
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbols}`);
        const data: { symbol: string, price: string }[] = await res.json();
        const newPrices: Record<string, number> = {};
        data.forEach((item) => { newPrices[item.symbol.replace('USDT', '')] = parseFloat(item.price); });
        setPrices(prev => ({ ...prev, ...newPrices }));
      } catch (e) { console.error('Price fetch error', e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (address: string) => {
    addLog('Authenticating with backend...');
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address }) });
      if (!res.ok) { throw new Error(`API auth failed: ${res.statusText}`); }
      const data = await res.json();
      addLog('Authentication successful.');
      setBalance(data.user.balance); setWinAmount(data.user.win_amount); setFreeSpins(data.user.free_spins); setHouseLiquidity(data.houseTvl); setWalletAddress(address); setIsLoggedIn(true); localStorage.setItem('walletAddress', address);
    } catch (e: any) { console.error("Login failed", e); addLog(`Login failed: ${e.message}`); handleLogout(); }
  };
  
   useEffect(() => {
     const storedAddress = localStorage.getItem('walletAddress');
     if (storedAddress) { addLog('Found stored address, auto-logging in...'); handleLogin(storedAddress); }
   }, []);

  const handleLogout = () => { localStorage.removeItem('walletAddress'); setIsLoggedIn(false); setWalletAddress(''); addLog('Wallet disconnected.'); };

  const handleAnimationComplete = () => {
    const result = tradeResultForAnimation;
    if (result === 'win') {
        playSound('win');
        setWinningCells(Array.from({length: 5}, (_, i) => ({r:1, c:i})));
        addLog(`[TX] ${activeTrade?.name || 'Trade'} closed in PROFIT! +$${winAmount.toFixed(2)}`);
        setTradeResultForAnimation(null);
        if (pendingFreeSpins > 0) setShowFreeSpinsBonus(true);
    } else if (result === 'loss') {
        playSound('lose');
        setLosingCells(Array.from({length: 5}, (_, i) => ({r:1, c:i})));
        addLog(`[TX] ${activeTrade?.name || 'Trade'} RUGGED! Loss: -$${bet.toFixed(2)}`);
        setTimeout(() => {
            setActiveTrade(null);
            setLosingCells([]);
            setGrid(generateGrid()); 
            setTradeResultForAnimation(null);
            if (pendingFreeSpins > 0) setShowFreeSpinsBonus(true);
        }, 1500); 
    }
  };

  const handleStop = () => {
    if(spinning) {
      const elapsed = Date.now() - spinStartTime.current;
      if (elapsed > 500) { // minimum spin time
        isStoppingRef.current = true;
      }
    }
  }

  const handleSpin = async () => {
    if (spinning || winAmount > 0 || tradeResultForAnimation) return;
    if (balance < bet && freeSpins === 0) { addLog('ERROR: Insufficient funds.'); setAutoSpins(0); return; }
    if (!isLoggedIn) return addLog('ERROR: Connect wallet first.');

    playSound('click');
    isStoppingRef.current = false;
    spinStartTime.current = Date.now();
    setSpinning(true);
    setWinLines([]); setWinningCells([]); setLosingCells([]); setGambleMode(false); setActiveTrade(null);
    if (winAmount > 0) await collectWinnings();
    
    const currentBet = freeSpins > 0 ? 0 : bet;
    if (freeSpins > 0) addLog(`[FREE SPIN] ${freeSpins > 1 ? `${freeSpins} remaining...` : 'Last one!'}` );
    else if (autoSpins > 0) addLog(`[AUTOSPIN] ${autoSpins} remaining...`);
    
    addLog(`[API] Routing trade to Backend...`);
    try {
      const res = await fetch('/api/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, betAmount: currentBet, riskLevel }) });
      const data = await res.json();
      if (data.error) { addLog(`ERROR: ${data.error}`); setSpinning(false); return; }

      const { finalGrid, isWin, strategy, scatters, user, houseTvl } = data;
      const currentTrade = { name: strategy.name, steps: strategy.steps, currentStep: 0, isWin };
      setActiveTrade(currentTrade);
      addLog(`[API] Initiating ${strategy.name} at $${currentBet} (${riskLevel} Risk)...`);

      const spinDuration = 2000 + Math.random() * 1000;
      const spinInterval = setInterval(() => {
          if(isStoppingRef.current || (Date.now() - spinStartTime.current > spinDuration)) {
              clearInterval(spinInterval);
              isStoppingRef.current = false;

              addLog(`[API] Trade Finalized.`);
              setActiveTrade(prev => prev ? { ...prev, currentStep: 4 } : null);
              setGrid(finalGrid);
              setSpinning(false);
              setBalance(user.balance);
              setFreeSpins(user.free_spins);
              setWinAmount(user.win_amount);
              setHouseLiquidity(houseTvl);

              if (scatters >= 3) {
                playSound('freeSpinTrigger');
                const spinsWon = user.free_spins - freeSpins + 5;
                addLog(`🎰 ${spinsWon} FREE SPINS TRIGGERED! 🎰`);
                setPendingFreeSpins(spinsWon);
              }

              if (isWin) setChartData(prev => [...prev, { trade: tradeCount + 1, balance: user.balance + user.win_amount }]);
              else setChartData(prev => [...prev, { trade: tradeCount + 1, balance: user.balance }]);
              setTradeCount(c => c + 1);
              setTradeResultForAnimation(isWin ? 'win' : 'loss');
          }
      }, 100);

    } catch (e) { addLog(`ERROR: Backend connection failed.`); setSpinning(false); }
  };

  const handleGamble = async (type: 'RED' | 'BLACK' | 'SUIT', suitId?: string) => {
    if (winAmount <= 0) return;
    const originalWinAmount = winAmount;
    try {
      const res = await fetch('/api/gamble', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress, type, suitId }) });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      const { won, drawnCard, newWinAmount, houseTvl } = data;
      setGambleCard(drawnCard);
      await new Promise(r => setTimeout(r, 1000));
      setHouseLiquidity(houseTvl);
      if (won) { playSound('gambleWin'); setWinAmount(newWinAmount); addLog(`Gamble WON! New profit: $${newWinAmount.toFixed(2)}`); setGambleCard(null); }
      else { playSound('gambleLose'); setWinAmount(0); setGambleMode(false); addLog('Gamble LOST. Position liquidated.'); setGambleCard(null); setActiveTrade(null); setGrid(generateGrid()); setLosingCells([]); setChartData(p => { const n = [...p]; if(n.length>0) n[n.length-1].balance -= originalWinAmount; return n; }); }
    } catch (e) { addLog(`ERROR: Gamble request failed.`); }
  };

  const collectWinnings = async () => {
    if (tradeResultForAnimation) return;
    try {
      const res = await fetch('/api/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: walletAddress }) });
      const data = await res.json();
      if (data.error) return addLog(`ERROR: ${data.error}`);
      setBalance(data.balance); setWinAmount(0); setGambleMode(false); setActiveTrade(null); setWinLines([]); setWinningCells([]); setGrid(generateGrid()); addLog('Profits secured to wallet.');
    } catch (e) { addLog(`ERROR: Collect request failed.`); }
  };
  
  const handleDeposit = async (amount: number) => {
    try {
        const res = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: walletAddress, amount }),
        });
        const data = await res.json();
        if (data.error) {
            addLog(`ERROR: ${data.error}`);
        } else {
            setBalance(data.balance);
            addLog(`[API] Deposit of $${amount} successful. New balance: $${data.balance.toFixed(2)}`);
        }
    } catch (e) {
        addLog('ERROR: Deposit request failed.');
    }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} addLog={addLog} />;

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 font-sans flex flex-col overflow-hidden text-sm">

      <AnimatePresence>{showPayIDModal && <PayIDModal onClose={() => setShowPayIDModal(false)} onDeposit={handleDeposit} addLog={addLog} />}</AnimatePresence>
      <AnimatePresence>{showFreeSpinsBonus && <FreeSpinsBonus spins={pendingFreeSpins} onStart={() => { setShowFreeSpinsBonus(false); setPendingFreeSpins(0); }} />}</AnimatePresence>

      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-30 shrink-0 h-12 flex items-center">
        <div className="max-w-7xl mx-auto px-2 w-full flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]"><Activity className="w-3 h-3 text-emerald-400" /></div><h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">CryptoSpin.ai</h1></div>
          <div className="flex items-center gap-4"><div className="hidden sm:flex flex-col items-end"><span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">House TVL</span><span className="text-xs font-mono font-bold text-purple-400">${houseLiquidity.toFixed(2)}</span></div><div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-full shadow-inner"><Wallet className="w-3 h-3 text-zinc-500" /><span className="font-mono font-medium text-emerald-400 text-xs">${balance.toFixed(2)}</span><button onClick={() => setShowPayIDModal(true)} className="ml-1"><PlusCircle className="w-3.5 h-3.5 text-zinc-600 hover:text-emerald-400 transition-colors" /></button></div>
            {isLoggedIn && (<div className="flex items-center gap-2"><button onClick={handleLogout} disabled={isWithdrawing || tradeResultForAnimation || spinning || autoSpins > 0} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-medium px-2 py-1 rounded-full disabled:opacity-50">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</button></div>)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-1 sm:p-2 flex flex-col lg:flex-row gap-1 sm:gap-2 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-2 relative shadow-2xl overflow-hidden min-h-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
            <div className="relative grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-[320px] sm:max-w-[420px] aspect-[5/3] mb-2 shrink-0 z-10">
              <AnimatePresence>{tradeResultForAnimation && <ReelResultAnimation result={tradeResultForAnimation} onComplete={handleAnimationComplete} betAmount={bet} winAmount={winAmount} />}</AnimatePresence>
              {grid.map((row, i) => row.map((token, j) => (
                  <div key={`${i}-${j}`} className={`rounded-lg border-2 shadow-inner relative overflow-hidden bg-zinc-950/80 transition-all duration-300 ${winningCells.some(c=>c.r===i&&c.c===j) ? 'border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.5)] bg-emerald-500/10' : losingCells.some(c=>c.r===i&&c.c===j) ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-500/10' : 'border-zinc-800'}`}>
                    <AnimatePresence>
                      {spinning ? (
                        <motion.div key={`spinning-${j}`} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.3 + j*0.1}} className="w-full h-full"><TradeStreamColumn delay={j * 0.1} isFast={isStoppingRef.current} /></motion.div>
                      ) : (
                        <motion.div key={`static-${token.id}-${i}-${j}`} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 + j*0.1}} className="w-full h-full flex flex-col items-center justify-center">
                          <div className={`text-2xl sm:text-3xl ${token.color} drop-shadow-[0_0_10px_currentColor]`}>{token.symbol}</div>
                          <div className="absolute bottom-1 text-[7px] font-bold text-white/50 uppercase tracking-wider hidden sm:block">{token.name}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
              )))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 flex flex-col gap-1 sm:gap-2 shrink-0 min-h-0">
          <AnimatePresence>
            {gambleMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-zinc-900 border border-purple-500/50 rounded-xl p-2 shadow-[0_0_20px_rgba(168,85,247,0.15)] shrink-0 overflow-hidden">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex justify-between items-center w-full"><span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Gamble Profit</span><span className="text-sm font-mono font-bold text-white">${winAmount.toFixed(2)}</span></div>
                  <div className="w-12 h-16 bg-white rounded flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">{gambleCard ? <span className={gambleCard.color}>{gambleCard.symbol}</span> : <div className="w-full h-full bg-zinc-800 rounded border border-white flex items-center justify-center"><Zap className="w-4 h-4 text-zinc-600" /></div>}</div>
                  <div className="w-full flex flex-col gap-1"><div className="flex gap-1"><button onClick={() => handleGamble('RED')} disabled={!!gambleCard || houseLiquidity < winAmount} className="flex-1 py-1 bg-red-500 hover:bg-red-400 text-white font-bold rounded text-[9px] disabled:opacity-50">RED (2x)</button><button onClick={() => handleGamble('BLACK')} disabled={!!gambleCard || houseLiquidity < winAmount} className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-[9px] disabled:opacity-50">BLACK (2x)</button></div><div className="flex gap-1">{SUITS.map(s => (<button key={s.id} onClick={() => handleGamble('SUIT', s.id)} disabled={!!gambleCard || houseLiquidity < (winAmount * 3)} className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm rounded flex justify-center disabled:opacity-50"><span className={s.color}>{s.symbol}</span></button>))}</div>
                    <button onClick={collectWinnings} disabled={!!gambleCard} className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold rounded text-[9px] transition-colors disabled:opacity-50 mt-1">Take Win & Exit</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-xl shrink-0">
            <div className="mb-1.5">
              <div className="flex justify-between items-center mb-0.5"><label className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">Risk Profile</label></div>
              <div className="grid grid-cols-4 gap-1">
                {['LOW', 'MED', 'HIGH', 'DEGEN'].map(r => (<button key={r} onClick={() => setRiskLevel(r as any)} disabled={spinning || gambleMode || tradeResultForAnimation || autoSpins > 0} className={`py-1 rounded border font-mono text-[9px] transition-all disabled:opacity-50 ${riskLevel === r ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>{r}</button>))}
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-[9px] font-medium text-zinc-400 mb-0.5 uppercase tracking-wider">Trade Size</label>
              <div className="grid grid-cols-5 gap-1">{BET_AMOUNTS.slice(0, 5).map((amount) => (<motion.button key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBet(amount)} disabled={spinning || gambleMode || tradeResultForAnimation || autoSpins > 0} className={`py-1 rounded border font-mono text-[9px] transition-all ${bet === amount ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-50'}`}>{`$${amount < 1 ? amount.toFixed(2) : amount}`}</motion.button>))}</div>
              <div className="grid grid-cols-4 gap-1 mt-1">{BET_AMOUNTS.slice(5).map((amount) => (<motion.button key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBet(amount)} disabled={spinning || gambleMode || tradeResultForAnimation || autoSpins > 0} className={`py-1 rounded border font-mono text-[9px] transition-all ${bet === amount ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-50'}`}>{`$${amount}`}</motion.button>))}</div>
            </div>

            <div className="flex items-stretch gap-2 relative">
              <motion.div animate={spinning ? { y: [0, -10, 0], rotate: [0, 10, -10, 0] } : { y: [0, -3, 0] }} transition={spinning ? { repeat: Infinity, duration: 0.4 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] flex items-center pl-1">🐸</motion.div>
              {winAmount > 0 && !gambleMode ? (
                <><motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52,211,153,0.4)" }} whileTap={{ scale: 0.98 }} onClick={collectWinnings} disabled={tradeResultForAnimation || autoSpins > 0} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group disabled:opacity-50">TAKE WIN (${winAmount.toFixed(2)})</motion.button>
                  <AnimatePresence><motion.button initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168,85,247,0.6)" }} whileTap={{ scale: 0.95 }} onClick={() => { playSound('click'); setGambleMode(true); }} disabled={houseLiquidity < winAmount || tradeResultForAnimation || autoSpins > 0} className={`absolute -top-10 right-0 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/50 flex items-center justify-center gap-1 z-20 disabled:opacity-50 disabled:grayscale`} title={houseLiquidity < winAmount ? "Not enough House TVL to gamble" : ""}><Zap className="w-3 h-3 fill-current" /> GAMBLE</motion.button></AnimatePresence></>
              ) : (
                <><motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52,211,153,0.4)" }} whileTap={{ scale: 0.98 }} onClick={spinning ? handleStop : handleSpin} disabled={(balance < bet && freeSpins === 0) || gambleMode || !isLoggedIn || tradeResultForAnimation || autoSpins > 0} className={`flex-1 py-2 rounded-lg bg-gradient-to-r text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-1.5 relative overflow-hidden group ${spinning ? 'from-amber-500 to-red-500' : 'from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400'}`}><div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />{spinning && !isStoppingRef.current ? <><Square className="w-4 h-4 fill-current"/>STOP</> : <><Play className="w-4 h-4 fill-current" />{freeSpins > 0 ? `FREE SPIN (${freeSpins})` : autoSpins > 0 ? `AUTOSPIN (${autoSpins})` :'EXECUTE'}</>}</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setAutoSpins(p => p > 0 ? 0 : 10)} disabled={spinning || gambleMode || tradeResultForAnimation || winAmount > 0 || freeSpins > 0} className={`w-12 py-2 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-0.5 group ${autoSpins > 0 ? '!bg-purple-600 !text-white !border-purple-500' : 'hover:border-zinc-500'}`}>{autoSpins > 0 ? <span className='text-sm'>{autoSpins}</span> : <><RotateCw className='w-3 h-3'/><span className='text-[10px]'>AUTO</span></>}</motion.button></>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl min-h-0">
            <div className="bg-zinc-900/80 border-b border-zinc-800 px-1 py-1 flex items-center gap-1 shrink-0">
              <button onClick={() => setActiveTab('chart')} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${activeTab === 'chart' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}><BarChart2 className="w-3 h-3" /> CHART</button>
              <button onClick={() => setActiveTab('logs')} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${activeTab === 'logs' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}><Info className="w-3 h-3"/> LOGS</button>
            </div>
            <div className="p-2 flex-1 overflow-y-auto min-h-0">
              {activeTab === 'chart' ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-end mb-1"><div><div className="text-[9px] text-zinc-500 font-mono">NET PNL</div><div className={`text-sm font-bold font-mono ${balance >= 1000 ? 'text-emerald-400' : 'text-red-400'}`}>{balance >= 1000 ? '+' : '-'}${Math.abs(balance - 1000).toFixed(2)}</div></div><div className="text-right"><div className="text-[9px] text-zinc-500 font-mono">TRADES</div><div className="text-xs font-bold text-white font-mono">{tradeCount}</div></div></div>
                  <div className="flex-1 min-h-[100px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><YAxis domain={['auto', 'auto']} hide /><Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', padding: '4px' }} itemStyle={{ color: '#34d399' }} formatter={(v:number) => [`$${v.toFixed(2)}`, 'Balance']} labelFormatter={(l) => `Trade ${l}`}/><ReferenceLine y={1000} stroke="#3f3f46" strokeDasharray="3 3" /><Line type="monotone" dataKey="balance" stroke={balance >= 1000 ? '#34d399' : '#ef4444'} strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
                </div>
              ) : (
                <div className="space-y-1 flex flex-col justify-end h-full font-mono text-[9px] sm:text-[10px]">
                  {logs.map((log, i) => (<motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className={`flex gap-1 ${log.includes('PROFIT') || log.includes('WON') ? 'text-emerald-400' : log.includes('Loss') || log.includes('RUGGED') || log.includes('failed') ? 'text-red-400' : log.includes('API') ? 'text-blue-400' : 'text-zinc-500'}`}><span className="shrink-0">{'>'}</span><span className="break-all">{log}</span></motion.div>))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
