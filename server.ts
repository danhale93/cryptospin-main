import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from './server/db';
import { STRATEGIES, TOKENS, SUITS } from './server/constants';

const app = express();
const port = 8083;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

const generateGrid = () => Array(3).fill(0).map(() => Array(5).fill(0).map(() => TOKENS[Math.floor(Math.random() * TOKENS.length)]));

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
    let user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
    if (!user) {
        db.prepare('INSERT INTO users (address, balance, win_amount, free_spins, free_spin_bet_amount) VALUES (?, ?, ?, ?, ?)')
          .run(address, 1000, 0, 0, 0);
        user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    }
    const house = db.prepare('SELECT * FROM house').get() as any;
    res.json({ user, houseTvl: house.tvl });
});

app.post('/api/deposit', (req, res) => {
    const { address, amount } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    if (user) {
        db.prepare('UPDATE users SET balance = balance + ? WHERE address = ?').run(amount, address);
        db.prepare('UPDATE house SET tvl = tvl + ?').run(amount);
        const updatedUser = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
        const house = db.prepare('SELECT * FROM house').get() as any;
        res.json({ balance: updatedUser.balance, houseTvl: house.tvl });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.post('/api/withdraw', (req, res) => {
    const { address, amount } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
    if (user) {
        if (user.balance >= amount) {
            db.prepare('UPDATE users SET balance = balance - ? WHERE address = ?').run(amount, address);
            db.prepare('UPDATE house SET tvl = tvl - ?').run(amount);
            const updatedUser = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
            const house = db.prepare('SELECT * FROM house').get() as any;
            res.json({ balance: updatedUser.balance, houseTvl: house.tvl, message: `Withdrawal of $${amount} successful.` });
        } else {
            res.json({ error: "Insufficient balance." });
        }
    } else {
        res.status(404).json({ error: "User not found." });
    }
});

app.post('/api/spin', (req, res) => {
    const { address, betAmount, riskLevel } = req.body;

    let user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;

    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }

    if (user.balance < betAmount && user.free_spins === 0) {
        return res.status(400).json({ error: "Insufficient funds" });
    }
    
    const hadFreeSpinsBefore = user.free_spins > 0;
    let isFreeSpin = false;

    if (hadFreeSpinsBefore) {
        db.prepare('UPDATE users SET free_spins = free_spins - 1 WHERE address = ?').run(address);
        isFreeSpin = true;
    } else {
        db.prepare('UPDATE users SET balance = balance - ? WHERE address = ?').run(betAmount, address);
    }

    const finalGrid = generateGrid();
    const scatters = finalGrid.flat().filter(t => t.id === 'SCATTER').length;

    if (scatters >= 3) {
        const betForNewFreeSpins = hadFreeSpinsBefore ? user.free_spin_bet_amount : betAmount;
        if (!hadFreeSpinsBefore) {
             db.prepare('UPDATE users SET free_spins = free_spins + 5, free_spin_bet_amount = ? WHERE address = ?')
               .run(betForNewFreeSpins, address);
        } else {
             db.prepare('UPDATE users SET free_spins = free_spins + 5 WHERE address = ?')
               .run(address);
        }
    }

    const riskStrategies = STRATEGIES[riskLevel as keyof typeof STRATEGIES];
    const strategy = riskStrategies[Math.floor(Math.random() * riskStrategies.length)];

    const isWin = Math.random() < 0.4; // 40% win chance
    let winAmount = 0;

    if (isWin) {
        const line = finalGrid[1];
        const winMultiplier = line.reduce((acc, token) => acc + token.mult, 0);
        if (isFreeSpin) {
            winAmount = user.free_spin_bet_amount * winMultiplier;
            db.prepare('UPDATE users SET win_amount = ? WHERE address = ?').run(winAmount, address);
        } else {
            winAmount = betAmount * winMultiplier;
            db.prepare('UPDATE users SET win_amount = ? WHERE address = ?').run(winAmount, address);
        }
    } else {
        db.prepare('UPDATE users SET win_amount = 0 WHERE address = ?').run(address);
    }
    
    db.prepare(`
      INSERT INTO trade_history (user_address, bet_amount, risk_level, is_win, win_amount, strategy_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(address, isFreeSpin ? 0 : betAmount, riskLevel, isWin ? 1 : 0, winAmount, strategy.name);

    user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    const house = db.prepare('SELECT * FROM house').get() as any;

    res.json({
        finalGrid,
        isWin,
        strategy,
        scatters,
        user,
        houseTvl: house.tvl
    });
});

app.post('/api/gamble', (req, res) => {
    const { address, type, suitId } = req.body;
    let user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.win_amount <= 0) return res.status(400).json({ error: "No active winnings to gamble" });

    const drawnCard = SUITS[Math.floor(Math.random() * SUITS.length)];
    let won = false;
    let newWinAmount = 0;

    if (type === 'RED' && drawnCard.type === 'RED') {
        won = true;
        newWinAmount = user.win_amount * 2;
    } else if (type === 'BLACK' && drawnCard.type === 'BLACK') {
        won = true;
        newWinAmount = user.win_amount * 2;
    } else if (type === 'SUIT' && drawnCard.id === suitId) {
        won = true;
        newWinAmount = user.win_amount * 4;
    }
    
    db.prepare('UPDATE users SET win_amount = ? WHERE address = ?').run(newWinAmount, address);
    user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    const house = db.prepare('SELECT * FROM house').get() as any;

    res.json({
        won,
        drawnCard,
        newWinAmount: user.win_amount,
        houseTvl: house.tvl
    });
});

app.post('/api/collect', (req, res) => {
    const { address } = req.body;
    let user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
    if (!user) return res.status(400).json({ error: "User not found" });

    db.prepare('UPDATE users SET balance = balance + win_amount, win_amount = 0 WHERE address = ?').run(address);
    
    user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;

    res.json({ balance: user.balance });
});

app.get('/api/trade-history', (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }
    const trades = db.prepare('SELECT * FROM trade_history WHERE user_address = ? ORDER BY timestamp DESC').all(address);
    res.json(trades);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});