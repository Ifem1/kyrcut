"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LogOut, Wallet } from "lucide-react";

export type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<string[]>;
  on?: (event: "accountsChanged", callback: (accounts: string[]) => void) => void;
  removeListener?: (event: "accountsChanged", callback: (accounts: string[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type WalletContextValue = {
  address?: string;
  error?: string;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function compactAddress(address?: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "not connected";
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const cached = window.localStorage.getItem("kyrcut.wallet");
    if (cached) setAddress(cached);

    const onAccountsChanged = (accounts: string[]) => {
      const next = accounts[0];
      setAddress(next);
      if (next) window.localStorage.setItem("kyrcut.wallet", next);
      else window.localStorage.removeItem("kyrcut.wallet");
    };

    window.ethereum?.on?.("accountsChanged", onAccountsChanged);
    return () => window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  async function connect() {
    setError(undefined);
    if (!window.ethereum) {
      setError("No injected wallet found");
      return;
    }
    try {
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xf22f" }] });
      setAddress(account);
      window.localStorage.setItem("kyrcut.wallet", account);
    } catch {
      setError("Wallet connection was cancelled or Studionet is unavailable.");
    }
  }

  function disconnect() {
    setAddress(undefined);
    window.localStorage.removeItem("kyrcut.wallet");
  }

  const value = useMemo(() => ({ address, error, connect, disconnect }), [address, error]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}

export function WalletButton() {
  const { address, connect, disconnect, error } = useWallet();
  return (
    <div title={error}>
      <button className="wallet" onClick={address ? disconnect : connect}>
        {address ? <LogOut size={15} /> : <Wallet size={15} />}
        {address ? compactAddress(address) : "Connect wallet"}
      </button>
    </div>
  );
}
