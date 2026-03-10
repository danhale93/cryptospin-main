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

app.get('/api/market-sentiment', async (req, res) => {
    try {
        const recentTrades = db.prepare('SELECT is_win, win_amount FROM trade_history ORDER BY timestamp DESC LIMIT 20').all() as any[];
        const winCount = recentTrades.filter(t => t.is_win).length;
        const sentiment = winCount > 10 ? 'BULLISH' : winCount > 5 ? 'NEUTRAL' : 'BEARISH';
        
        const prompt = `The current market sentiment is ${sentiment} based on ${winCount}/20 recent winning trades. 
        Give a 5-word snarky market status update for a crypto trading app. Use all caps. No emojis.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        res.json({ 
            sentiment, 
            status: text.trim(),
            score: (winCount / 20) * 100
        });
    } catch (error) {
        res.json({ sentiment: 'NEUTRAL', status: 'MARKET IS TOTALLY COOKED', score: 50 });
    }
});

app.post('/api/ai-alpha', async (req, res) => {
    const { address } = req.body;
    try {
        const trades = db.prepare('SELECT * FROM trade_history WHERE user_address = ? ORDER BY timestamp DESC LIMIT 5').all(address) as any[];
        
        const prompt = `You are a degenerate crypto trading bot named "DegenBot". Analyze these recent trades: ${JSON.stringify(trades)}. 
        Give a very short (max 20 words), snarky, high-energy market update using heavy crypto slang (HODL, RUG, MOON, LFG, NFA, WAGMI). 
        If they are winning, be hype. If losing, be toxic/funny. No emojis.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ alpha: text.trim() });
    } catch (error) {
        res.json({ alpha: "Market's cooked. Signal lost in the mempool. Just HODL." });
    }
});

app.get('/api/messages', (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50').all();
    res.json(messages.reverse());
});

app.post('/api/messages', async (req, res) => {
    const { address, text } = req.body;
    db.prepare('INSERT INTO messages (address, text) VALUES (?, ?)').run(address, text);
    
    if (Math.random() > 0.7) {
        try {
            const prompt = `You are a toxic, high-energy crypto degen in a chatroom. Someone just said: "${text}". 
            Reply with a very short (max 10 words), snarky, slang-heavy response. No emojis.`;
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const aiText = result.response.text().trim();
            db.prepare('INSERT INTO messages (address, text, is_ai) VALUES (?, ?, ?)').run('DEGEN_BOT', aiText, 1);
        } catch (e) {}
    }
    
    res.json({ success: true });
});

app.get('/api/leaderboard', (req, res) => {
    try {
        const leaders = db.prepare('SELECT address, balance FROM users ORDER BY balance DESC LIMIT 10').all();
        res.json(leaders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

app.get('/api/global-wins', (req, res) => {
    try {
        const wins = db.prepare('SELECT user_address as address, win_amount as amount, strategy_name as strategy FROM trade_history WHERE is_win = 1 ORDER BY timestamp DESC LIMIT 10').all();
        res.json(wins);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch global wins" });
    }
});

app.post('/api/auth', (req, res) => {
    const { address } = req.body;
    let user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
    if (!user) {
        db.prepare('INSERT INTO users (address, balance, win_amount, free_spins, free_spin_bet_amount, xp, level) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(address, 1000, 0, 0, 0, 0, 1);
        user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    }
    const house = db.prepare('SELECT * FROM house').get() as any;
    res.json({ user, houseTvl: house.tvl, jackpot: house.jackpot });
});

app.post('/api/deposit', (req, res) => {
    const { address, amount } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    if (user) {
        db.prepare('UPDATE users SET balance = balance + ? WHERE address = ?').run(amount, address);
        db.prepare('UPDATE house SET tvl = tvl + ?').run(amount);
        const updatedUser = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
        const house = db.prepare('SELECT * FROM house').get() as any;
        res.json({ balance: updatedUser.balance, houseTvl: house.tvl, jackpot: house.jackpot });
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
            res.json({ balance: updatedUser.balance, houseTvl: house.tvl, jackpot: house.jackpot, message: `Withdrawal of $${amount} successful.` });
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
        db.prepare('UPDATE house SET jackpot = jackpot + ?').run(betAmount * 0.01);
    }

    // Award XP
    const riskMult = riskLevel === 'DEGEN' ? 4 : riskLevel === 'HIGH' ? 3 : riskLevel === 'MED' ? 2 : 1;
    const xpGained = Math.max(1, Math.floor(betAmount * riskMult));
    let newXp = user.xp + xpGained;
    let newLevel = user.level;
    const xpToNext = newLevel * 100;

    if (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel += 1;
        // AI reaction to level up
        db.prepare('INSERT INTO messages (address, text, is_ai) VALUES (?, ?, ?)').run('DEGEN_BOT', `LFG! ${address.slice(0,6)} just hit level ${newLevel}. Whale status incoming.`, 1);
    }

    db.prepare('UPDATE users SET xp = ?, level = ? WHERE address = ?').run(newXp, newLevel, address);

    const finalGrid = generateGrid();
    const scatters = finalGrid.flat().filter(t => t.id === 'SCATTER').length;
    const btcCount = finalGrid.flat().filter(t => t.id === 'BTC').length;

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

    const isWin = Math.random() < 0.4; 
    let winAmount = 0;
    let isJackpotWin = false;

    if (btcCount === 15) { 
        const house = db.prepare('SELECT jackpot FROM house').get() as any;
        winAmount = house.jackpot;
        db.prepare('UPDATE house SET jackpot = 5000').run(); 
        isJackpotWin = true;
    } else if (isWin) {
        const line = finalGrid[1];
        const winMultiplier = line.reduce((acc, token) => acc + token.mult, 0);
        if (isFreeSpin) {
            winAmount = user.free_spin_bet_amount * winMultiplier;
        } else {
            winAmount = betAmount * winMultiplier;
        }
    }
    
    db.prepare('UPDATE users SET win_amount = ? WHERE address = ?').run(winAmount, address);
    
    db.prepare(`
      INSERT INTO trade_history (user_address, bet_amount, risk_level, is_win, win_amount, strategy_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(address, isFreeSpin ? 0 : betAmount, riskLevel, (isWin || isJackpotWin) ? 1 : 0, winAmount, isJackpotWin ? "JACKPOT SNIPE" : strategy.name);

    user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    const house = db.prepare('SELECT * FROM house').get() as any;

    res.json({
        finalGrid,
        isWin: isWin || isJackpotWin,
        isJackpotWin,
        strategy: isJackpotWin ? { name: "JACKPOT SNIPE", steps: ["Targeting House Pool", "Exploiting Oracle", "Draining Liquidity", "JACKPOT SECURED"] } : strategy,
        scatters,
        user,
        houseTvl: house.tvl,
        jackpot: house.jackpot
    });
});

app.post('/api/bonus-buy', (req, res) => {
    const { address, betAmount } = req.body;
    const cost = betAmount * 50;
    let user = db.prepare('SELECT * FROM users WHERE address = ?').get(address) as any;
    
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.balance < cost) return res.status(400).json({ error: "Insufficient funds for Bonus Buy" });
    
    db.prepare('UPDATE users SET balance = balance - ?, free_spins = free_spins + 5, free_spin_bet_amount = ? WHERE address = ?')
      .run(cost, betAmount, address);
    
    user = db.prepare('SELECT * FROM users WHERE address = ?').get(address);
    res.json({ user });
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
        houseTvl: house.tvl,
        jackpot: house.jackpot
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