# Kyrcut

**Consensus before catastrophe.** Kyrcut is a GenLayer-native emergency circuit for protocols that have explicitly authorized a narrow safety action.

Its judgment question is: **does currently observable public evidence justify entering an emergency safety state for this specifically authorized protocol?**

## Deployment

- GenLayer Studionet contract: `0x7c8D2F6992F167E0587AdA2e650a095856052466`
- Explorer: `https://studio.genlayer.com/explorer/contracts/0x7c8D2F6992F167E0587AdA2e650a095856052466`
- Network RPC: `https://studio.genlayer.com/api`

## What is implemented

- Next.js product shell with richer circuit, trigger, audit, and profile views.
- Studionet-targeted injected-wallet connection flow.
- `contracts/kyrcut.py`, a Python Intelligent Contract with Shadow as the default mode, explicit owner/council administration, permissionless heartbeat triggering, HTTPS source manifests, replay protection, bounded pause capabilities, canonical output validation, and a leader/validator consensus path.
- A trigger script (`scripts/keeper.mjs`) that supports dry-run and never makes a semantic decision. The contract itself does not require a privileged keeper for heartbeat submission.
- Vercel-ready environment configuration through `NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS`.

## Safety model

The contract limits the only capability to `pause` or `enterEmergencyMode` on the registered target. A leader fetches the locked manifest; validators independently refetch it. Evidence content is explicitly treated as untrusted data. A pause recommendation needs two reachable sources and diversity of at least two. Shadow Mode records evaluation without granting pause power; recovery is deliberately not automated.

Most writes are deterministic state or authorization operations. `submit_heartbeat` is the GenLayer-native non-deterministic write: it fetches public evidence, asks the leader LLM for a structured judgement, and uses `gl.eq_principle.prompt_comparative` so validators compare semantic equivalence instead of exact wording.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

For the deployed Studionet instance, set:

```bash
NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS=0x7c8D2F6992F167E0587AdA2e650a095856052466
```

Use the same variable in Vercel under Project Settings -> Environment Variables.

## Verification

Checks used during the latest local/deployed round:

```bash
npm run build
genvm-lint check contracts/kyrcut.py --json
```

The deployed contract was exercised on Studionet with three separate wallets: circuit registration, policy update, council rotation, mode changes, capability authorization, and permissionless heartbeat submission.
