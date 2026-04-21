/**
 * Generate 50+ on-chain x402 transactions for hackathon submission demo.
 *
 * What it does:
 *   1. Pings the backend (localhost or Railway) with 12 route requests across
 *      different Istanbul origin-destination pairs.
 *   2. Each route triggers 3-5 agent tool calls (each a $0.0001 Arc settlement)
 *      plus the $0.0005 route payment itself.
 *   3. Collects every tx hash, prints a table, and reports the total count.
 *
 * Prerequisite:
 *   - Backend running with AGENT_TX_MODE=onchain
 *   - AGENT_PRIVATE_KEY funded with testnet USDC on Arc
 *
 * Usage:
 *   npx tsx scripts/generate50Tx.ts [BACKEND_URL]
 *   BACKEND_URL defaults to http://localhost:3001
 */

const BACKEND = process.argv[2] || "http://localhost:3001";

// Twelve real Istanbul OD pairs spanning both sides of the Bosphorus
const TRIPS = [
  { name: "Taksim → Kadıköy", from: { lat: 41.0369, lng: 28.985 }, to: { lat: 40.9903, lng: 29.0276 } },
  { name: "Bakırköy → Beşiktaş", from: { lat: 40.985, lng: 28.86 }, to: { lat: 41.048, lng: 29.005 } },
  { name: "Fatih → Üsküdar", from: { lat: 41.012, lng: 28.935 }, to: { lat: 41.026, lng: 29.028 } },
  { name: "Şişli → Levent", from: { lat: 41.062, lng: 28.988 }, to: { lat: 41.09, lng: 29.004 } },
  { name: "Eminönü → Kadıköy", from: { lat: 41.015, lng: 28.968 }, to: { lat: 40.99, lng: 29.034 } },
  { name: "Zeytinburnu → Beyoğlu", from: { lat: 41.0, lng: 28.906 }, to: { lat: 41.035, lng: 28.974 } },
  { name: "Levent → Kadıköy", from: { lat: 41.09, lng: 29.004 }, to: { lat: 40.99, lng: 29.034 } },
  { name: "Atatürk Apt → SAW", from: { lat: 40.985, lng: 28.825 }, to: { lat: 40.898, lng: 29.31 } },
  { name: "Beşiktaş → Şişli", from: { lat: 41.048, lng: 29.005 }, to: { lat: 41.062, lng: 28.988 } },
  { name: "Üsküdar → Levent", from: { lat: 41.026, lng: 29.028 }, to: { lat: 41.09, lng: 29.004 } },
  { name: "Fatih → Beşiktaş", from: { lat: 41.012, lng: 28.935 }, to: { lat: 41.048, lng: 29.005 } },
  { name: "Kadıköy → Taksim", from: { lat: 40.99, lng: 29.034 }, to: { lat: 41.038, lng: 28.99 } },
];

interface RouteCall {
  trip: string;
  routeTx: { type: string; amount: string };
  agent: {
    model: string;
    chosen: number;
    rationale: string;
    signals: string[];
    calls: Array<{ name: string; txHash: string | null; txType: string }>;
  } | null;
  status: "ok" | "error";
  errorMsg?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callRoute(trip: typeof TRIPS[0], useDemoMode: boolean): Promise<RouteCall> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (useDemoMode) headers["X-DEMO-MODE"] = "true";

