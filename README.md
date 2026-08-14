# Kyrcut

**Consensus before catastrophe.** Kyrcut is a GenLayer-native emergency circuit for protocols that have explicitly authorized a narrow safety action.

Its judgment question is: **does currently observable public evidence justify entering an emergency safety state for this specifically authorized protocol?**

## Deployment

- GenLayer Studionet Kyrcut contract: `0x00484742b542656ef582fC2644E64e4ad97a5093`
- Kyrcut explorer: `https://studio.genlayer.com/explorer/contracts/0x00484742b542656ef582fC2644E64e4ad97a5093`
- Target adapter contract: `0xBA6dA5A99eD1f32Ea5EcD5256bB5F50595d7e7a9`
- Target adapter explorer: `https://studio.genlayer.com/explorer/contracts/0xBA6dA5A99eD1f32Ea5EcD5256bB5F50595d7e7a9`
- Network RPC: `https://studio.genlayer.com/api`

## What is implemented

- Next.js product shell with richer circuit, trigger, audit, and profile views.
- Studionet-targeted injected-wallet connection flow with browser writes for registration, capability arming, and heartbeat triggering.
- `contracts/kyrcut.py`, a Python Intelligent Contract with Shadow as the default mode, explicit owner/council administration, permissionless heartbeat triggering, HTTPS source manifests, replay protection, bounded pause capabilities, canonical output validation, a leader/validator consensus path, and a finalized target adapter call after a consensus PAUSE result.
- `contracts/kyrcut_target_adapter.py`, a target-side adapter contract that accepts `pause` or `enterEmergencyMode` only when the caller is the trusted Kyrcut contract.
- A trigger script (`scripts/keeper.mjs`) that supports dry-run and never makes a semantic decision. The contract itself does not require a privileged keeper for heartbeat submission.
- Vercel-ready environment configuration through `NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS`.

## Safety model

The contract limits the only capability to `pause` or `enterEmergencyMode` on the registered target adapter. A leader fetches the locked manifest; validators independently refetch it. Evidence content is explicitly treated as untrusted data. A pause recommendation needs two reachable sources and diversity of at least two. The browser registration form now requires multiple HTTPS sources so reviewers and users cannot accidentally register a one-source pause flow. Shadow Mode records evaluation without granting pause power; recovery is deliberately not automated.

Most writes are deterministic state or authorization operations. `submit_heartbeat` is the GenLayer-native non-deterministic write: it fetches public evidence, asks the leader LLM for a structured judgement, and uses `gl.eq_principle.prompt_comparative` so validators compare semantic equivalence instead of exact wording. The equivalence principle now explicitly requires exact agreement on `PAUSE` versus `ARM_PAUSE`; those actions are never equivalent because only `PAUSE` executes the registered target capability. If an Armed circuit finalizes a PAUSE result, Kyrcut records the incident and emits `target.emit(on="finalized").pause(...)` or `enterEmergencyMode(...)` to the registered adapter.

Capability arming is also sequential in the browser: the app submits `authorize_pause_capability`, waits for that transaction receipt to be accepted, and only then submits `set_mode("ARMED")`.

## Studionet rate-limit handling

GenLayer Studio currently rate-limits requests aggressively, so the browser app avoids receipt polling and repeated background reads. Registration, capability authorization, arming, and heartbeat pages submit the transaction once and show the transaction hash. Profile stats use a small capped read window and session cache instead of scanning the whole contract every page load. Operator scripts poll receipts at a slow interval only outside the public browser flow.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

For the deployed Studionet instance, set:

```bash
NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS=0x00484742b542656ef582fC2644E64e4ad97a5093
NEXT_PUBLIC_KYRCUT_TARGET_ADAPTER_ADDRESS=0xBA6dA5A99eD1f32Ea5EcD5256bB5F50595d7e7a9
```

Use the same variables in Vercel under Project Settings -> Environment Variables.

## Verification

Checks used during the latest local/deployed round:

```bash
npm run build
npm run test
genvm-lint check contracts/kyrcut.py --json
genvm-lint check contracts/kyrcut_target_adapter.py --json
```

The steward-fix Kyrcut contract and target adapter were deployed on Studionet. The target adapter was read back with `get_last_kyrcut_action`, confirming it trusts the new Kyrcut CA and starts unpaused. The contracts pass local GenVM lint, frontend tests cover multi-source registration plus finalize-before-arm sequencing, and the frontend passes a production Next.js build.
