import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const dbPath = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, "crypto_casino.db") : "crypto_casino.db";
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS house (id INTEGER PRIMARY KEY, tvl REAL);
  CREATE TABLE IF NOT EXISTS users (address TEXT PRIMARY KEY, balance REAL, win_amount REAL, free_spins INTEGER);
  INSERT OR IGNORE INTO house (id, tvl) VALUES (1, 10000);
`);

interface User {
  address: string;
  balance: number;
  win_amount: number;
  free_spins: number;
}

interface House {
  id: number;
  tvl: number;
}

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

const SUITS = [
  { id: 'HEART', symbol: '♥', color: 'text-red-500', type: 'RED' },
  { id: 'DIAMOND', symbol: '♦', color: 'text-red-500', type: 'RED' },
  { id: 'SPADE', symbol: '♠', color: 'text-zinc-800', type: 'BLACK' },
  { id: 'CLUB', symbol: '♣', color: 'text-zinc-800', type: 'BLACK' }
];

const STRATEGIES = {
  LOW: [
    { name: "Stablecoin Arb", type: "ARB", winRate: 0.75, minMult: 1.05, maxMult: 1.15, steps: ["Scan Pools", "Detect Peg Deviation", "Swap", "Restore Peg"], desc: "Exploits minor price differences between pegged stablecoins (e.g., USDT/USDC) across different liquidity pools." },
    { name: "Yield Farming", type: "YIELD", winRate: 0.80, minMult: 1.02, maxMult: 1.10, steps: ["Find APY", "Provide Liquidity", "Harvest", "Withdraw"], desc: "Provides liquidity to decentralized protocols to earn fees and token rewards with minimal principal risk." }
  ],
  MED: [
    { name: "Triangular Arb", type: "ARB", winRate: 0.55, minMult: 1.2, maxMult: 1.8, steps: ["Scan DEX", "Detect Gap", "Multi-Hop", "Profit"], desc: "Trades three different assets sequentially on a single exchange to exploit pricing inefficiencies between their trading pairs." },
    { name: "Stat Arb", type: "STAT", winRate: 0.50, minMult: 1.3, maxMult: 2.0, steps: ["Mean Reversion", "Short Overvalued", "Long Undervalued", "Close"], desc: "Uses quantitative models to identify historically correlated assets that have temporarily diverged in price." }
  ],
  HIGH: [
    { name: "Flashloan Liq", type: "FLASH", winRate: 0.35, minMult: 2.0, maxMult: 4.0, steps: ["Monitor Health", "Flashloan", "Liquidate", "Repay"], desc: "Borrows uncollateralized funds to liquidate undercollateralized positions on lending protocols, repaying the loan in the same transaction." },
    { name: "MEV Sandwich", type: "MEV", winRate: 0.30, minMult: 2.5, maxMult: 5.0, steps: ["Mempool Scan", "Front-run", "Back-run", "Extract"], desc: "Detects large pending trades, buys the asset before them (front-run), and sells it immediately after (back-run) to profit from the price impact." }
  ],
  DEGEN: [
    { name: "Shitcoin Sniper", type: "SNIPE", winRate: 0.15, minMult: 5.0, maxMult: 15.0, steps: ["Scan Mempool", "Detect Liquidity", "Buy Block 0", "Dump"], desc: "Monitors the blockchain for new token liquidity events, buying in the exact same block and selling shortly after for massive gains." },
    { name: "Cross-Chain MEV", type: "MEV", winRate: 0.10, minMult: 10.0, maxMult: 30.0, steps: ["Monitor Bridges", "Detect Imbalance", "Flashloan", "Arb"], desc: "Highly complex strategy exploiting price differences across entirely different blockchains using bridges and simultaneous flashloans." }
  ]
};

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth", (req, res) => {
    const { address } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as User | undefined;
    if (!user) {
      db.prepare("INSERT INTO users (address, balance, win_amount, free_spins) VALUES (?, ?, ?, ?)").run(address, 1000, 0, 0);
      user = { address, balance: 1000, win_amount: 0, free_spins: 0 };
    }
    const house = db.prepare("SELECT tvl FROM house WHERE id = 1").get() as House;
    res.json({ user, houseTvl: house.tvl });
  });

  app.post("/api/spin", (req, res) => {
    const { address, betAmount, riskLevel } = req.body;
    
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as User | undefined;
    const house = db.prepare("SELECT tvl FROM house WHERE id = 1").get() as House;
    
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.balance < betAmount && user.free_spins === 0) return res.status(400).json({ error: "Insufficient balance" });
    if (user.win_amount > 0) return res.status(400).json({ error: "Collect winnings first" });

    let newBalance = user.balance;
    let newFreeSpins = user.free_spins;
    let newHouseTvl = house.tvl;

    if (newFreeSpins === 0) {
      newBalance -= betAmount;
      newHouseTvl += betAmount;
    } else {
      newFreeSpins -= 1;
    }

    const strategies = STRATEGIES[riskLevel as keyof typeof STRATEGIES];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    const isWin = Math.random() < strategy.winRate;
    const winMult = isWin ? (Math.random() * (strategy.maxMult - strategy.minMult) + strategy.minMult) : 0;
    
    const finalGrid = generateGrid();
    let scatters = 0;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        if (Math.random() < 0.08) {
          finalGrid[r][c] = TOKENS.find(t => t.id === 'SCATTER')!;
          scatters++;
        }
      }
    }

    if (isWin) {
      const nonScatterTokens = TOKENS.filter(t => t.id !== 'SCATTER');
      const t1 = nonScatterTokens[Math.floor(Math.random() * nonScatterTokens.length)];
      const t2 = nonScatterTokens[Math.floor(Math.random() * nonScatterTokens.length)];
      const t3 = nonScatterTokens[Math.floor(Math.random() * nonScatterTokens.length)];

      let winTokens = [t1, t1, t1, t1, t1]; // Default 5 of a kind
      if (strategy.type === 'ARB') winTokens = [t1, t2, t3, t1, t2];
      if (strategy.type === 'YIELD') winTokens = [t1, t1, t1, t1, t1];
      if (strategy.type === 'FLASH') winTokens = [t2, t2, t2, t2, t2];
      if (strategy.type === 'MEV') winTokens = [t3, t3, t3, t3, t3];
      if (strategy.type === 'STAT') winTokens = [t1, t2, t1, t2, t1];
      if (strategy.type === 'SNIPE') winTokens = [t1, t1, t1, t1, t1];
      
      finalGrid[1] = winTokens;
    }

    if (scatters >= 3) {
      newFreeSpins += 5;
    }

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * winMult;
      newHouseTvl -= winAmount;
    }

    // Update DB
    db.prepare("UPDATE users SET balance = ?, win_amount = ?, free_spins = ? WHERE address = ?").run(newBalance, winAmount, newFreeSpins, address);
    db.prepare("UPDATE house SET tvl = ? WHERE id = 1").run(newHouseTvl);

    res.json({
      finalGrid, winMult, isWin, strategy, scatters,
      user: { balance: newBalance, win_amount: winAmount, free_spins: newFreeSpins },
      houseTvl: newHouseTvl
    });
  });

  app.post("/api/gamble", (req, res) => {
    const { address, type, suitId } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as User | undefined;
    const house = db.prepare("SELECT tvl FROM house WHERE id = 1").get() as House;

    if (!user || user.win_amount <= 0) return res.status(400).json({ error: "No winnings to gamble" });

    const drawn = SUITS[Math.floor(Math.random() * SUITS.length)];
    let won = false;
    let newAmount = 0;

    if (type === 'RED' || type === 'BLACK') {
      if (drawn.type === type) { won = true; newAmount = user.win_amount * 2; }
    } else if (type === 'SUIT') {
      if (drawn.id === suitId) { won = true; newAmount = user.win_amount * 4; }
    }

    let newHouseTvl = house.tvl;
    let finalWinAmount = 0;

    if (won) {
      const extraWin = newAmount - user.win_amount;
      newHouseTvl -= extraWin;
      finalWinAmount = newAmount;
    } else {
      newHouseTvl += user.win_amount;
      finalWinAmount = 0;
    }

    db.prepare("UPDATE users SET win_amount = ? WHERE address = ?").run(finalWinAmount, address);
    db.prepare("UPDATE house SET tvl = ? WHERE id = 1").run(newHouseTvl);

    res.json({
      won, drawnCard: drawn, newWinAmount: finalWinAmount, houseTvl: newHouseTvl
    });
  });

  app.post("/api/collect", (req, res) => {
    const { address } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as User | undefined;
    if (!user || user.win_amount <= 0) return res.status(400).json({ error: "No winnings to collect" });

    const newBalance = user.balance + user.win_amount;
    db.prepare("UPDATE users SET balance = ?, win_amount = 0 WHERE address = ?").run(newBalance, address);

    res.json({ balance: newBalance });
  });

  app.post("/api/deposit", (req, res) => {
    const { address, amount } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as User | undefined;
    const house = db.prepare("SELECT tvl FROM house WHERE id = 1").get() as House;
    if (!user) return res.status(400).json({ error: "User not found" });

    const newBalance = user.balance + amount;
    const newHouseTvl = house.tvl + amount; // In a real app, house TVL might be separate from user deposits, but for this simulation we'll add it to the pool

    db.prepare("UPDATE users SET balance = ? WHERE address = ?").run(newBalance, address);
    db.prepare("UPDATE house SET tvl = ? WHERE id = 1").run(newHouseTvl);

    res.json({ balance: newBalance, houseTvl: newHouseTvl });
  });

  app.post("/api/withdraw", (req, res) => {
    const { address, amount } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(address) as User | undefined;
    const house = db.prepare("SELECT tvl FROM house WHERE id = 1").get() as House;
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    const newBalance = user.balance - amount;
    const newHouseTvl = house.tvl - amount;

    db.prepare("UPDATE users SET balance = ? WHERE address = ?").run(newBalance, address);
    db.prepare("UPDATE house SET tvl = ? WHERE id = 1").run(newHouseTvl);

    res.json({ balance: newBalance, houseTvl: newHouseTvl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
