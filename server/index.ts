app.post('/api/user/update', async (req: Request, res: Response) => {
  try {
    const { walletAddress, balance, freeSpins, multiplier, multiplierSpinsRemaining } = req.body;
    // Update only provided fields
    let query = 'UPDATE users SET ';
    const params: any[] = [];
    const updates: string[] = [];

    if (balance !== undefined) {
      updates.push('balance = ?');
      params.push(balance);
    }
    if (freeSpins !== undefined) {
      updates.push('free_spins = ?');
      params.push(freeSpins);
    }
    if (multiplier !== undefined) {
      updates.push('multiplier = ?');
      params.push(multiplier);
    }
    if (multiplierSpinsRemaining !== undefined) {
      updates.push('multiplier_spins_remaining = ?');
      params.push(multiplierSpinsRemaining);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE wallet_address = ?';
    params.push(walletAddress);

    await db.run(query, params);
    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});