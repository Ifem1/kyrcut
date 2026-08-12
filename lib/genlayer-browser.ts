"use client";

import type { EthereumProvider } from "@/components/wallet";
import { contractAddress } from "@/lib/kyrcut";
import { chains, createClient } from "genlayer-js";

export function requireKyrcutAddress() {
  const address = contractAddress();
  if (!address) throw new Error("NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS is not configured");
  return address as `0x${string}`;
}

export function createBrowserClient(account: string, provider?: EthereumProvider) {
  if (!provider) throw new Error("No injected wallet provider found");
  return createClient({
    chain: chains.studionet,
    endpoint: process.env.NEXT_PUBLIC_GENLAYER_RPC,
    account: account as `0x${string}`,
    provider,
  });
}

export function sourceManifestFromUrl(url: string) {
  return JSON.stringify([{ label: "primary", url }]);
}
