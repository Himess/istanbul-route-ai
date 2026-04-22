"use client";

import Link from "next/link";
import { Wordmark } from "@/components/design/Wordmark";
import { HaloDot } from "@/components/design/HaloDot";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="max-w-[1080px] mx-auto w-full px-8 pt-8 pb-4 flex items-center justify-between">
        <Wordmark />
        <div className="flex items-center gap-2 text-[10px] font-mono ink-3">
          <HaloDot /> Arc testnet · 5042002
        </div>
      </header>

      <main className="flex-1 max-w-[1080px] mx-auto w-full px-8 flex flex-col justify-center pb-20">
        <div className="text-[11px] font-mono ink-3 uppercase tracking-[.12em] mb-4">
          00 · Istanbul Route AI
        </div>
        <h1 className="font-serif text-[72px] leading-[0.95] ink tracking-tight max-w-[920px]">
          A luxury-concierge navigation app where a{" "}
          <span className="italic">silent</span> Gemini agent picks your route and{" "}
          <span className="italic">USDC pays</span> in whispers.
        </h1>
        <p className="text-[16px] ink-2 mt-6 max-w-[720px] leading-relaxed">
          Built on Arc. Real İBB traffic signals, real IETT bus density, real ISPARK availability.
          Every agent tool call is a Circle Nanopayment settling in under a second.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[820px]">
          <Link
            href="/drive"
            className="group rounded-[22px] border border-line bg-paper p-6 shadow-2 hover:shadow-4 transition-shadow"
          >
            <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-3">For drivers</div>
            <div className="font-serif text-[28px] leading-[1.05] ink">
              Open the <span className="italic">mobile app</span>
            </div>
            <div className="text-[13px] ink-3 mt-2 leading-relaxed">
              Drive, Park, Card. Tap a destination; the agent chooses; your wallet debits silently.
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-teal-ink">
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </Link>

          <Link
            href="/municipality"
            className="group rounded-[22px] border p-6 shadow-2 hover:shadow-4 transition-shadow"
            style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}
          >
            <div className="text-[10px] font-mono tracking-[.12em] uppercase mb-3" style={{ color: "var(--iris-ink)" }}>
              For municipality
            </div>
            <div className="font-serif text-[28px] leading-[1.05] ink">
              Operator&apos;s <span className="italic">quiet console</span>
            </div>
            <div className="text-[13px] ink-3 mt-2 leading-relaxed">
              Live revenue, on-chain feed, zone heatmap, agent decision mix, Arc vs Ethereum margin.
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium" style={{ color: "var(--iris-ink)" }}>
              Open dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </Link>
        </div>

        <footer className="mt-20 flex items-center justify-between text-[10px] font-mono ink-3 tracking-[.12em] uppercase">
          <span>Built for Circle Nanopayments Hackathon · 2026</span>
          <a
            href="https://github.com/Himess/istanbul-route-ai"
            target="_blank"
            rel="noreferrer"
            className="hover:ink-2"
          >
            github.com/Himess/istanbul-route-ai ↗
          </a>
        </footer>
      </main>
    </div>
  );
}
