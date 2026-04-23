"use client";

import type { ComponentType } from "react";

/* ─────────────────── Reusable atoms ─────────────────── */

function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background:
            "conic-gradient(from 210deg, oklch(60% 0.09 200), oklch(65% 0.1 290), oklch(60% 0.09 200))",
        }}
      >
        <div
          className="rounded-full bg-paper flex items-center justify-center"
          style={{ width: size * 0.95, height: size * 0.95 }}
        >
          <div
            className="rounded-full"
            style={{ width: size * 0.4, height: size * 0.4, background: "var(--teal)" }}
          />
        </div>
      </div>
      <div className="leading-none">
        <div className="font-semibold ink tracking-tight" style={{ fontSize: size * 0.65 }}>
          Istanbul
        </div>
        <div
          className="font-mono ink-3 tracking-[.15em] -mt-[1px]"
          style={{ fontSize: size * 0.42 }}
        >
          ROUTE · AI
        </div>
      </div>
    </div>
  );
}

function SlideShell({
  label,
  children,
  background,
}: {
  label?: string;
  children: React.ReactNode;
  background?: string;
}) {
  return (
    <div
      className="absolute inset-0 p-14 flex flex-col"
      style={{ background: background || "transparent" }}
    >
      {label && (
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase mb-4">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

function SignalBadge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium"
      style={{
        borderColor: "oklch(88% 0.04 290)",
        background: "var(--iris-tint)",
        color: "var(--iris-ink)",
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

function HaloDot() {
  return (
    <span className="relative inline-flex w-2.5 h-2.5 items-center justify-center">
      <span className="absolute inset-0 rounded-full" style={{ background: "var(--iris)" }} />
    </span>
  );
}

/* ─────────────────── SLIDES ─────────────────── */

const Slide01: ComponentType = () => (
  <SlideShell label="Circle Nanopayments Hackathon · 2026">
    <div className="flex-1 flex flex-col justify-center">
      <div className="mb-6">
        <Wordmark size={30} />
      </div>
      <h1 className="font-serif text-[84px] leading-[0.95] ink tracking-tight max-w-[900px]">
        Silent Gemini agent. <span className="italic">USDC</span> pays in whispers.
      </h1>
      <p className="mt-6 text-[18px] ink-2 max-w-[720px] leading-relaxed">
        A luxury-concierge navigation app where an invisible Gemini agent picks routes using
        real-time municipal telemetry. Every tool call is a sub-cent USDC settlement on Arc.
      </p>
    </div>
    <div className="flex items-end justify-between">
      <div className="flex gap-6 text-[12px] font-mono ink-3 tracking-[.1em] uppercase">
        <div>Per-API Monetization</div>
        <div>·</div>
        <div>Agent Payment Loop</div>
        <div>·</div>
        <div>Google Prize Track</div>
      </div>
      <div className="text-right">
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">Live</div>
        <div className="font-mono text-[14px] ink">istanbul-route-ai.vercel.app</div>
      </div>
    </div>
  </SlideShell>
);

const Slide02: ComponentType = () => (
  <SlideShell label="01 · The Problem">
    <div className="flex-1 grid grid-cols-2 gap-10 items-center">
      <div>
        <h2 className="font-serif text-[56px] leading-[1.0] ink tracking-tight">
          Navigation updates traffic <span className="italic">every few minutes.</span>
        </h2>
        <p className="mt-4 text-[15px] ink-3 leading-relaxed max-w-[440px]">
          Using aggregated phone data — averaged, lagged, crowd-sourced. A driver stuck in
          a jam learns about it after they&apos;re already stuck.
        </p>
      </div>
      <div
        className="rounded-[24px] p-8 border"
        style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}
      >
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase mb-3">
          Meanwhile on Istanbul&apos;s streets
        </div>
        <div className="font-mono text-[88px] ink leading-none tracking-tight tabular-nums">
          40,000
        </div>
        <div className="mt-2 text-[14px] ink-2">
          municipal vehicles producing <span className="font-medium">ground-truth</span>{" "}
          speed data every second.
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-mono ink-3 tracking-[.14em] uppercase px-3 py-1 rounded-full border border-line bg-paper">
          <span style={{ color: "var(--danger)" }}>●</span> That data is being wasted
        </div>
      </div>
    </div>
  </SlideShell>
);

const Slide03: ComponentType = () => {
  const cards = [
    { emoji: "🚌", label: "IETT Bus", ctx: "Barbaros Blvd · 8 km/h", sub: "Corridor jammed. Confirmed." },
    { emoji: "🚛", label: "Garbage truck", ctx: "Kadıköy · 20 min/2 km", sub: "Secondary route also jammed." },
    { emoji: "🚑", label: "Ambulance", ctx: "Bridge corridor · 64 km/h", sub: "Emergency prefers the bridge." },
  ];
  return (
    <SlideShell label="02 · The insight">
      <div>
        <h2 className="font-serif text-[56px] leading-[1.0] ink tracking-tight max-w-[800px]">
          Municipal fleet telemetry is a <span className="italic">goldmine.</span>
        </h2>
        <p className="mt-3 text-[15px] ink-3 max-w-[620px]">
          Already collected. Already accurate. Second-by-second. Sitting unused in city servers.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-5 flex-1">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[22px] bg-paper border border-line p-6 flex flex-col shadow-2">
            <div className="text-[36px]">{c.emoji}</div>
            <div className="mt-2 text-[11px] font-mono ink-3 tracking-[.14em] uppercase">
              {c.label}
            </div>
            <div className="font-mono text-[22px] ink tabular-nums mt-1">{c.ctx}</div>
            <div className="mt-auto pt-4 text-[13px] ink-2">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-[13px] ink-2">
        <span className="font-medium">Ground truth</span> is better than averaged phone data —
        if only someone would buy it.
      </div>
    </SlideShell>
  );
};

const Slide04: ComponentType = () => (
  <SlideShell label="03 · The solution">
    <div className="flex-1 grid grid-cols-5 gap-10 items-center">
      <div className="col-span-3">
        <h2 className="font-serif text-[60px] leading-[1.0] ink tracking-tight">
          Silent Gemini agent + <span className="italic">x402 paywall</span> on that fleet.
        </h2>
        <p className="mt-5 text-[16px] ink-2 leading-relaxed max-w-[560px]">
          User taps a destination. A Gemini 3 Flash agent queries six real-time data tools —
          each an on-chain USDC micropayment. Returns the better route, with a rationale.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-[520px]">
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="text-[10px] font-mono ink-3 tracking-[.14em] uppercase">Route query</div>
            <div className="font-mono text-[24px] ink mt-1 tabular-nums">$0.0005</div>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="text-[10px] font-mono ink-3 tracking-[.14em] uppercase">Per agent tool</div>
            <div className="font-mono text-[24px] ink mt-1 tabular-nums">$0.0001</div>
          </div>
        </div>
        <div className="mt-4 text-[12px] ink-3 font-mono">
          Settles on Arc in ~1 second. Zero popups after setup. Zero gas.
        </div>
      </div>
      <div className="col-span-2 flex flex-col items-center gap-3">
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">Six signals, one answer</div>
        <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
          <SignalBadge emoji="📊" label="IBB Traffic" />
          <SignalBadge emoji="🚌" label="IETT Density" />
          <SignalBadge emoji="🚧" label="Incidents" />
          <SignalBadge emoji="🌧️" label="Weather" />
          <SignalBadge emoji="🅿️" label="ISPARK" />
          <SignalBadge emoji="⏰" label="Time context" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-mono ink-3">
          <HaloDot /> Gemini Function Calling
        </div>
      </div>
    </div>
  </SlideShell>
);

const Slide05: ComponentType = () => {
  const steps = [
    { n: 1, t: "User signs route request", d: "One EIP-3009 typed-data payload via Circle Gateway. No gas, no popup after setup." },
    { n: 2, t: "OSRM returns 3 candidate routes", d: "Real road-network alternatives, not heuristics." },
    { n: 3, t: "Gemini decides which signals matter", d: "Adaptively calls 3–6 tools from the library. Skips cheap-lookup cases." },
    { n: 4, t: "Each tool call settles on Arc", d: "$0.0001 USDC transfer → municipality treasury. One tx per tool." },
    { n: 5, t: "Agent submits final choice", d: "Chosen route + rationale + signalsUsed, returned to the phone." },
    { n: 6, t: "User navigates; wallet ticks down", d: "Silent debit animation. Receipt in the Card tab." },
  ];
  return (
    <SlideShell label="04 · How it works">
      <h2 className="font-serif text-[50px] leading-[1.0] ink tracking-tight mb-8">
        The silent <span className="italic">agent loop.</span>
      </h2>
      <div className="grid grid-cols-2 gap-x-10 gap-y-4 flex-1">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-[14px] font-semibold flex-none"
              style={{ background: "var(--teal-soft)", color: "var(--teal-ink)" }}
            >
              {s.n}
            </div>
            <div>
              <div className="text-[16px] font-medium ink">{s.t}</div>
              <div className="text-[13px] ink-3 mt-0.5 leading-relaxed">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl p-4 border text-center" style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}>
        <span className="text-[13px]" style={{ color: "var(--iris-ink)" }}>
          Typical query: <strong>1 user payment + 4–6 agent settlements = 5–7 real on-chain tx.</strong>
        </span>
      </div>
    </SlideShell>
  );
};

const Slide06: ComponentType = () => (
  <SlideShell label="05 · Driver · /drive">
    <div className="flex-1 flex flex-col">
      <h2 className="font-serif text-[52px] leading-[1.0] ink tracking-tight">
        Mobile-first, <span className="italic">luxury-concierge</span> feel.
      </h2>
      <p className="mt-3 text-[15px] ink-3 max-w-[620px]">
        Apple Wallet crossed with Cash App. No crypto-bro aesthetics. No popups after first deposit.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-6 flex-1">
        {[
          { title: "Initial", line: "Saved places + map tap to drop a pin. Live vehicles in the background." },
          { title: "Unlock", line: "$0.0005 paid → agent thinks → rationale card appears with signals cited." },
          { title: "Navigating", line: "Camera locked, bearing follows route. Turn banner up top, silent debits per tool call." },
        ].map((s, i) => (
          <div key={s.title} className="rounded-[22px] border border-line bg-paper p-5 flex flex-col">
            <div className="text-[10px] font-mono ink-3 tracking-[.14em] uppercase">
              Phase {String.fromCharCode(65 + i)}
            </div>
            <div className="font-serif text-[26px] ink leading-tight mt-1">{s.title}</div>
            <div
              className="mt-3 flex-1 rounded-2xl border border-line flex items-center justify-center text-[11px] ink-3"
              style={{
                background:
                  i === 0
                    ? "linear-gradient(180deg, var(--ivory) 0%, var(--teal-tint) 100%)"
                    : i === 1
                    ? "linear-gradient(180deg, var(--ivory) 0%, var(--iris-tint) 100%)"
                    : "linear-gradient(180deg, var(--ivory) 0%, var(--sand-tint) 100%)",
              }}
            >
              <div className="text-center">
                <div className="text-[30px]">
                  {i === 0 ? "📍" : i === 1 ? "✦" : "🧭"}
                </div>
                <div className="mt-2 text-[11px] font-mono ink-3">
                  {i === 0 ? "Drop pin" : i === 1 ? "Gemini picks" : "Drive"}
                </div>
              </div>
            </div>
            <div className="mt-4 text-[12px] ink-2 leading-snug">{s.line}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

const Slide07: ComponentType = () => (
  <SlideShell label="06 · Municipality · /municipality">
    <div className="flex-1 grid grid-cols-5 gap-10 items-center">
      <div className="col-span-2">
        <h2 className="font-serif text-[52px] leading-[1.0] ink tracking-tight">
          The data now <span className="italic">sells itself.</span>
        </h2>
        <p className="mt-4 text-[14px] ink-3 leading-relaxed max-w-[400px]">
          A quiet console for IBB operators. Live revenue, on-chain feed, zone heatmap, agent
          decision mix. All from real Circle Gateway settlements on Arc.
        </p>
        <ul className="mt-6 space-y-2 text-[13px] ink-2">
          <li>· Revenue ticker · seeded from Arc events</li>
          <li>· Streaming on-chain payments · every tx with ArcScan link</li>
          <li>· Zone heatmap · IBB + IETT live speeds blended</li>
          <li>· Agent decision mix · signals cited in last 24h</li>
          <li>· Margin proof card · Arc vs Ethereum at volume</li>
        </ul>
      </div>
      <div className="col-span-3">
        <div className="rounded-[24px] border border-line shadow-3 bg-paper overflow-hidden">
          <div className="p-5 border-b border-line flex items-center justify-between">
            <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">
              Live on-chain feed
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono ink-3">
              <HaloDot /> streaming
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { hash: "0xa495…3d3d", zone: "Taksim → Kadıköy", usdc: "0.000100" },
              { hash: "0x3c54…4529", zone: "Şişli → Levent", usdc: "0.000100" },
              { hash: "0x4d87…64ba", zone: "Eminönü → Kadıköy", usdc: "0.000100" },
              { hash: "0xd0f8…0d08", zone: "Fatih → Beşiktaş", usdc: "0.000500" },
              { hash: "0x8e36…20c4", zone: "Bakırköy → Beşiktaş", usdc: "0.000100" },
            ].map((r) => (
              <div key={r.hash} className="flex items-center justify-between text-[12px]">
                <span className="font-mono ink-3">{r.hash}</span>
                <span className="ink-2">{r.zone}</span>
                <span className="font-mono ink tabular-nums">{r.usdc} USDC</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 text-right text-[10px] font-mono ink-3">
          istanbul-route-ai.vercel.app/municipality
        </div>
      </div>
    </div>
  </SlideShell>
);

const Slide08: ComponentType = () => {
  const nodes = [
    { t: "Driver pays", s: "saves 7 min · home earlier", x: 50, y: 8, emoji: "🏎️" },
    { t: "Municipality earns", s: "revenue from $0-cost data", x: 88, y: 35, emoji: "💰" },
    { t: "Traffic distributes", s: "buses faster · ambulances arrive sooner", x: 78, y: 80, emoji: "🚦" },
    { t: "Pollution drops", s: "less fuel · less imports", x: 22, y: 80, emoji: "☁️" },
    { t: "Planning improves", s: "payment data reveals real pain points", x: 12, y: 35, emoji: "📊" },
  ];
  return (
    <SlideShell label="07 · The flywheel">
      <h2 className="font-serif text-[50px] leading-[1.0] ink tracking-tight max-w-[800px] mb-2">
        Five-way <span className="italic">positive-sum.</span>
      </h2>
      <div className="relative flex-1">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="36" fill="none" stroke="oklch(92% 0.006 255)" strokeWidth="0.25" strokeDasharray="0.5 0.8" />
        </svg>
        {nodes.map((n) => (
          <div
            key={n.t}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[220px]"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="rounded-2xl border border-line bg-paper p-4 shadow-2">
              <div className="text-[24px]">{n.emoji}</div>
              <div className="mt-1 text-[14px] font-medium ink">{n.t}</div>
              <div className="text-[11px] ink-3 mt-0.5">{n.s}</div>
            </div>
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div
            className="w-28 h-28 rounded-full mx-auto flex items-center justify-center"
            style={{
              background: "conic-gradient(from 0deg, var(--teal), var(--iris), var(--sand), var(--teal))",
            }}
          >
            <div className="w-24 h-24 rounded-full bg-paper flex items-center justify-center">
              <div className="text-center">
                <div className="font-mono text-[11px] ink-3 tracking-[.14em]">ARC</div>
                <div className="font-mono text-[16px] ink">USDC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
};

const Slide09: ComponentType = () => (
  <SlideShell label="08 · Economic proof">
    <h2 className="font-serif text-[52px] leading-[1.0] ink tracking-tight max-w-[900px] mb-10">
      Why this can&apos;t run <span className="italic">on Ethereum.</span>
    </h2>
    <div className="flex-1 grid grid-cols-2 gap-8">
      <div className="rounded-[22px] border border-line p-7" style={{ background: "oklch(98% 0.02 30)" }}>
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">Ethereum L1</div>
        <div className="font-mono text-[60px] ink tabular-nums mt-2">$0.50</div>
        <div className="text-[12px] font-mono ink-3">gas per tx</div>
        <div className="mt-6 pt-4 border-t border-line space-y-2 text-[13px]">
          <div className="flex justify-between"><span className="ink-2">Route query (5 settlements)</span><span className="font-mono ink">$2.50 gas</span></div>
          <div className="flex justify-between"><span className="ink-2">Service fee collected</span><span className="font-mono ink">$0.0005</span></div>
          <div className="flex justify-between pt-2 border-t border-line"><span className="ink font-medium">Margin</span><span className="font-mono font-semibold" style={{ color: "var(--danger)" }}>−$2.4995</span></div>
        </div>
        <div className="mt-6 text-[12px] ink-3 italic">
          The model dies in the gas fee.
        </div>
      </div>
      <div className="rounded-[22px] border p-7" style={{ background: "var(--teal-tint)", borderColor: "oklch(85% 0.04 200)" }}>
        <div className="text-[11px] font-mono tracking-[.14em] uppercase" style={{ color: "var(--teal-ink)" }}>Arc + Nanopayments</div>
        <div className="font-mono text-[60px] ink tabular-nums mt-2">$0.000001</div>
        <div className="text-[12px] font-mono ink-3">gas per tx</div>
        <div className="mt-6 pt-4 border-t border-line space-y-2 text-[13px]">
          <div className="flex justify-between"><span className="ink-2">Route query (5 settlements)</span><span className="font-mono ink">$0.000005 gas</span></div>
          <div className="flex justify-between"><span className="ink-2">Service fee collected</span><span className="font-mono ink">$0.0005</span></div>
          <div className="flex justify-between pt-2 border-t border-line"><span className="ink font-medium">Margin</span><span className="font-mono font-semibold" style={{ color: "var(--good)" }}>+$0.000495</span></div>
        </div>
        <div className="mt-6 text-[12px] font-medium" style={{ color: "var(--teal-ink)" }}>
          10,000× cheaper. The agentic economy breathes.
        </div>
      </div>
    </div>
  </SlideShell>
);

const Slide10: ComponentType = () => (
  <SlideShell label="09 · On-chain proof">
    <div className="flex items-start justify-between mb-8">
      <h2 className="font-serif text-[56px] leading-[1.0] ink tracking-tight max-w-[700px]">
        71 real transactions on Arc <span className="italic">Testnet.</span>
      </h2>
      <div className="text-right">
        <div className="font-mono text-[72px] ink tabular-nums leading-none">71</div>
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase mt-1">Threshold · 50</div>
      </div>
    </div>
    <div className="flex-1 grid grid-cols-4 gap-3">
      {[
        { k: "ERC20 transfer", v: "1", d: "Fund demo user · 2.0 USDC" },
        { k: "Gas top-ups", v: "2", d: "Arc gas for setup" },
        { k: "USDC approve", v: "1", d: "Allow Gateway to spend" },
        { k: "Gateway deposit", v: "1", d: "2.0 USDC → Gateway balance" },
        { k: "Agent tool settlements", v: "66", d: "6 signals × multiple rounds" },
      ].map((c) => (
        <div key={c.k} className={`rounded-2xl border border-line bg-paper p-5 ${c.k === "Agent tool settlements" ? "col-span-4 md:col-span-2" : ""}`}>
          <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">{c.k}</div>
          <div className="font-mono text-[40px] ink tabular-nums mt-1">{c.v}</div>
          <div className="text-[12px] ink-3 mt-1">{c.d}</div>
        </div>
      ))}
    </div>
    <div className="mt-6 flex items-center justify-between text-[12px]">
      <div className="ink-3 font-mono">
        Every hash verifiable at testnet.arcscan.app
      </div>
      <div className="ink-2">
        Reproducible: <span className="font-mono">scripts/replayAgentSettlements.ts</span>
      </div>
    </div>
  </SlideShell>
);

const Slide11: ComponentType = () => {
  const products = [
    { name: "Arc", role: "Settlement layer · chainId 5042002" },
    { name: "USDC", role: "Native + ERC20 (0x3600…)" },
    { name: "Circle Nanopayments", role: "@circle-fin/x402-batching" },
    { name: "Circle Gateway", role: "Pre-loaded balance · silent x402 debit" },
    { name: "Circle Programmable Wallets", role: "Managed-account onboarding" },
    { name: "x402 Protocol", role: "HTTP-native 402 Payment Required" },
  ];
  return (
    <SlideShell label="10 · Circle stack">
      <h2 className="font-serif text-[52px] leading-[1.0] ink tracking-tight mb-8">
        Full <span className="italic">Circle stack.</span>
      </h2>
      <div className="flex-1 grid grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.name} className="rounded-2xl border border-line bg-paper p-5 flex items-center gap-4 shadow-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--teal-tint)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <div className="text-[16px] font-medium ink">{p.name}</div>
              <div className="text-[12px] ink-3 font-mono">{p.role}</div>
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
};

const Slide12: ComponentType = () => {
  const items = [
    { emoji: "🤖", t: "Gemini 2.5/3 Flash", d: "Function Calling · 6 tools" },
    { emoji: "🏛️", t: "İBB Open Data", d: "Real traffic congestion index" },
    { emoji: "🚌", t: "İETT Live", d: "Real-time municipal bus positions" },
    { emoji: "🅿️", t: "ISPARK", d: "262+ lots · live occupancy" },
    { emoji: "🌧️", t: "Open-Meteo", d: "Weather + driving impact" },
    { emoji: "🗺️", t: "OSRM", d: "3 route alternatives per query" },
  ];
  return (
    <SlideShell label="11 · Real data stack">
      <h2 className="font-serif text-[52px] leading-[1.0] ink tracking-tight mb-8">
        Powered by <span className="italic">Gemini</span> + <span className="italic">İstanbul.</span>
      </h2>
      <div className="flex-1 grid grid-cols-3 gap-4">
        {items.map((i) => (
          <div key={i.t} className="rounded-2xl border border-line bg-paper p-5 flex flex-col">
            <div className="text-[32px]">{i.emoji}</div>
            <div className="mt-2 text-[16px] font-medium ink">{i.t}</div>
            <div className="text-[12px] ink-3 mt-0.5">{i.d}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-[13px] ink-3">
        No mocks. Real city telemetry × AI reasoning × on-chain settlement.
      </div>
    </SlideShell>
  );
};

const Slide13: ComponentType = () => (
  <SlideShell label="12 · Transaction flow (required demo)">
    <h2 className="font-serif text-[48px] leading-[1.0] ink tracking-tight mb-8">
      End-to-end <span className="italic">verifiable.</span>
    </h2>
    <div className="flex-1 grid grid-cols-4 gap-4">
      {[
        { n: 1, t: "User signs EIP-3009", d: "TransferWithAuthorization on Gateway Wallet contract. No gas cost to user." },
        { n: 2, t: "Circle Gateway settles", d: "Backend middleware validates signature · routes settlement via Circle." },
        { n: 3, t: "Tx lands on Arc", d: "testnet.arcscan.app returns 200 Success · sub-second finality." },
        { n: 4, t: "Municipality receives USDC", d: "Treasury wallet sees the credit · dashboard feed updates live." },
      ].map((s) => (
        <div key={s.n} className="rounded-2xl border border-line bg-paper p-5 flex flex-col">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-[14px] font-semibold"
            style={{ background: "var(--teal-tint)", color: "var(--teal-ink)" }}
          >
            {s.n}
          </div>
          <div className="mt-3 text-[15px] font-medium ink">{s.t}</div>
          <div className="text-[12px] ink-3 mt-1 leading-snug">{s.d}</div>
        </div>
      ))}
    </div>
    <div className="mt-6 rounded-2xl p-4 border flex items-center justify-between" style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}>
      <div className="text-[13px]" style={{ color: "var(--iris-ink)" }}>
        Video shows: Circle Developer Console transfer detail → ArcScan tx receipt (200 Success).
      </div>
      <div className="text-[11px] font-mono ink-3">Hackathon requirement ✓</div>
    </div>
  </SlideShell>
);

const Slide14: ComponentType = () => (
  <SlideShell label="13 · Vision">
    <h2 className="font-serif text-[56px] leading-[1.0] ink tracking-tight max-w-[900px]">
      The data sells itself — <span className="italic">and then tells you how to fix the city.</span>
    </h2>
    <div className="mt-10 grid grid-cols-3 gap-4 flex-1">
      {[
        {
          q: "Which corridors do drivers pay most to avoid?",
          a: "→ Where infrastructure investment is needed",
        },
        {
          q: "Which hours generate the most queries?",
          a: "→ When public transit frequency should increase",
        },
        {
          q: "Which zones have the highest re-routing demand?",
          a: "→ Where traffic signals need optimization",
        },
      ].map((c, i) => (
        <div key={i} className="rounded-[22px] border border-line bg-paper p-6 flex flex-col">
          <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">
            Question {String(i + 1).padStart(2, "0")}
          </div>
          <div className="mt-3 text-[20px] ink font-medium leading-snug">{c.q}</div>
          <div className="mt-auto pt-4 text-[13px]" style={{ color: "var(--teal-ink)" }}>
            {c.a}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 text-center text-[14px] ink-2">
      <span className="font-medium">Data-driven urban planning</span>, funded by the citizens who benefit from it.
    </div>
  </SlideShell>
);

const Slide15: ComponentType = () => (
  <SlideShell label="14 · Try it now">
    <div className="flex-1 grid grid-cols-5 gap-10 items-center">
      <div className="col-span-3">
        <h2 className="font-serif text-[56px] leading-[1.0] ink tracking-tight">
          Live. Reproducible. <span className="italic">Public.</span>
        </h2>
        <div className="mt-8 space-y-3 font-mono text-[14px]">
          <div className="flex items-center gap-3">
            <span className="ink-3 w-[90px]">APP</span>
            <span className="ink">istanbul-route-ai.vercel.app</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ink-3 w-[90px]">MUNICIPALITY</span>
            <span className="ink">/municipality</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ink-3 w-[90px]">BACKEND</span>
            <span className="ink">istanbul-route-ai-backend.fly.dev</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ink-3 w-[90px]">GITHUB</span>
            <span className="ink">github.com/Himess/istanbul-route-ai</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ink-3 w-[90px]">TX PROOF</span>
            <span className="ink">TX_PROOF.md · 71 tx on Arc</span>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-paper p-4 text-[12px] ink-2 max-w-[540px]">
          <span className="font-medium ink">For judges:</span> clone the repo, run
          {" "}
          <span className="font-mono">scripts/replayAgentSettlements.ts</span>{" "}
          against our Fly backend to reproduce 66 verifiable on-chain settlements in ~90 seconds.
        </div>
      </div>
      <div className="col-span-2 flex flex-col items-center gap-4">
        <div className="w-[260px] h-[260px] rounded-3xl bg-paper border border-line shadow-3 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="font-serif text-[28px] ink leading-none">QR</div>
            <div className="mt-2 text-[10px] font-mono ink-3 tracking-[.14em] uppercase">
              istanbul-route-ai.vercel.app
            </div>
            <div className="mt-6 text-[10px] font-mono ink-3">(generate via qr-code.com)</div>
          </div>
        </div>
        <div className="text-[11px] font-mono ink-3 tracking-[.14em] uppercase">Scan with phone</div>
      </div>
    </div>
  </SlideShell>
);

const Slide16: ComponentType = () => (
  <SlideShell>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <Wordmark size={32} />
      <h1 className="mt-10 font-serif text-[80px] leading-[0.95] ink tracking-tight max-w-[1000px]">
        40,000 wasted sensors. <span className="italic">One agent.</span> One USDC.
      </h1>
      <p className="mt-6 text-[16px] ink-2 max-w-[640px] leading-relaxed">
        Built for Circle Nanopayments Hackathon. With Circle Gateway + Nanopayments + x402
        + Arc + Gemini Function Calling. In İstanbul, for every city.
      </p>
      <div className="mt-12 flex items-center gap-6 text-[12px] font-mono ink-3 tracking-[.14em] uppercase">
        <div>Per-API Monetization</div>
        <div>·</div>
        <div>Agent Payment Loop</div>
        <div>·</div>
        <div>Google Prize Track</div>
      </div>
    </div>
    <div className="flex items-end justify-between text-[11px] font-mono ink-3">
      <span>Thank you.</span>
      <span>github.com/Himess/istanbul-route-ai</span>
    </div>
  </SlideShell>
);

/* ─────────────────── Export ─────────────────── */

export const SLIDES = [
  { label: "Cover", render: Slide01 },
  { label: "Problem", render: Slide02 },
  { label: "Insight", render: Slide03 },
  { label: "Solution", render: Slide04 },
  { label: "How it works", render: Slide05 },
  { label: "Driver", render: Slide06 },
  { label: "Municipality", render: Slide07 },
  { label: "Flywheel", render: Slide08 },
  { label: "Economic proof", render: Slide09 },
  { label: "On-chain proof", render: Slide10 },
  { label: "Circle stack", render: Slide11 },
  { label: "Data stack", render: Slide12 },
  { label: "Tx flow", render: Slide13 },
  { label: "Vision", render: Slide14 },
  { label: "Try it", render: Slide15 },
  { label: "Thanks", render: Slide16 },
];
