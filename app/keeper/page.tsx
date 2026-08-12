"use client";

import { AppShell } from "@/components/app-shell";
import { compactAddress, useWallet } from "@/components/wallet";
import { createBrowserClient, requireKyrcutAddress } from "@/lib/genlayer-browser";
import { contractAddress, shortAddress } from "@/lib/kyrcut";
import { ArrowRight, CircleDot, Send, Terminal, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type TriggerState = "idle" | "submitting" | "submitted" | "error";

export default function Keeper() {
  const ca = contractAddress();
  const { address, connect } = useWallet();
  const [state, setState] = useState<TriggerState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    try {
      if (!address) {
        await connect();
        throw new Error("Wallet connected. Review the heartbeat and submit again.");
      }
      const form = new FormData(event.currentTarget);
      const circuitId = Number(form.get("circuit_id"));
      const windowEnd = Math.floor(Date.now() / 1000);
      const windowSeconds = Number(form.get("window_seconds"));
      const windowStart = windowEnd - windowSeconds;
      const client = createBrowserClient(address, window.ethereum);
      await client.connect("studionet");
      const hash = await client.writeContract({
        address: requireKyrcutAddress(),
        functionName: "submit_heartbeat",
        args: [circuitId, windowStart, windowEnd],
        value: 0n,
      });
      setState("submitted");
      setMessage(`Heartbeat submitted: ${hash}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Heartbeat failed");
    }
  }

  return (
    <AppShell title="Permissionless trigger">
      <div className="trigger-layout">
        <form className="empty trigger-card" onSubmit={submit}>
          <Terminal size={30} />
          <h2>Submit a heartbeat</h2>
          <p>
            Any wallet can trigger a due heartbeat. The caller cannot supply a verdict, alter evidence sources, or choose
            a pause target.
          </p>
          <p>
            Contract: <code>{shortAddress(ca)}</code> Wallet: <code>{compactAddress(address)}</code>
          </p>
          <label>
            Circuit ID
            <input name="circuit_id" required min={1} step={1} type="number" defaultValue={1} />
          </label>
          <label>
            Evidence window seconds
            <input name="window_seconds" required min={60} step={60} type="number" defaultValue={300} />
          </label>
          <button className="button primary" type="submit" disabled={state === "submitting"}>
            <Send size={15} />
            {state === "submitting" ? "Submitting..." : "Submit heartbeat"}
          </button>
          {message && <p className={state === "error" ? "notice error" : "notice"}>{message}</p>}
          <Link className="button" href="/profile">
            <UserRound size={16} /> View trigger identity <ArrowRight size={15} />
          </Link>
        </form>
        <div className="trigger-side">
          <span className="eyebrow">
            <CircleDot size={14} /> WHAT HAPPENS NEXT
          </span>
          <h2>Anyone can submit the heartbeat.</h2>
          <p>
            GenLayer decides the meaning of the evidence. If an Armed circuit finalizes a PAUSE result, Kyrcut emits the
            registered adapter capability on finality.
          </p>
          <div className="mini-flow">
            <span>submit</span>
            <i>-&gt;</i>
            <span>validators</span>
            <i>-&gt;</i>
            <span>adapter call</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
