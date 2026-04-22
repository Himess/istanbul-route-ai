"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/design/TopBar";
import { BottomNav } from "@/components/design/BottomNav";
import { MicroSpark } from "@/components/design/MicroSpark";
import { HaloDot } from "@/components/design/HaloDot";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { BACKEND_URL } from "@/lib/constants";

interface LedgerEntry {
  when: string;
  label: string;
  kind: "query" | "agent" | "topup" | "other";
  amount: string;
  hash: string;
  signalEmoji?: string;
}

function TopUpChip({ amount, popular }: { amount: string; popular?: boolean }) {
  return (
    <button className="flex-1 rounded-2xl border border-line bg-paper py-3 flex flex-col items-center gap-0.5 hover:bg-ivory-2 transition-colors relative">
      {popular && (
        <span className="absolute -top-2 right-2 chip" style={{ background: "var(--iris)", color: "#fff" }}>
          POPULAR
        </span>
      )}
      <div className="font-mono text-[18px] ink tabular-nums">{amount}</div>
      <div className="text-[10px] font-mono ink-3">USDC</div>
    </button>
  );
}

function LedgerRow({ when, label, kind, amount, hash, signalEmoji }: LedgerEntry) {
  return (
    <div className="flex items-center gap-3 py-3 border-t border-line">
      <div className="w-8 h-8 rounded-xl bg-ivory-2 border border-line flex items-center justify-center flex-none">
        {kind === "topup" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2" strokeLinecap="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        ) : kind === "agent" ? (
          <span className="text-[11px]" style={{ color: "var(--iris-ink)" }}>✦</span>
        ) : (
          <span className="text-[12px] leading-none">{signalEmoji || "·"}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] ink truncate">{label}</div>
        <div className="text-[10px] font-mono ink-3">{when} · {hash}</div>
      </div>
      <div
        className="font-mono text-[13px] tabular-nums"
        style={{ color: kind === "topup" ? "var(--good)" : "var(--ink)" }}
      >
        {kind === "topup" ? "+" : "−"}{amount}
      </div>
    </div>
  );
}

