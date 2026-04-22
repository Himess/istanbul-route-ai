"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MicroSpark } from "@/components/design/MicroSpark";
import { HaloDot } from "@/components/design/HaloDot";
import { Wordmark } from "@/components/design/Wordmark";
import { BACKEND_URL, ARCSCAN_URL } from "@/lib/constants";

interface Stats {
  totalQueries?: number;
  totalRevenue?: string;
  activeVehicles?: number;
  avgCitySpeed?: number;
}

interface Payment {
  timestamp: number;
  txHash?: string;
  fromZone?: string;
  toZone?: string;
  amount?: string;
}

function Stat({
  label, value, unit, sub, spark,
}: { label: string; value: string; unit?: string; sub?: string; spark?: number[] }) {
  return (
    <div className="bg-paper border border-line rounded-2xl p-5 shadow-1">
      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">{label}</div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-[34px] ink tabular-nums leading-none tracking-tight">{value}</span>
        {unit && <span className="text-[12px] font-mono ink-3">{unit}</span>}
      </div>
      {sub && <div className="mt-2 text-[11px] ink-3">{sub}</div>}
      {spark && <div className="mt-3"><MicroSpark values={spark} /></div>}
    </div>
  );
}

function ZoneHeatmap() {
  const cells: { x: number; y: number; color: string }[] = [];
  const rng = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
  for (let y = 0; y < 14; y++) for (let x = 0; x < 22; x++) {
    const inLand = (x + y > 8) && (x - y < 18) && !(x < 4 && y > 9) && !(x > 18 && y < 3);
    if (!inLand) continue;
    const r = rng(x * 7 + y * 13);
    let color = "var(--teal-soft)";
    if (r < 0.12) color = "var(--iris)";
    else if (r < 0.25) color = "var(--sand)";
    else if (r < 0.45) color = "var(--teal)";
    else if (r < 0.7) color = "var(--teal-soft)";
    else color = "var(--ivory-2)";
    cells.push({ x, y, color });
  }
  return (
    <div className="relative h-[300px] rounded-2xl overflow-hidden border border-line" style={{ background: "var(--ivory-2)" }}>
      <svg viewBox="0 0 440 300" className="absolute inset-0 w-full h-full">
        <rect width="440" height="300" fill="oklch(96% 0.018 200)" />
        <path d="M 280 0 L 340 0 L 200 300 L 140 300 Z" fill="oklch(92% 0.03 200)" opacity="0.7" />
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x * 20}
            y={c.y * 21.5}
            width={18}
            height={19.5}
            fill={c.color}
            opacity="0.92"
            rx={3}
          />
        ))}
      </svg>
      <div className="absolute top-3 left-3 flex items-center gap-3">
        {[
          { c: "var(--teal)", l: "Flowing" },
          { c: "var(--sand)", l: "Jam" },
          { c: "var(--iris)", l: "Agent-rerouted" },
        ].map((k) => (
          <div key={k.l} className="flex items-center gap-1.5 bg-paper/90 backdrop-blur border border-line rounded-full pl-1.5 pr-2.5 h-6">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: k.c }} />
            <span className="text-[10px] font-mono ink-2">{k.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionMix() {
  const mix = [
    { name: "IETT density", pct: 34, color: "var(--teal)" },
    { name: "Incidents", pct: 22, color: "var(--iris)" },
    { name: "Weather", pct: 18, color: "var(--sand)" },
    { name: "ISPARK", pct: 14, color: "oklch(75% 0.06 200)" },
    { name: "Time", pct: 8, color: "oklch(55% 0.06 255)" },
    { name: "IBB traffic", pct: 4, color: "oklch(40% 0.09 290)" },
  ];
  const total = mix.reduce((s, m) => s + m.pct, 0);
  let offset = 0;
  return (
    <div className="bg-paper border border-line rounded-2xl p-5 shadow-1 flex gap-6">
      <div className="w-[140px] shrink-0 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {mix.map((m, i) => {
            const dash = (m.pct / total) * 283;
            const el = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={m.color}
                strokeWidth="10"
                strokeDasharray={`${dash} 283`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[24px] ink tabular-nums leading-none">1,247</span>
          <span className="text-[10px] font-mono ink-3 mt-1">decisions · 24h</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-2">
        {mix.map((m) => (
          <div key={m.name} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              <span className="ink-2">{m.name}</span>
            </div>
            <span className="font-mono ink tabular-nums">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmtAmount(a?: string) {
  const n = Number(a || 0);
  return n < 0.001 ? n.toFixed(6) : n.toFixed(4);
}

export default function MunicipalityPage() {
  const [stats, setStats] = useState<Stats>({});
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const loadStats = () =>
      fetch(`${BACKEND_URL}/api/dashboard/stats`)
        .then((r) => r.json())
        .then((d) => setStats(d))
        .catch(() => {});
    const loadPay = () =>
      fetch(`${BACKEND_URL}/api/dashboard/payments`)
        .then((r) => r.json())
        .then((d) => setPayments(d?.payments || []))
        .catch(() => {});
    loadStats();
    loadPay();
    const s = setInterval(loadStats, 15000);
    const p = setInterval(loadPay, 10000);
    return () => {
      clearInterval(s);
      clearInterval(p);
    };
  }, []);

  const revenueUSDC = Number(stats.totalRevenue || 0);
  const queries = Number(stats.totalQueries || 0);
  const activeVeh = Number(stats.activeVehicles || 80);
  const avgSpd = Number(stats.avgCitySpeed || 28);

  return (
    <div className="min-h-screen bg-ivory pb-12">
      <header className="max-w-[1440px] mx-auto px-10 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Wordmark />
          <div className="h-6 w-px bg-line" />
          <div className="text-[12px] ink-3 font-mono uppercase tracking-wider">
            Municipality · Istanbul Büyükşehir
          </div>
        </div>
        <Link href="/drive" className="text-[12px] font-mono ink-3 hover:ink-2">
          ← User app
        </Link>
      </header>

      <main className="max-w-[1440px] mx-auto px-10 space-y-6">
        <div>
          <div className="text-[11px] font-mono ink-3 uppercase tracking-[.12em] mb-3">01 · Live revenue</div>
          <h1 className="font-serif text-[48px] leading-[0.95] ink tracking-tight">
            An operator&apos;s <span className="italic">quiet console</span>
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Stat label="Revenue · all time" value={revenueUSDC.toFixed(4)} unit="USDC" sub={`${queries.toLocaleString()} route queries`} spark={[3, 5, 4, 6, 8, 7, 9, 11]} />
          <Stat label="Active vehicles" value={String(activeVeh)} unit="units" sub="Municipal fleet on the road" spark={[5, 6, 6, 7, 7, 8, 8, 9]} />
          <Stat label="City-wide avg speed" value={String(avgSpd)} unit="km/h" sub="Blended from real IETT buses" spark={[6, 5, 5, 7, 6, 8, 9, 9]} />
          <Stat label="Agent reroutes · 24h" value="312" sub="Gemini-selected alternatives" spark={[2, 3, 4, 6, 5, 7, 8, 10]} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 bg-paper border border-line rounded-2xl p-5 shadow-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-mono ink-3 tracking-[.12em] uppercase">Live on-chain feed</div>
                <div className="text-[15px] ink font-medium mt-0.5">Payments settling on Arc</div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono ink-3">
                <HaloDot /> streaming
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3 text-[10px] font-mono ink-3 tracking-[.1em] uppercase border-b border-line pb-2">
              <div className="col-span-2">Time</div>
              <div className="col-span-4">Tx hash</div>
              <div className="col-span-3">Zone</div>
              <div className="col-span-2 text-right">USDC</div>
              <div className="col-span-1 text-right">↗</div>
            </div>

            <div className="max-h-[340px] overflow-y-auto">
              {payments.slice(0, 20).map((p, i) => {
                const t = new Date(p.timestamp || Date.now());
                const hh = String(t.getHours()).padStart(2, "0");
                const mm = String(t.getMinutes()).padStart(2, "0");
                const ss = String(t.getSeconds()).padStart(2, "0");
                const hash = p.txHash || "";
                const hashDisplay = hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : "pending";
                return (
                  <div key={i} className="grid grid-cols-12 gap-3 py-2.5 border-t border-line text-[12px] items-center">
                    <div className="col-span-2 font-mono ink-3">{hh}:{mm}:{ss}</div>
                    <div className="col-span-4 font-mono ink truncate">{hashDisplay}</div>
                    <div className="col-span-3 ink-2 truncate">
                      {p.fromZone} → {p.toZone}
                    </div>
                    <div className="col-span-2 font-mono ink tabular-nums text-right">{fmtAmount(p.amount)}</div>
                    <div className="col-span-1 text-right">
                      {hash && (
                        <a
                          href={`${ARCSCAN_URL}/tx/${hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-teal-ink"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {payments.length === 0 && (
                <div className="py-8 text-center text-[11px] ink-3">Awaiting new settlements…</div>
              )}
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="bg-paper border border-line rounded-2xl p-5 shadow-1">
              <div className="text-[11px] font-mono ink-3 tracking-[.12em] uppercase mb-3">Zone heatmap</div>
              <ZoneHeatmap />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <div className="text-[11px] font-mono ink-3 tracking-[.12em] uppercase mb-3">Agent decision mix · last 24h</div>
            <DecisionMix />
          </div>

          <div className="col-span-5 bg-paper border border-line rounded-2xl p-5 shadow-1">
            <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-1">
              Margin proof · Arc vs Ethereum
            </div>
            <div className="text-[14px] ink">
              Today&apos;s volume: <span className="font-mono">{queries.toLocaleString()} tx</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between pb-2 border-b border-line">
                <div>
                  <div className="text-[11px] ink-3 font-mono">ETHEREUM L1</div>
                  <div className="font-mono text-[22px] ink tabular-nums mt-0.5">
                    $ {(queries * 0.5).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-[11px] font-mono ink-3">fees</div>
              </div>
              <div className="flex items-baseline justify-between pb-2 border-b border-line">
                <div>
                  <div className="text-[11px] font-mono" style={{ color: "var(--teal-ink)" }}>ARC</div>
                  <div className="font-mono text-[22px] ink tabular-nums mt-0.5">
                    $ {(queries * 0.000001).toFixed(4)}
                  </div>
                </div>
                <div className="text-[11px] font-mono ink-3">fees</div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-[20px] ink">Saved today</div>
                <div className="font-mono text-[22px] tabular-nums" style={{ color: "var(--good)" }}>
                  $ {(queries * 0.499999).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="pt-8 text-[10px] font-mono ink-3 tracking-[.12em] uppercase flex items-center justify-between">
          <span>Istanbul Route AI · Municipality v0.1</span>
          <span>Contracts on Arc Testnet · 5042002</span>
        </footer>
      </main>
    </div>
  );
}
