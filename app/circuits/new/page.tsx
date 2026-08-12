"use client";

import { AppShell } from "@/components/app-shell";
import { compactAddress, useWallet } from "@/components/wallet";
import { createBrowserClient, requireKyrcutAddress, sourceManifestFromUrl } from "@/lib/genlayer-browser";
import { contractAddress } from "@/lib/kyrcut";
import { Send } from "lucide-react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "submitted" | "error";

export default function NewCircuit() {
  const { address, connect } = useWallet();
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const ca = contractAddress();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    try {
      if (!address) {
        await connect();
        throw new Error("Wallet connected. Review the form and submit again.");
      }
      const form = new FormData(event.currentTarget);
      const client = createBrowserClient(address, window.ethereum);
      await client.connect("studionet");
      const hash = await client.writeContract({
        address: requireKyrcutAddress(),
        functionName: "register_circuit",
        args: [
          String(form.get("name")),
          String(form.get("target")),
          String(form.get("council")),
          address,
          sourceManifestFromUrl(String(form.get("source_url"))),
          String(form.get("policy")),
        ],
        value: 0n,
      });
      setState("submitted");
      setMessage(`Registration submitted: ${hash}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Registration failed");
    }
  }

  return (
    <AppShell title="Register a circuit">
      <form className="form" onSubmit={submit}>
        <label>
          Protocol name
          <input name="name" required maxLength={80} placeholder="Example Protocol" />
        </label>
        <label>
          Target adapter address
          <input name="target" required pattern="0x[a-fA-F0-9]{40}" placeholder="0x..." />
        </label>
        <label>
          Security council address
          <input name="council" required pattern="0x[a-fA-F0-9]{40}" placeholder="0x..." />
        </label>
        <label>
          Primary HTTPS evidence source
          <input name="source_url" required type="url" pattern="https://.*" placeholder="https://status.example.org" />
        </label>
        <label>
          Circuit policy
          <textarea
            name="policy"
            required
            maxLength={4000}
            placeholder="Describe the evidence threshold required before Kyrcut may pause the target adapter."
          />
        </label>
        <p>
          New circuits start in <b>Shadow Mode</b>. Contract: {ca ? <code>{ca}</code> : <code>not configured</code>}.
          Wallet: <code>{compactAddress(address)}</code>.
        </p>
        <button className="button primary" type="submit" disabled={state === "submitting"}>
          <Send size={15} />
          {state === "submitting" ? "Submitting..." : "Submit registration"}
        </button>
        {message && <p className={state === "error" ? "notice error" : "notice"}>{message}</p>}
      </form>
    </AppShell>
  );
}