export default function CardPage() {
  const wallet = useSmartWallet();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dashboard/payments`)
      .then((r) => r.json())
      .then((data) => {
        const rows: LedgerEntry[] = (data?.payments || []).slice(0, 8).map((p: Record<string, unknown>) => {
          const t = new Date((p.timestamp as number) || Date.now());
          const hh = String(t.getHours()).padStart(2, "0");
          const mm = String(t.getMinutes()).padStart(2, "0");
          return {
            when: `${hh}:${mm}`,
            label: `Route · ${(p.fromZone as string) || "?"} → ${(p.toZone as string) || "?"}`,
            kind: "query",
            amount: Number(p.amount || 0).toFixed(4),
            hash: ((p.txHash as string) || "").slice(0, 6) + "…" + ((p.txHash as string) || "").slice(-4),
          };
        });
        if (rows.length === 0) {
          setLedger(fallbackLedger());
        } else {
          setLedger(rows);
        }
      })
      .catch(() => setLedger(fallbackLedger()));
  }, []);

  const low = wallet.status === "low";
  const bal = wallet.balance;

  if (!wallet.mode) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-ivory flex items-center justify-center p-6">
        <div className="max-w-[420px] w-full text-center space-y-3">
          <div className="font-serif text-[32px] leading-[1.05] ink">Set up a wallet</div>
          <div className="text-[13px] ink-3">Go to the Drive tab to connect MetaMask or create a managed account.</div>
          <Link
            href="/drive"
            className="inline-flex items-center gap-2 px-5 h-[48px] rounded-2xl bg-teal text-white text-[14px] font-medium"
          >
            Open Drive
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ivory">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 420px at 50% -5%, oklch(96% 0.022 290) 0%, transparent 55%), var(--ivory)",
        }}
      />

      <TopBar balance={bal} delta={wallet.delta} tone={low ? "low" : "normal"} />

      <div className="absolute left-3 right-3 top-[112px] bottom-[102px] z-20 overflow-y-auto max-w-[420px] mx-auto pb-4">
        <div
          className="rounded-[28px] p-6 relative overflow-hidden border"
          style={{
            background: low
              ? "linear-gradient(180deg, oklch(98% 0.018 55) 0%, oklch(97% 0.012 55) 100%)"
              : "linear-gradient(180deg, var(--paper) 0%, var(--iris-tint) 100%)",
            borderColor: low ? "oklch(88% 0.05 55)" : "oklch(90% 0.02 290)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">
              Smart wallet · Arc
            </div>
            <div className="chip bg-paper/70 ink-2 border border-line">✦ SILENT</div>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-[13px] font-mono ink-3">USDC</span>
            <span className="font-mono text-[56px] font-medium ink tabular-nums leading-none tracking-tight">
              {bal.toFixed(4)}
            </span>
          </div>

          {low ? (
            <div className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: "oklch(45% 0.14 40)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
              Low balance — top up keeps Gemini responsive on your next drive.
            </div>
          ) : (
            <div className="mt-3 text-[12px] ink-3">
              ≈ {Math.floor(bal / 0.0005).toLocaleString()} route queries · {Math.floor(bal / 0.0001).toLocaleString()} agent tool calls
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 pt-4 border-t" style={{ borderColor: "oklch(92% 0.01 290)" }}>
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: "conic-gradient(from 180deg, var(--teal), var(--iris), var(--teal))" }}
            />
            <div className="flex-1">
              <div className="text-[11px] ink-3">{wallet.mode === "circle" ? "Managed account" : "MetaMask"}</div>
              <div className="font-mono text-[11px] ink">
                {wallet.address ? wallet.address.slice(0, 6) + "…" + wallet.address.slice(-4) : "…"}
              </div>
            </div>
            <div className="text-[10px] font-mono ink-3">ARC · TESTNET</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-2 px-1">
            {low ? "Top up · recommended 10.00" : "Top up"}
          </div>
          <div className="flex gap-2">
            <TopUpChip amount="5.00" />
            <TopUpChip amount="10.00" popular />
            <TopUpChip amount="25.00" />
            <TopUpChip amount="Custom" />
          </div>
          <div className="text-[10px] font-mono ink-3 mt-2 text-center">
            Send USDC to your address · or faucet on Arc testnet
          </div>
        </div>

        <div className="mt-5 bg-paper border border-line rounded-[22px] px-4 py-3">
          <div className="flex items-center justify-between pb-2">
            <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">Recent</div>
            <div className="flex items-center gap-1 text-[10px] font-mono ink-3">
              <MicroSpark values={[3, 4, 2, 5, 7, 4, 6]} /> 7d
            </div>
          </div>
          {ledger.map((row, i) => (
            <LedgerRow key={i} {...row} />
          ))}
        </div>

        <Link
          href="/activity"
          className="mt-4 block text-center text-[12px] font-mono ink-3 py-3 rounded-full bg-paper border border-line hover:bg-ivory-2 transition-colors"
        >
          View all activity →
        </Link>

        <button
          onClick={wallet.disconnect}
          className="mt-3 block w-full text-center text-[11px] font-mono ink-3 py-2 hover:ink-2"
        >
          Sign out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function fallbackLedger(): LedgerEntry[] {
  return [
    { when: "18:42", label: "Route · Sultanahmet",         kind: "query", amount: "0.0005", hash: "0x4e…a1" },
    { when: "18:41", label: "Agent tool · IBB traffic",    kind: "agent", amount: "0.0001", hash: "0x4e…9f" },
    { when: "18:41", label: "Agent tool · ISPARK",         kind: "agent", amount: "0.0001", hash: "0x4e…9c" },
    { when: "18:40", label: "Agent tool · Weather",        kind: "agent", amount: "0.0001", hash: "0x4e…97" },
    { when: "09:12", label: "Top up",                      kind: "topup", amount: "5.0000", hash: "0x1b…c3" },
  ];
}
