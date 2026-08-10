import { AppShell } from "@/components/app-shell";
import { CapabilitySeal } from "@/components/domain";
export default async function Capability({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AppShell title={`Circuit ${id} / Capability`}><CapabilitySeal/><p className="subtle">The contract never accepts arbitrary calldata. Council authorization is limited to a registered target and named action.</p></AppShell>}
