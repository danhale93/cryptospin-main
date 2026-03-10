export const STRATEGIES = {
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

export const TOKENS = [
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

export const SUITS = [
  { id: 'HEART', symbol: '♥', type: 'RED' },
  { id: 'DIAMOND', symbol: '♦', type: 'RED' },
  { id: 'SPADE', symbol: '♠', type: 'BLACK' },
  { id: 'CLUB', symbol: '♣', type: 'BLACK' }
];