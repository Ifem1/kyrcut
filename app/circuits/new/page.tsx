"use client";

import { AppShell } from "@/components/app-shell";
import { contractAddress } from "@/lib/kyrcut";
import { useState } from "react";

export default function NewCircuit() {
  const [sent, setSent] = useState(false);
  const address = contractAddress();

  return (
    <AppShell title="Register a circuit">
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <label>
          Protocol name
          <input required maxLength={80} placeholder="Example Protocol" />
        </label>
        <label>
          Protected target address
          <input required pattern="0x[a-fA-F0-9]{40}" placeholder="0x..." />
        </label>
        <label>
          Security council address
          <input required pattern="0x[a-fA-F0-9]{40}" placeholder="0x..." />
        </label>
        <label>
          Expected behavior notes
          <textarea maxLength={500} placeholder="What should normal operation look like?" />
        </label>
        <p>
          New circuits start in <b>Shadow Mode</b>. Contract:{" "}
          {address ? <code>{address}</code> : <code>not configured</code>}.
        </p>
        <button className="button primary" type="submit">
          Prepare registration
        </button>
        {sent && (
          <p className="notice">
            {address
              ? "Contract address is configured. Wallet transaction wiring is the next step before this form can submit on chain."
              : "Contract address is not configured. No transaction has been submitted."}
          </p>
        )}
      </form>
    </AppShell>
  );
}
