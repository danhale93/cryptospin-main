// In handleSpin, after decrementing multiplierSpinsRemaining:
if (multiplierSpinsRemaining > 0) {
  const newRemaining = multiplierSpinsRemaining - 1;
  setMultiplierSpinsRemaining(newRemaining);
  if (newRemaining === 0) {
    setMultiplier(1);
  }
  // Sync to server
  fetch('/api/user/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      multiplierSpinsRemaining: newRemaining,
      multiplier: newRemaining === 0 ? 1 : multiplier
    })
  }).catch(console.error);
}