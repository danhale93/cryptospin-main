import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createWeb3Modal, useWeb3Modal } from '@web3modal/ethers/react'


// EIP-6963 types
interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any; // EIP-1193 provider
}

type EIP6963AnnounceProviderEvent = CustomEvent<EIP6963ProviderDetail>;

interface LoginPageProps {
  onLogin: (address: string) => void;
  addLog: (msg: string) => void;
}

const projectId = '6ddf763974f1ef900e5d30cfd8e339c8'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

// 3. Create modal
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/public/a0c201f9-f153-4b53-933e-635532b6951b.png']
}

createWeb3Modal({
  ethersConfig: {},
  chains: [mainnet],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

export default function LoginPage({ onLogin, addLog }: LoginPageProps) {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
    const { open } = useWeb3Modal()


  useEffect(() => {
    function onAnnounceProvider(event: EIP6963AnnounceProviderEvent) {
      setProviders(p => {
        if (p.some(existing => existing.info.uuid === event.detail.info.uuid)) return p;
        return [...p, event.detail];
      });
    }
    window.addEventListener("eip6963:announceProvider", onAnnounceProvider as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnounceProvider as EventListener);
    };
  }, []);

  const connectWallet = async (providerDetail: EIP6963ProviderDetail) => {
    try {
      const provider = new ethers.BrowserProvider(providerDetail.provider);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        addLog('Wallet connection failed: No accounts returned.');
        return;
      }
      const address = accounts[0];
      addLog(`Wallet connected: ${providerDetail.info.name} - ${address.slice(0,6)}...${address.slice(-4)}`);
      onLogin(address);
    } catch (e: any) {
      console.error("Wallet connection process failed", e);
      addLog("Wallet connection process failed.");
      if (e.message) {
        addLog(`Error details: ${e.message}`);
      }
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            CryptoSpin.ai
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Connect a wallet to start playing.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          {providers.length > 0 ? (
            providers.map((p) => (
              <button
                key={p.info.uuid}
                onClick={() => connectWallet(p)}
                className="w-full flex items-center justify-center gap-4 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <img src={p.info.icon} alt={p.info.name} className="w-8 h-8 rounded-full" />
                <span className="text-lg font-semibold">{p.info.name}</span>
              </button>
            ))
          ) : (
            <div className="text-center text-zinc-500 font-mono p-4 bg-zinc-950 rounded-lg border border-dashed border-zinc-700">
              <p className='text-yellow-400/80'>No browser wallet extensions found.</p>
              <p className="text-xs mt-2 text-zinc-600">This is expected inside the IDE. Use a temporary wallet to continue.</p>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-zinc-500">OR</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
            <button
                onClick={handleTempWallet}
                className="w-full flex items-center justify-center gap-4 px-4 py-3 bg-purple-600/80 rounded-lg hover:bg-purple-500/80 transition-colors"
            >
                <span className="text-lg font-semibold">Create Temporary Wallet</span>
            </button>
            <button onClick={() => open()} className="w-full flex items-center justify-center gap-4 px-4 py-3 bg-blue-600/80 rounded-lg hover:bg-blue-500/80 transition-colors">
                 <span className="text-lg font-semibold">Connect with Mobile Wallet</span>
            </button>
        </div>
      </div>
    </div>
  );
}
