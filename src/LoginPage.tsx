import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { createWeb3Modal, defaultConfig, useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { projectId, metadata, mainnet } from './config';
import { Wallet, TestTube2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (address: string) => void;
  addLog: (msg: string) => void;
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
})

createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true
})

export default function LoginPage({ onLogin, addLog }: LoginPageProps) {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isConnected && address) {
      addLog(`Wallet connected: ${address.slice(0,6)}...${address.slice(-4)}`);
      onLogin(address);
    }
  }, [isConnected, address, onLogin, addLog]);


  const handleTempWallet = async () => {
    addLog("Creating a temporary wallet for development...");
    const randomWallet = ethers.Wallet.createRandom();
    const address = randomWallet.address;
    addLog(`Created temporary wallet: ${address.slice(0,6)}...${address.slice(-4)}`);

    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
        });
        if (!response.ok) {
            throw new Error('Failed to authenticate with temporary wallet');
        }
        const { user } = await response.json();
        onLogin(user.address);
    } catch (error) {
        console.error(error);
        addLog('Temporary wallet login failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Welcome to CryptoSpin.ai
          </h1>
          <p className="mt-2 text-md text-zinc-400">
            Your decentralized gaming experience awaits.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
            <button
                onClick={() => open()}
                className="w-full flex items-center justify-center gap-4 px-4 py-3 bg-blue-600/80 rounded-lg hover:bg-blue-500/80 transition-colors"
            >
                <Wallet className="w-6 h-6" />
                <span className="text-lg font-semibold">Connect Wallet</span>
            </button>
             <p className="text-xs text-center text-zinc-500">Use browser extension or WalletConnect</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-zinc-500">OR</span>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
            <button
                onClick={handleTempWallet}
                className="w-full flex items-center justify-center gap-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
                <TestTube2 className="w-6 h-6" />
                <span className="text-lg font-semibold">Use a Temporary Wallet</span>
            </button>
            <p className="text-xs text-center text-zinc-500">For testing and development purposes.</p>
        </div>
      </div>
    </div>
  );
}
