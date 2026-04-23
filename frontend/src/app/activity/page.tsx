"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/design/TopBar";
import { BottomNav } from "@/components/design/BottomNav";
import { HaloDot } from "@/components/design/HaloDot";
import { SignalBadge } from "@/components/design/SignalBadge";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { MobileShell } from "@/components/design/MobileShell";
import { BACKEND_URL, ARCSCAN_URL } from "@/lib/constants";

interface Payment {
  timestamp: number;
  txHash: string;
  fromZone: string;
  toZone: string;
  amount: string;
  isReal?: boolean;
}

type Item =
  | { type: "decision"; t: string; title: string; sub: string; sigs: { e: string; l: string }[] }
  | { type: "tx"; t: string; title: string; amt: string; hash: string }
  | { type: "topup"; t: string; title: string; hash: string };

export default function ActivityPage() {
  const wallet = useSmartWallet();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dashboard/payments`)
      .then((r) => r.json())
      .then((data) => {
        const rows: Item[] = [];
        (data?.payments || []).slice(0, 20).forEach((p: Payment) => {
          const t = new Date(p.timestamp || Date.now());
          const tStr = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
          rows.push({
            type: "tx",
            t: tStr,
            title: `Route · ${p.fromZone || "?"} → ${p.toZone || "?"}`,
            amt: Number(p.amount || 0).toFixed(4),
            hash: (p.txHash || "").slice(0, 6) + "…" + (p.txHash || "").slice(-4),
          });
        });
        setItems(rows.length ? rows : fallback());
      })
      .catch(() => setItems(fallback()));
  }, []);

  return (
    <MobileShell>
    <div className="relative w-full h-full overflow-y-auto bg-ivory pb-[120px]">
      <TopBar
        balance={wallet.balance}
        delta={wallet.delta}
        tone={wallet.status === "low" ? "low" : "normal"}
        address={wallet.address}
        mode={wallet.mode}
        onDisconnect={wallet.disconnect}
      />

      <div className="absolute left-3 right-3 top-[112px] z-20 max-w-[420px] mx-auto">
        <div className="px-2 pt-1 pb-4 flex items-center justify-between">
          <div>
            <div className="font-serif text-[32px] leading-[1.05] ink">Activity</div>
            <div className="text-[12px] ink-3 mt-1">Every agent decision and every on-chain debit.</div>
          </div>
          <Link
            href="/card"
            className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Link>
        </div>

        <div className="bg-paper border border-line rounded-[22px] overflow-hidden">
          {items.length === 0 && (
            <div className="p-8 text-center text-[12px] ink-3">Loading activity…</div>
          )}
          {items.map((it, i) => {
            if (it.type === "decision") {
              return (
                <div key={i} className="p-4 border-t border-line first:border-t-0" style={{ background: "var(--iris-tint)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <HaloDot />
                    <div className="text-[10px] font-mono tracking-[.12em] uppercase" style={{ color: "var(--iris-ink)" }}>
                      Agent decision
                    </div>
                    <div className="ml-auto text-[10px] font-mono ink-3">{it.t}</div>
                  </div>
                  <div className="text-[14px] font-medium ink">{it.title}</div>
                  <div className="text-[12px] ink-3 mt-0.5">{it.sub}</div>
                  {it.sigs && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {it.sigs.map((s, j) => (
                        <SignalBadge key={j} {...s} active size="sm" />
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            if (it.type === "topup") {
              return (
                <div key={i} className="p-4 border-t border-line flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-none" style={{ background: "oklch(95% 0.04 155)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] ink">{it.title}</div>
                    <div className="text-[10px] font-mono ink-3">{it.t} · {it.hash}</div>
                  </div>
                  <div className="font-mono text-[13px]" style={{ color: "var(--good)" }}>+</div>
                </div>
              );
            }
            return (
              <div key={i} className="p-4 border-t border-line flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-ivory-2 border border-line flex items-center justify-center flex-none">
                  <span className="text-[11px]" style={{ color: "var(--ink-3)" }}>·</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] ink truncate">{it.title}</div>
                  <div className="text-[10px] font-mono ink-3">{it.t} · {it.hash}</div>
                </div>
                <div className="font-mono text-[13px] ink tabular-nums">−{it.amt}</div>
              </div>
            );
          })}
        </div>

        <a
          href={ARCSCAN_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block text-center text-[11px] font-mono ink-3 py-3 rounded-full bg-paper border border-line hover:bg-ivory-2 transition-colors"
        >
          View on ArcScan ↗
        </a>
      </div>

      <BottomNav />
    </div>
    </MobileShell>
  );
}

function fallback(): Item[] {
  return [
    {
      type: "decision",
      t: "18:42",
      title: "Chose Galata over Atatürk",
      sub: "4 signals · Sultanahmet route",
      sigs: [
        { e: "📊", l: "IBB clear" },
        { e: "🚌", l: "IETT low" },
        { e: "🅿️", l: "42% free" },
      ],
    },
    { type: "tx", t: "18:42", title: "Route query", amt: "0.0005", hash: "0x4e1c…a112" },
    { type: "tx", t: "18:41", title: "Agent · IBB", amt: "0.0001", hash: "0x4e1c…9f03" },
    {
      type: "decision",
      t: "18:40",
      title: "Rerouted past incident on E-5",
      sub: "Saved ~3 min · stayed on Galata",
      sigs: [{ e: "🚧", l: "Incident" }],
    },
    { type: "tx", t: "18:40", title: "Agent · Weather", amt: "0.0001", hash: "0x4e1c…9712" },
    { type: "topup", t: "09:12", title: "Top up · 5.00 USDC", hash: "0x1b22…c309" },
  ];
}
