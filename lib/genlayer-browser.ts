"use client";

import { chains, createClient } from "genlayer-js";
import { contractAddress } from "./kyrcut";
import type { EthereumProvider } from "../components/wallet";

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

function assertHttpsUrl(url: string) {
  if (!/^https:\/\/[^\s]+\.[^\s]+$/i.test(url)) {
    throw new Error("Evidence sources must be valid HTTPS URLs");
  }
}

export function sourceManifestFromUrls(urls: string[]) {
  const manifest = urls
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) => {
      assertHttpsUrl(url);
      return { label: index === 0 ? "primary" : `source-${index + 1}`, url };
    });

  if (manifest.length < 2) {
    throw new Error("Kyrcut requires at least two independent HTTPS evidence sources before a pause can be justified");
  }

  return JSON.stringify(manifest);
}

type CapabilityClient = {
  writeContract(args: Record<string, unknown>): Promise<`0x${string}`>;
  waitForTransactionReceipt(args: Record<string, unknown>): Promise<unknown>;
};

export async function authorizeCapabilityThenArm(
  client: CapabilityClient,
  contract: `0x${string}`,
  circuitId: number,
  target: string,
  capability: string,
) {
  const authorizationHash = await client.writeContract({
    address: contract,
    functionName: "authorize_pause_capability",
    args: [circuitId, target, capability],
    value: 0n,
  });

  await client.waitForTransactionReceipt({
    hash: authorizationHash,
    status: "ACCEPTED",
    interval: 15_000,
    retries: 20,
  });

  const armHash = await client.writeContract({
    address: contract,
    functionName: "set_mode",
    args: [circuitId, "ARMED"],
    value: 0n,
  });

  return { authorizationHash, armHash };
}
