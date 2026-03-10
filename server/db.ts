import Database from 'better-sqlite3';

const db = new Database('crypto_casino.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    balance REAL NOT NULL DEFAULT 1000,
    win_amount REAL NOT NULL DEFAULT 0,
    free_spins INTEGER NOT NULL DEFAULT 0,
    free_spin_bet_amount REAL NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1
  );
`);

// Add multiplier columns if they don't exist
try {
  db.exec(`ALTER TABLE users ADD COLUMN multiplier REAL DEFAULT 1`);
} catch (e) {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN multiplier_spins_remaining INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS house (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tvl REAL NOT NULL DEFAULT 100000,
    jackpot REAL NOT NULL DEFAULT 5000
  );
`);

const houseExists = db.prepare('SELECT COUNT(*) as count FROM house').get() as { count: number };
if (houseExists.count === 0) {
    db.prepare('INSERT INTO house (tvl, jackpot) VALUES (?, ?)').run(100000, 5000);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS trade_history (
    trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_address TEXT,
    bet_amount REAL,
    risk_level TEXT,
    is_win BOOLEAN,
    win_amount REAL,
    strategy_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_address) REFERENCES users (address)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT,
    text TEXT,
    is_ai BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;