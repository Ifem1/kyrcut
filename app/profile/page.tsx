"use client";

import { AppShell } from "@/components/app-shell";
import { compactAddress, useWallet } from "@/components/wallet";
import { contractAddress, shortAddress } from "@/lib/kyrcut";
import { chains, createClient } from "genlayer-js";
import {
  Activity,
  AtSign,
  Copy,
  Fingerprint,
  Github,
  Globe2,
  Link2,
  LogOut,
  Radio,
  Save,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CircuitView = {
  owner?: string;
  council?: string;
  incident_count?: number;
};

type ProfileDraft = {
  name: string;
  contact: string;
  github: string;
};

type WalletStats = {
  status: "idle" | "loading" | "ready" | "error";
  circuits: number;
  cases: number;
  scanned: number;
  cachedAt: number;
};

const defaultDraft: ProfileDraft = { name: "Kyrcut operator", contact: "", github: "" };
const PROFILE_CACHE_MS = 120_000;
const PROFILE_SCAN_LIMIT = 6;

function sameAddress(left?: string, right?: string) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export default function Profile() {
  const ca = contractAddress();
  const { address, connect, disconnect } = useWallet();
  const [draft, setDraft] = useState<ProfileDraft>(defaultDraft);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState<WalletStats>({
    status: "idle",
    circuits: 0,
    cases: 0,
    scanned: 0,
    cachedAt: 0,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("kyrcut.profile");
    if (saved) {
      try {
        setDraft({ ...defaultDraft, ...JSON.parse(saved) });
      } catch {
        setDraft(defaultDraft);
      }
    }
  }, []);

  useEffect(() => {
    if (!ca || !address) {
      setStats({ status: "idle", circuits: 0, cases: 0, scanned: 0, cachedAt: 0 });
      return;
    }

    let cancelled = false;
    async function loadStats() {
      const cacheKey = `kyrcut.profile.stats.${ca}.${address}`.toLowerCase();
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as WalletStats;
          if (Date.now() - parsed.cachedAt < PROFILE_CACHE_MS) {
            setStats(parsed);
            return;
          }
        } catch {
          window.sessionStorage.removeItem(cacheKey);
        }
      }

      setStats((current) => ({ ...current, status: "loading" }));
      try {
        const client = createClient({
          chain: chains.studionet,
          endpoint: process.env.NEXT_PUBLIC_GENLAYER_RPC,
        });
        let circuits = 0;
        let cases = 0;
        let scanned = 0;

        for (let id = 1; id <= PROFILE_SCAN_LIMIT; id += 1) {
          const result = (await client.readContract({
            address: ca as `0x${string}`,
            functionName: "get_circuit",
            args: [id],
            jsonSafeReturn: true,
          })) as CircuitView | Record<string, never>;
          if (!result || Object.keys(result).length === 0) continue;
          scanned += 1;
          if (sameAddress(result.owner, address) || sameAddress(result.council, address)) {
            circuits += 1;
            cases += Number(result.incident_count ?? 0);
          }
        }

        const nextStats = { status: "ready" as const, circuits, cases, scanned, cachedAt: Date.now() };
        window.sessionStorage.setItem(cacheKey, JSON.stringify(nextStats));
        if (!cancelled) setStats(nextStats);
      } catch {
        if (!cancelled) setStats({ status: "error", circuits: 0, cases: 0, scanned: 0, cachedAt: 0 });
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [address, ca]);

  const initials = useMemo(() => {
    if (!address) return "KC";
    return address.slice(2, 4).toUpperCase();
  }, [address]);

  function saveProfile() {
    window.localStorage.setItem("kyrcut.profile", JSON.stringify(draft));
    setEditing(false);
  }

  return (
    <AppShell title="Your profile">
      <div className="motion-grid" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="profile-head live-panel">
        <div className="avatar">{initials}</div>
        <div>
          <span className="eyebrow">
            <Fingerprint size={14} /> WALLET IDENTITY
          </span>
          <h2>{address ? compactAddress(address) : "Connect a wallet to activate your profile."}</h2>
          <p>
            Your profile follows the connected wallet. Contract activity is read from the deployed Kyrcut CA when the
            wallet is connected.
          </p>
        </div>
        <button className={address ? "button" : "button primary"} onClick={address ? disconnect : connect}>
          {address ? <LogOut size={15} /> : <Wallet size={15} />}
          {address ? "Disconnect" : "Connect wallet"}
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <span className="eyebrow">
            <ShieldCheck size={14} /> OPERATOR PROFILE
          </span>
          <div className="profile-row">
            <AtSign size={17} />
            <span>
              <small>Display name</small>
              {editing ? (
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              ) : (
                <b>{draft.name || "Unnamed operator"}</b>
              )}
            </span>
          </div>
          <div className="profile-row">
            <Link2 size={17} />
            <span>
              <small>Contact</small>
              {editing ? (
                <input
                  placeholder="email, Telegram, or website"
                  value={draft.contact}
                  onChange={(event) => setDraft({ ...draft, contact: event.target.value })}
                />
              ) : (
                <b>{draft.contact || "Not added"}</b>
              )}
            </span>
          </div>
          <div className="profile-row">
            <Github size={17} />
            <span>
              <small>GitHub</small>
              {editing ? (
                <input
                  placeholder="@handle"
                  value={draft.github}
                  onChange={(event) => setDraft({ ...draft, github: event.target.value })}
                />
              ) : (
                <b>{draft.github || "Not connected"}</b>
              )}
            </span>
          </div>
          <div className="profile-row">
            <Globe2 size={17} />
            <span>
              <small>Network</small>
              <b>GenLayer Studionet</b>
            </span>
          </div>
          <button className="button" onClick={editing ? saveProfile : () => setEditing(true)}>
            {editing ? <Save size={14} /> : <Copy size={14} />}
            {editing ? "Save profile" : "Edit profile"}
          </button>
        </div>

        <div className="profile-card accent-card live-panel">
          <span className="eyebrow">CONTRACT CONNECTION</span>
          <h2>{ca ? shortAddress(ca) : "Not configured"}</h2>
          <p>Kyrcut contract address connected to this interface.</p>
          <div className="profile-metrics">
            <div>
              <small>Your circuits</small>
              <strong>{stats.status === "ready" ? stats.circuits : stats.status === "loading" ? "..." : "0"}</strong>
            </div>
            <div>
              <small>Your cases</small>
              <strong>{stats.status === "ready" ? stats.cases : stats.status === "loading" ? "..." : "0"}</strong>
            </div>
          <div>
            <small>Indexed</small>
            <strong>{stats.status === "ready" ? stats.scanned : stats.status === "error" ? "N/A" : "0"}</strong>
          </div>
          </div>
          <div className="status-line">
            <span className="pulse" /> {ca ? "CA connected" : "CA missing"} ·{" "}
            {address ? compactAddress(address) : "wallet not connected"}
          </div>
        </div>
      </div>

      <div className="profile-card profile-activity">
        <span className="eyebrow">
          <Activity size={14} /> WALLET ACTIVITY
        </span>
        <div className="activity-strip">
          <div>
            <Radio size={16} />
            <span>Registered circuits</span>
            <strong>{stats.status === "ready" ? stats.circuits : address ? "Reading..." : "Connect wallet"}</strong>
          </div>
          <div>
            <ShieldCheck size={16} />
            <span>Incident cases</span>
            <strong>{stats.status === "ready" ? stats.cases : "Read after connect"}</strong>
          </div>
          <div>
            <Fingerprint size={16} />
            <span>Profile source</span>
            <strong>Wallet + local contact card</strong>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
