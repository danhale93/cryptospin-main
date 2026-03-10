import React from 'react';

interface PayIDModalProps {
  onClose: () => void;
  onDeposit: (amount: number) => void;
  addLog: (msg: string) => void;
}

export default function PayIDModal({ onClose, onDeposit, addLog }: PayIDModalProps) {
  const payId = 'support$payid.crypto.com';

  const handleDeposit = () => {
    const amount = prompt("Enter the amount you sent (simulated):", "100");
    if (amount && !isNaN(Number(amount))) {
      onDeposit(Number(amount));
      addLog(`[PAYID] Manual deposit of $${amount} confirmed.`);
      onClose();
    } else {
      addLog('[PAYID] Invalid amount entered.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-sm p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
        <h2 className="text-xl font-bold text-center text-emerald-400">Deposit via PayID</h2>
        <p className="text-sm text-zinc-400 text-center mt-2">
          Send funds to the following PayID from your exchange or wallet.
        </p>
        <div className="my-4 p-3 bg-zinc-950 rounded-lg border border-zinc-700 text-center">
          <p className="text-xs text-zinc-500">PayID</p>
          <p className="text-lg font-mono text-white">{payId}</p>
        </div>
        <div className="text-xs text-zinc-500 text-center">
          <p>This is a simulated process. After sending, manually confirm the deposit amount below.</p>
        </div>
        <div className="mt-4 flex flex-col gap-2">
            <button onClick={handleDeposit} className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-lg transition-colors">
                Confirm Deposit
            </button>
            <button onClick={onClose} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
}