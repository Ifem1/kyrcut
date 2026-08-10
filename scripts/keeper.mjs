import { chains, createAccount, createClient } from "genlayer-js";
import { existsSync, readFileSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS;
const TRIGGER_PRIVATE_KEY = process.env.KYRCUT_TRIGGER_PRIVATE_KEY ?? process.env.KYRCUT_KEEPER_PRIVATE_KEY;
const CIRCUIT_ID = process.env.KYRCUT_PROTOCOL_ID ?? process.env.KYRCUT_CIRCUIT_ID;
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC;

const dryRun = process.argv.includes("--dry-run");
const now = Math.floor(Date.now() / 1000);
const windowSeconds = Number(process.env.KYRCUT_TRIGGER_WINDOW_SECONDS ?? process.env.KYRCUT_KEEPER_WINDOW_SECONDS ?? "300");
const windowEnd = Number(process.env.KYRCUT_WINDOW_END ?? now);
const windowStart = Number(process.env.KYRCUT_WINDOW_START ?? windowEnd - windowSeconds);

function requireEnv(name, value) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function requireAddress(name, value) {
  const candidate = requireEnv(name, value);
  if (!/^0x[a-fA-F0-9]{40}$/.test(candidate)) {
    throw new Error(`${name} must be a 0x-prefixed address`);
  }
  return candidate;
}

function requirePrivateKey(value) {
  const key = requireEnv("KYRCUT_TRIGGER_PRIVATE_KEY", value);
  if (!/^0x[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error("KYRCUT_TRIGGER_PRIVATE_KEY must be a 0x-prefixed 32-byte private key");
  }
  return key;
}

function requirePositiveInt(name, value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

const address = requireAddress("NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS", CONTRACT_ADDRESS);
const circuitId = requirePositiveInt("KYRCUT_PROTOCOL_ID", CIRCUIT_ID);
if (!Number.isInteger(windowStart) || !Number.isInteger(windowEnd) || windowEnd <= windowStart) {
  throw new Error("trigger window is invalid");
}

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        contract: address,
        circuitId,
        windowStart,
        windowEnd,
        wouldCall: "submit_heartbeat",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const account = createAccount(requirePrivateKey(TRIGGER_PRIVATE_KEY));
const client = createClient({
  chain: chains.studionet,
  endpoint: RPC_URL,
  account,
});

console.log(`Submitting heartbeat for circuit ${circuitId} from ${account.address}`);
const hash = await client.writeContract({
  account,
  address,
  functionName: "submit_heartbeat",
  args: [circuitId, windowStart, windowEnd],
  value: 0n,
});
console.log(`Submitted: ${hash}`);

const receipt = await client.waitForTransactionReceipt({
  hash,
  status: "accepted",
  interval: 5000,
  retries: 60,
});
console.log(
  JSON.stringify(
    {
      hash,
      status: receipt.status_name ?? receipt.status,
      result: receipt.result_name ?? receipt.result,
      contract: address,
      circuitId,
      windowStart,
      windowEnd,
    },
    null,
    2,
  ),
);
