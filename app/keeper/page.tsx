import { AppShell } from "@/components/app-shell";
import { contractAddress, shortAddress } from "@/lib/kyrcut";
import { ArrowRight, CircleDot, Terminal, UserRound } from "lucide-react";
import Link from "next/link";

export default function Keeper() {
  const address = contractAddress();

  return (
    <AppShell title="Permissionless trigger">
      <div className="trigger-layout"><div className="empty trigger-card">
        <Terminal size={30} />
        <h2>No trigger observations on chain</h2>
        <p>
          Any wallet can trigger a due heartbeat. The caller cannot supply a verdict, alter evidence sources, or choose a
          pause target.
        </p>
        <p>Contract: <code>{shortAddress(address)}</code></p>
        <pre>KYRCUT_PROTOCOL_ID=1 KYRCUT_TRIGGER_PRIVATE_KEY=... npm run trigger -- --dry-run</pre>
        <p>Use a scheduler or manual wallet action after registering a circuit. Dry-run never writes.</p><Link className="button primary" href="/profile"><UserRound size={16}/> View trigger identity <ArrowRight size={15}/></Link></div><div className="trigger-side"><span className="eyebrow"><CircleDot size={14}/> WHAT HAPPENS NEXT</span><h2>Anyone can submit the heartbeat.</h2><p>The caller only pays gas and records a time window. GenLayer decides the meaning of the evidence; the caller cannot choose the verdict.</p><div className="mini-flow"><span>submit</span><i>→</i><span>validators</span><i>→</i><span>finality</span></div></div></div>
    </AppShell>
  );
}
