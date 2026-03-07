import Database from 'better-sqlite3';

const db = new Database('crypto_casino.db');
const user = db.prepare('SELECT * FROM users').get();
console.log(JSON.stringify(user));