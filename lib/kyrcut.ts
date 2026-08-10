import { z } from "zod";

export const threatLevels = ["CLEAR", "WATCH", "DEGRADED", "LIKELY_INCIDENT", "CRITICAL", "INCONCLUSIVE"] as const;
export const actions = ["NO_ACTION", "ALERT", "ARM_PAUSE", "PAUSE"] as const;
export const circuitStates = ["NORMAL", "WATCH", "ARMED", "PAUSED", "RECOVERY_PENDING", "DISABLED"] as const;
export const decisionSchema = z.object({ schema_version:z.literal(1), policy_version:z.number().int().positive(), threat_level:z.enum(threatLevels), recommended_action:z.enum(actions), confidence_band:z.enum(["LOW","MEDIUM","HIGH"]), onchain_anomaly:z.enum(["NONE","WEAK","MATERIAL","SEVERE","UNKNOWN"]), source_diversity:z.number().int().min(0).max(8), fresh_source_count:z.number().int().min(0).max(8), evidence_fingerprint:z.string().regex(/^0x[a-fA-F0-9]{64}$/), primary_signal_class:z.enum(["TRANSFER","PRIVILEGE","ORACLE","LIQUIDITY","UPGRADE","GOVERNANCE","EXTERNAL_ALERT","OTHER"]), short_reason:z.string().min(1).max(240) });
export type Decision=z.infer<typeof decisionSchema>;
export function contractAddress(){const a=process.env.NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS;return a&&/^0x[a-fA-F0-9]{40}$/.test(a)?a:undefined}
export function shortAddress(address?: string){return address?`${address.slice(0,6)}...${address.slice(-4)}`:"not configured"}
