"use client";

import { AppShell } from "@/components/app-shell";
import { CapabilitySeal } from "@/components/domain";
import { compactAddress, useWallet } from "@/components/wallet";
import { createBrowserClient, requireKyrcutAddress } from "@/lib/genlayer-browser";
import { Send } from "lucide-react";
import { use, useState } from "react";

type State = "idle" | "submitting" | "submitted" | "error";

export default function Capability({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, connect } = useWallet();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    try {
      if (!address) {
        await connect();
        throw new Error("Wallet connected. Review the capability and submit again.");
      }
      const form = new FormData(event.currentTarget);
      const client = createBrowserClient(address, window.ethereum);
      await client.connect("studionet");
      const contract = requireKyrcutAddress();
      const target = String(form.get("target"));
      const capability = String(form.get("capability"));
      const tx1 = await client.writeContract({
        address: contract,
        functionName: "authorize_pause_capability",
        args: [Number(id), target, capability],
        value: 0n,
      });
      const tx2 = await client.writeContract({
        address: contract,
        functionName: "set_mode",
        args: [Number(id), "ARMED"],
        value: 0n,
      });
      setState("submitted");
      setMessage(`Capability submitted: ${tx1}. Armed mode submitted: ${tx2}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Capability update failed");
    }
  }

  return (
    <AppShell title={`Circuit ${id} / Capability`}>
      <CapabilitySeal />
      <form className="form" onSubmit={submit}>
        <label>
          Target adapter address
          <input name="target" required pattern="0x[a-fA-F0-9]{40}" placeholder="0x..." />
        </label>
        <label>
          Capability
          <select name="capability" defaultValue="pause">
            <option value="pause">pause</option>
            <option value="enterEmergencyMode">enterEmergencyMode</option>
          </select>
        </label>
        <p>
          Wallet: <code>{compactAddress(address)}</code>. The council wallet must submit this transaction.
        </p>
        <button className="button primary" type="submit" disabled={state === "submitting"}>
          <Send size={15} />
          {state === "submitting" ? "Submitting..." : "Authorize and arm"}
        </button>
        {message && <p className={state === "error" ? "notice error" : "notice"}>{message}</p>}
      </form>
    </AppShell>
  );
}
