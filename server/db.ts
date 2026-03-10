import Database from 'better-sqlite3';

const db = new Database('crypto_casino.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    balance REAL NOT NULL DEFAULT 1000,
    win_amount REAL NOT NULL DEFAULT 0,
    free_spins INTEGER NOT NULL DEFAULT 0,
    free_spin_bet_amount REAL NOT NULL DEFAULT 0
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS house (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tvl REAL NOT NULL DEFAULT 100000
  );
`);

const houseExists = db.prepare('SELECT COUNT(*) as count FROM house').get() as { count: number };
if (houseExists.count === 0) {
    db.prepare('INSERT INTO house (tvl) VALUES (?)').run(100000);
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

export default db;