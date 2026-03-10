// Add to props
multiplier: number;
multiplierSpinsRemaining: number;

// In the stats grid, add:
{multiplier > 1 && (
  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-4 rounded-xl border border-purple-500/20">
    <div className="text-sm text-gray-400">Multiplier</div>
    <div className="text-2xl font-bold text-purple-400">{multiplier}x</div>
    {multiplierSpinsRemaining > 0 && (
      <div className="text-xs text-purple-300 mt-1">
        {multiplierSpinsRemaining} spins left
      </div>
    )}
  </div>
)}