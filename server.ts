
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = 3000;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

// In-memory data stores (replace with a database in production)
const users: Record<string, { balance: number; win_amount: number; free_spins: number }> = {};
let houseTvl = 100000;

const STRATEGIES = {
    "LOW": [
        { name: "Mempool Frontrun", steps: ["Scan Mempool", "Identify Target", "Execute TX", "Confirm Profit"] },
        { name: "DEX Arbitrage", steps: ["Scan DEXs", "Find Spread", "Execute Swap", "Confirm Profit"] }
    ],
    "MED": [
        { name: "CEX/DEX Arbitrage", steps: ["Scan Exchanges", "Price Discrepancy", "Execute Trades", "Confirm Profit"] },
        { name: "MEV Sandwich", steps: ["Target TX", "Place Orders", "Squeeze Price", "Confirm Profit"] }
    ],
    "HIGH": [
        { name: "Cross-Chain Arb", steps: ["Scan Bridges", "Find Opportunity", "Execute Swaps", "Confirm Profit"] },
        { name: "Liquidation Snipe", steps: ["Monitor Loans", "Predict Liquidation", "Execute Bid", "Confirm Profit"] }
    ],
    "DEGEN": [
        { name: "Flash Loan Attack", steps: ["Borrow Flash Loan", "Manipulate Oracle", "Execute Exploit", "Repay & Profit"] },
    ]
};

const TOKENS = [
  { id: 'BTC', symbol: '₿', mult: 10 },
  { id: 'ETH', symbol: 'Ξ', mult: 5 },
  { id: 'SOL', symbol: '◎', mult: 3 },
  { id: 'DOGE', symbol: 'Ð', mult: 2 },
  { id: 'USDT', symbol: '₮', mult: 0.5 },
  { id: 'XRP', symbol: '✕', mult: 1.5 },
  { id: 'ADA', symbol: '₳', mult: 1.2 },
  { id: 'AVAX', symbol: '🔺', mult: 2.5 },
  { id: 'LINK', symbol: '🔗', mult: 2 },
  { id: 'SCATTER', symbol: '🎰', mult: 0 },
];

const SUITS = [
  { id: 'HEART', symbol: '♥', type: 'RED' },
  { id: 'DIAMOND', symbol: '♦', type: 'RED' },
  { id: 'SPADE', symbol: '♠', type: 'BLACK' },
  { id: 'CLUB', symbol: '♣', type: 'BLACK' }
];


app.post('/api/gemini', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent({ contents, ...config });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.get('/api/strategies', (req, res) => {
    res.json(STRATEGIES);
});

app.post('/api/auth', (req, res) => {
    const { address } = req.body;
    if (!users[address]) {
        users[address] = { balance: 1000, win_amount: 0, free_spins: 0 };
    }
    res.json({ user: users[address], houseTvl });
});

app.post('/api/deposit', (req, res) => {
    const { address, amount } = req.body;
    if (users[address]) {
        users[address].balance += amount;
        houseTvl += amount;
        res.json({ balance: users[address].balance, houseTvl });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.post('/api/withdraw', (req, res) => {
    const { address, amount } = req.body;
    if (users[address]) {
        if (users[address].balance >= amount) {
            users[address].balance -= amount;
            houseTvl -= amount;
            res.json({ balance: users[address].balance, houseTvl, message: `Withdrawal of $${amount} successful.` });
        } else {
            res.json({ error: "Insufficient balance." });
        }
    } else {
        res.status(404).json({ error: "User not found." });
    }
});

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

app.post('/api/spin', (req, res) => {
    const { address, betAmount, riskLevel } = req.body;

    if (!users[address]) {
        return res.status(400).json({ error: "User not found" });
    }

    const user = users[address];

    if (user.balance < betAmount && user.free_spins === 0) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    if (user.free_spins > 0) {
        user.free_spins--;
    } else {
        user.balance -= betAmount;
    }

    const finalGrid = generateGrid();
    const scatters = finalGrid.flat().filter(t => t.id === 'SCATTER').length;

    if (scatters >= 3) {
        user.free_spins += 5;
    }

    const riskStrategies = STRATEGIES[riskLevel as keyof typeof STRATEGIES];
    const strategy = riskStrategies[Math.floor(Math.random() * riskStrategies.length)];

    const isWin = Math.random() < 0.4; // 40% win chance
    let winMultiplier = 0;

    if (isWin) {
        const line = finalGrid[1];
        winMultiplier = line.reduce((acc, token) => acc + token.mult, 0);
        user.win_amount = betAmount * winMultiplier;
    }


    res.json({
        finalGrid,
        isWin,
        strategy,
        scatters,
        user,
        houseTvl
    });
});

app.post('/api/gamble', (req, res) => {
    const { address, type, suitId } = req.body;
    if (!users[address]) return res.status(400).json({ error: "User not found" });

    const user = users[address];
    if (user.win_amount <= 0) return res.status(400).json({ error: "No active winnings to gamble" });

    const drawnCard = SUITS[Math.floor(Math.random() * SUITS.length)];
    let won = false;

    if (type === 'RED' && drawnCard.type === 'RED') {
        won = true;
        user.win_amount *= 2;
    } else if (type === 'BLACK' && drawnCard.type === 'BLACK') {
        won = true;
        user.win_amount *= 2;
    } else if (type === 'SUIT' && drawnCard.id === suitId) {
        won = true;
        user.win_amount *= 4;
    }

    if (!won) {
        user.win_amount = 0;
    }

    res.json({
        won,
        drawnCard,
        newWinAmount: user.win_amount,
        houseTvl
    });
});

app.post('/api/collect', (req, res) => {
    const { address } = req.body;
    if (!users[address]) return res.status(400).json({ error: "User not found" });

    const user = users[address];
    user.balance += user.win_amount;
    user.win_amount = 0;

    res.json({ balance: user.balance });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
