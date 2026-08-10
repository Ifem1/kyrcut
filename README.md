# Kyrcut

**Consensus before catastrophe.** Kyrcut is a GenLayer-native emergency circuit for protocols that have explicitly authorized a narrow safety action.

Its judgment question is: **does currently observable public evidence justify entering an emergency safety state for this specifically authorized protocol?**

## What is implemented

- Next.js product shell with truthful empty-chain states; it does not fabricate circuits, incidents, wallets, hashes, or verdicts.
- Studionet-targeted injected-wallet connection flow.
- `contracts/kyrcut.py`, a Python Intelligent Contract with Shadow as the default mode, explicit owner/council/keeper gates, HTTPS source manifests, replay protection, bounded pause capabilities, canonical output validation, and a leader/validator consensus path.
- A trigger-only keeper skeleton (`scripts/keeper.mjs`) that supports dry-run and never makes a semantic decision.

## Safety model

The contract limits the only capability to `pause` or `enterEmergencyMode` on the registered target. A leader fetches the locked manifest; validators independently refetch it. Evidence content is explicitly treated as untrusted data. A pause recommendation needs two reachable sources and diversity of at least two. Shadow Mode records evaluation without granting pause power; recovery is deliberately not automated.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS` only after a successful deployment. No address is bundled with this repository.

## Verification

Expected checks once dependencies and GenLayer tools are installed:

```bash
npm run lint
npm run build
genvm-lint check contracts/kyrcut.py --json
pytest tests/direct/ -v
```

The automated dependency installation could not complete in this environment, so these commands have not been represented as passing. Deployment and integration tests remain planned until a GenLayer runner/test environment is available.
