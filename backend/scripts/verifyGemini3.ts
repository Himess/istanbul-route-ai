/**
 * Verifies that Gemini 3 Flash Preview drives the agent end-to-end,
 * including real on-chain settlement on Arc Testnet.
 *
 * Run:
 *   AGENT_TX_MODE=onchain AGENT_PRIVATE_KEY=$PRIVATE_KEY \
 *     npx tsx backend/scripts/verifyGemini3.ts
 *
 * Prints: model id, tool call list, tx hashes, on-chain count.
 */
import "dotenv/config";
import { runRouteAgent } from "../src/agent/agentRouteOrchestrator.js";
import type { OsrmAlternative } from "../src/agent/agentRouteOrchestrator.js";

async function main() {
  console.log("=== Gemini 3 Flash + On-Chain Settlement Verification ===");
  console.log("Model env:           ", process.env.GEMINI_MODEL || "(default)");
  console.log("AGENT_TX_MODE:       ", process.env.AGENT_TX_MODE || "(simulated)");
  console.log("Has GEMINI_API_KEY:  ", !!process.env.GEMINI_API_KEY);
  console.log("Has AGENT_PRIVATE_KEY:", !!process.env.AGENT_PRIVATE_KEY);
  console.log();

  // Taksim → Kadıköy (cross-Bosphorus, agent should pull multiple signals)
  const from = { lat: 41.0369, lng: 28.985 };
  const to = { lat: 40.9903, lng: 29.0276 };

  // Synthetic OSRM-style alternatives so we don't need OSRM uptime
  const alternatives: OsrmAlternative[] = [
    {
      index: 0,
      distanceMeters: 12_400,
      durationSeconds: 1_680,
      geometrySample: [
        [28.985, 41.0369],
        [28.99, 41.03],
        [29.0, 41.02],
        [29.01, 41.0],
        [29.0276, 40.9903],
      ],
      summary: "Bosphorus Bridge corridor",
    },
    {
      index: 1,
      distanceMeters: 14_900,
      durationSeconds: 2_040,
      geometrySample: [
        [28.985, 41.0369],
        [28.97, 41.03],
        [28.98, 41.0],
        [29.02, 40.99],
        [29.0276, 40.9903],
      ],
      summary: "FSM Bridge corridor",
    },
    {
      index: 2,
      distanceMeters: 17_100,
      durationSeconds: 2_400,
      geometrySample: [
        [28.985, 41.0369],
        [29.0, 41.05],
        [29.05, 41.02],
        [29.04, 40.99],
        [29.0276, 40.9903],
      ],
      summary: "Yavuz Sultan Selim Bridge corridor",
    },
  ];

  const started = Date.now();
  const result = await runRouteAgent({ from, to, alternatives });
  const wall = Date.now() - started;

  console.log("--- Agent Decision ---");
  console.log("modelId:           ", result.modelId);
  console.log("chosenRouteIndex:  ", result.chosenRouteIndex);
  console.log("rationale:         ", result.rationale);
  console.log("signalsUsed:       ", result.signalsUsed);
  console.log("totalRounds:       ", result.totalRounds);
  console.log("totalToolCalls:    ", result.totalToolCalls);
  console.log("onchainTxCount:    ", result.onchainTxCount);
  console.log("elapsedMs (agent): ", result.elapsedMs);
  console.log("elapsedMs (wall):  ", wall);
  if (result.error) console.log("error:             ", result.error);

  console.log();
  console.log("--- Tool Invocations ---");
  for (const inv of result.toolInvocations) {
    console.log(
      `  [r${inv.round}] ${inv.name}  ${inv.txType.toUpperCase().padEnd(9)}  ${inv.txHash || "(no hash)"}  (${inv.durationMs}ms)`,
    );
  }

  console.log();
  if (result.modelId !== "gemini-3-flash-preview") {
    console.error("[FAIL] modelId is not gemini-3-flash-preview:", result.modelId);
    process.exit(1);
  }
  if (result.totalToolCalls === 0) {
    console.error("[FAIL] Agent did not call any tools — Gemini 3 integration broken");
    process.exit(1);
  }

  const onchain = result.toolInvocations.filter((i) => i.txType === "onchain");
  if (process.env.AGENT_TX_MODE === "onchain") {
    if (onchain.length === 0) {
      console.error("[FAIL] AGENT_TX_MODE=onchain but no on-chain tx settled");
      process.exit(1);
    }
    console.log(`[OK] Gemini 3 + ${onchain.length} on-chain tx settled.`);
    console.log("Tx hashes (verify on https://explorer.testnet.arc.network/):");
    for (const inv of onchain) console.log("  ", inv.txHash);
  } else {
    console.log("[OK] Gemini 3 produced", result.totalToolCalls, "tool calls (simulated mode).");
  }
}

main().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
