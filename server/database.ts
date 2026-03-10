await db.run(`
  CREATE TABLE IF NOT EXISTS users (
    // ... columns
    multiplier_spins_remaining INTEGER DEFAULT 0,
    // ...
  )
`);