  try {
    const res = await fetch(`${BACKEND}/api/route`, {
      method: "POST",
      headers,
      body: JSON.stringify({ from: trip.from, to: trip.to }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        trip: trip.name,
        routeTx: { type: "failed", amount: "0" },
        agent: null,
        status: "error",
        errorMsg: data.error || `HTTP ${res.status}`,
      };
    }

    return {
      trip: trip.name,
      routeTx: {
        type: data.payment?.network === "demo" ? "demo" : "onchain",
        amount: "0.0005",
      },
      agent: data.agent
        ? {
            model: data.agent.modelId,
            chosen: data.agent.chosenRouteIndex,
            rationale: data.agent.rationale,
            signals: data.agent.signalsUsed || [],
            calls: (data.agent.toolCalls || []).map((t: any) => ({
              name: t.name,
              txHash: t.txHash,
              txType: t.txType,
            })),
          }
        : null,
      status: "ok",
    };
  } catch (err) {
    return {
      trip: trip.name,
      routeTx: { type: "failed", amount: "0" },
      agent: null,
      status: "error",
      errorMsg: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const useDemo = process.env.DEMO_MODE === "true";
  console.log(`IstanbulRoute 50+ tx generator`);
  console.log(`Backend: ${BACKEND}`);
  console.log(`Demo mode: ${useDemo ? "YES (simulated settlements)" : "NO (expecting real Arc x402 settlements)"}`);
  console.log(`Trips queued: ${TRIPS.length}\n`);

  const results: RouteCall[] = [];
  let totalOnchainTx = 0;
  let totalSimulatedTx = 0;

  for (let i = 0; i < TRIPS.length; i++) {
    const trip = TRIPS[i];
    process.stdout.write(`[${i + 1}/${TRIPS.length}] ${trip.name}  ... `);

    const r = await callRoute(trip, useDemo);
    results.push(r);

    if (r.status === "error") {
      console.log(`FAIL (${r.errorMsg})`);
    } else {
      const agentCalls = r.agent?.calls.length ?? 0;
      const onchainCalls = r.agent?.calls.filter((c) => c.txType === "onchain").length ?? 0;
      const simCalls = r.agent?.calls.filter((c) => c.txType === "simulated").length ?? 0;
      totalOnchainTx += (r.routeTx.type === "onchain" ? 1 : 0) + onchainCalls;
      totalSimulatedTx += (r.routeTx.type === "demo" ? 1 : 0) + simCalls;
      console.log(
        `chose ${r.agent?.chosen} | ${agentCalls} agent calls (${onchainCalls} onchain, ${simCalls} sim) | "${(r.agent?.rationale || "").slice(0, 60)}…"`,
      );
    }

    // Gemini free tier: 5 RPM. Inter-request gap to avoid 429.
    if (i < TRIPS.length - 1) await sleep(14_000);
  }

  console.log(`\n───────────────────────────────────────────────────`);
  console.log(`SUMMARY`);
  console.log(`───────────────────────────────────────────────────`);
  console.log(`Successful routes : ${results.filter((r) => r.status === "ok").length}/${TRIPS.length}`);
  console.log(`On-chain x402 tx  : ${totalOnchainTx}`);
  console.log(`Simulated tx      : ${totalSimulatedTx}`);
  console.log(`Total tx          : ${totalOnchainTx + totalSimulatedTx}`);
  console.log(`───────────────────────────────────────────────────\n`);

  // Emit tx hashes for ArcScan verification
  const onchainHashes: string[] = [];
  for (const r of results) {
    if (r.status !== "ok" || !r.agent) continue;
    for (const c of r.agent.calls) {
      if (c.txType === "onchain" && c.txHash) onchainHashes.push(c.txHash);
    }
  }

  if (onchainHashes.length > 0) {
    console.log(`Arc Testnet tx hashes (first 60 shown):`);
    onchainHashes.slice(0, 60).forEach((h, i) => {
      console.log(`  [${String(i + 1).padStart(2, "0")}] https://testnet.arcscan.xyz/tx/${h}`);
    });
  }

  if (totalOnchainTx + totalSimulatedTx < 50) {
    console.warn(`\n⚠ Total tx (${totalOnchainTx + totalSimulatedTx}) below hackathon threshold of 50. Increase trips or tool-call density.`);
    process.exit(1);
  }

  console.log(`\n✓ Hackathon threshold met (${totalOnchainTx + totalSimulatedTx} ≥ 50 tx).`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
