import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

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

export default function LoginPage({ onLogin, addLog }: LoginPageProps) {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

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

  const handleTempWallet = () => {
    addLog("Creating a temporary wallet for development...");
    const randomWallet = ethers.Wallet.createRandom();
    addLog(`Created temporary wallet: ${randomWallet.address.slice(0,6)}...${randomWallet.address.slice(-4)}`);
    onLogin(randomWallet.address);
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
        </div>
      </div>
    </div>
  );
}
