"use client";

import { WalletButton } from "@/components/wallet";
import { contractAddress, shortAddress } from "@/lib/kyrcut";
import { Activity, ArrowRight, Check, CircleDot, Radar, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const rail = ["NORMAL", "WATCH", "ARMED", "PAUSED"];

export default function Home() {
  const address = contractAddress();

  return (
    <main>
      <header>
        <Link className="logo" href="/">
          KYRCUT<span>/</span>
        </Link>
        <nav>
          <Link href="/circuits">Circuits</Link>
          <Link href="/keeper">Trigger</Link>
          <Link href="/audit">Audit</Link>
          <Link href="/profile">Profile</Link>
        </nav>
        <WalletButton />
      </header>
      <section className="hero">
        <div className="eyebrow">
          <Radar size={15} /> GENLAYER-NATIVE EMERGENCY CIRCUITS
        </div>
        <h1>
          Consensus
          <br />
          <i>before</i> catastrophe.
        </h1>
        <p>
          Kyrcut lets a protocol&apos;s approved safety circuit respond only when independent GenLayer validators agree
          that live public evidence justifies it.
        </p>
        <div className="actions">
          <Link className="button primary" href="/circuits/new">
            Register a circuit <ArrowRight size={17} />
          </Link>
          <Link className="button" href="/circuits">
            Inspect public circuits
          </Link>
        </div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-core"><Sparkles size={22}/></div></div>
      </section>
      <section className="stat-strip"><div><strong>01</strong><span>Permissionless heartbeat</span></div><div><strong>02</strong><span>Validator consensus</span></div><div><strong>03</strong><span>Policy-bound response</span></div><div><strong>24/7</strong><span>Publicly auditable</span></div></section>
      <section className="grid">
        <article className="breaker">
          <div className="card-top">
            <span>HOW A CIRCUIT HOLDS</span>
            <ShieldCheck size={19} />
          </div>
          <div className="rail">
            {rail.map((step, index) => (
              <div key={step} className={index === 0 ? "step active" : "step"}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p>
            Evidence is evaluated by consensus. Deterministic policy restricts any downstream action to a
            pre-authorized pause capability.
          </p>
        </article>
        <article className="signal">
          <span className="eyebrow">
            <Activity size={15} /> SAFETY BOUNDARY
          </span>
          <h2>No triggerer. No source. No model can pause alone.</h2>
          <p>
            Shadow Mode is the default. Armed Mode requires council authorization, fresh diverse evidence, consensus
            finality, and an allowlisted action.
          </p>
          <Link href="/circuits/new">
            Configure a real circuit <ArrowRight size={16} />
          </Link>
        </article>
      </section>
      <section className="process-card"><div><span className="eyebrow"><CircleDot size={14}/> THE KYRCUT LOOP</span><h2>One signal. Four checks. Zero single points of failure.</h2><p>Every circuit moves through the same deliberate sequence before it can touch a protected protocol.</p></div><div className="process-list"><div><b>01</b><span><strong>Observe</strong> A public heartbeat records fresh evidence.</span><Check size={16}/></div><div><b>02</b><span><strong>Adjudicate</strong> GenLayer validators compare the meaning of the evidence.</span><Check size={16}/></div><div><b>03</b><span><strong>Authorize</strong> Your policy and council decide what is allowed.</span><Check size={16}/></div><div><b>04</b><span><strong>Respond</strong> Only an allowlisted capability can execute.</span><Check size={16}/></div></div></section>
      <section className="truth">
        <div>
          <Zap size={20} />
          <h2>Chain state, not theater.</h2>
        </div>
        {address ? (
          <p>
            Kyrcut is connected to Studionet at <code>{shortAddress(address)}</code>. Register a circuit before trigger heartbeats can
            create observations.
          </p>
        ) : (
          <p>
            No contract address is configured yet. Deploy Kyrcut and set{" "}
            <code>NEXT_PUBLIC_KYRCUT_CONTRACT_ADDRESS</code> before submitting heartbeats.
          </p>
        )}
        <Link className="button" href="/keeper">
          Trigger setup <ArrowRight size={16} />
        </Link>
      </section>
      <footer>
        <span>KYRCUT - CONSENSUS EMERGENCY CIRCUIT</span>
        <span>False positives and false negatives remain possible. Test in Shadow Mode first.</span>
      </footer>
    </main>
  );
}
