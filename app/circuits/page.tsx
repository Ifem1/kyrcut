import { AppShell } from "@/components/app-shell";
import { contractAddress } from "@/lib/kyrcut";
import { Activity, ArrowUpRight, Plus, Radio, Shield, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function Circuits() {
  const address = contractAddress();

  return (
    <AppShell title="Protected circuits">
      <div className="page-intro"><p>Registered protection policies for protocols you trust.</p><Link className="button primary" href="/circuits/new"><Plus size={16}/> New circuit</Link></div>
      <div className="circuit-overview"><div className="overview-stat"><span>NETWORK</span><strong>Studionet</strong><small>GenLayer L2</small></div><div className="overview-stat"><span>ACTIVE CIRCUITS</span><strong>0</strong><small>Ready to register</small></div><div className="overview-stat"><span>MODE</span><strong>Shadow</strong><small>Safe by default</small></div><div className="overview-stat"><span>CONSENSUS</span><strong><Activity size={16}/> Optimistic</strong><small>Validator adjudication</small></div></div>
      <div className="empty empty-wide">
        <Radio size={30} />
        <h2>No registered circuits found</h2>
        {address ? (
          <p>Kyrcut is connected to GenLayer. Register your first circuit to create live chain state.</p>
        ) : (
          <p>
            Kyrcut needs <code>NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS</code> before it can read protected circuits from
            GenLayer.
          </p>
        )}
        <div className="empty-actions"><Link className="button primary" href="/circuits/new"><Plus size={16} /> Register circuit</Link><Link className="button" href="/audit"><Shield size={16}/> Read the audit model <ArrowUpRight size={14}/></Link></div>
      </div>
      <div className="tip-card"><SlidersHorizontal size={20}/><div><strong>Start in Shadow Mode</strong><p>Observe evidence and validator outcomes before granting a live pause capability.</p></div></div>
    </AppShell>
  );
}
