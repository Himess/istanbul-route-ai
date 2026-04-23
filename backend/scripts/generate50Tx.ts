/**
 * End-to-end proof script: signs real x402 Gateway payments from the agent
 * wallet and hits the live backend until 50+ on-chain settlements have
 * occurred on Arc.
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/generate50Tx.ts
 *   PRIVATE_KEY=0x... npx tsx scripts/generate50Tx.ts https://istanbul-route-ai-backend.fly.dev
 *
 * Prerequisites on the backend:
 *   - Circle Gateway middleware enabled (no X-DEMO-MODE bypass)
 *   - AGENT_TX_MODE=onchain
 *   - The wallet behind PRIVATE_KEY must have USDC deposited in Circle
 *     Gateway on Arc Testnet (≥ 0.01 USDC recommended for 10 route queries).
 */

import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { registerBatchScheme } from "@circle-fin/x402-batching/client";
import { wrapFetchWithPayment } from "@x402/fetch";

const BACKEND = process.argv[2] || process.env.BACKEND_URL || "http://localhost:3001";
const PK_RAW = process.env.PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY;
if (!PK_RAW) {
  console.error("Set PRIVATE_KEY=0x... in env");
  process.exit(1);
}
const PK = (PK_RAW.startsWith("0x") ? PK_RAW : `0x${PK_RAW}`) as `0x${string}`;

const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
});

const TRIPS = [
  { name: "Taksim → Kadıköy",    from: { lat: 41.0369, lng: 28.985 }, to: { lat: 40.9903, lng: 29.0276 } },
  { name: "Bakırköy → Beşiktaş", from: { lat: 40.985, lng: 28.86 },   to: { lat: 41.048, lng: 29.005 } },
  { name: "Fatih → Üsküdar",      from: { lat: 41.012, lng: 28.935 }, to: { lat: 41.026, lng: 29.028 } },
  { name: "Şişli → Levent",       from: { lat: 41.062, lng: 28.988 }, to: { lat: 41.09, lng: 29.004 } },
  { name: "Eminönü → Kadıköy",   from: { lat: 41.015, lng: 28.968 }, to: { lat: 40.99, lng: 29.034 } },
  { name: "Zeytinburnu → Beyoğlu", from: { lat: 41.0, lng: 28.906 },  to: { lat: 41.035, lng: 28.974 } },
  { name: "Levent → Kadıköy",     from: { lat: 41.09, lng: 29.004 },  to: { lat: 40.99, lng: 29.034 } },
  { name: "Atatürk → Sabiha",     from: { lat: 40.985, lng: 28.825 }, to: { lat: 40.898, lng: 29.31 } },
  { name: "Beşiktaş → Şişli",    from: { lat: 41.048, lng: 29.005 }, to: { lat: 41.062, lng: 28.988 } },
  { name: "Üsküdar → Levent",    from: { lat: 41.026, lng: 29.028 }, to: { lat: 41.09, lng: 29.004 } },
  { name: "Fatih → Beşiktaş",    from: { lat: 41.012, lng: 28.935 }, to: { lat: 41.048, lng: 29.005 } },
  { name: "Kadıköy → Taksim",    from: { lat: 40.99, lng: 29.034 },  to: { lat: 41.038, lng: 28.99 } },
];

async function main() {
  const account = privateKeyToAccount(PK);
  const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http() });

  const signer = {
    address: account.address,
    signTypedData: async (params: Parameters<typeof walletClient.signTypedData>[0]) =>
      walletClient.signTypedData(params),
  };

  const client = new x402Client();
  registerBatchScheme(client, { signer: signer as never, networks: ["eip155:5042002"] });
  const paidFetch = wrapFetchWithPayment(fetch, client);

  console.log(`\nBackend    : ${BACKEND}`);
  console.log(`Payer addr : ${account.address}`);
  console.log(`Trips      : ${TRIPS.length}\n`);

  const hashes: { tx: string; kind: string; trip: string }[] = [];
  let ok = 0, fail = 0;

  for (let i = 0; i < TRIPS.length; i++) {
    const trip = TRIPS[i];
    process.stdout.write(`[${String(i + 1).padStart(2, "0")}/${TRIPS.length}] ${trip.name.padEnd(28)} ... `);
    try {
      const res = await paidFetch(`${BACKEND}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: trip.from, to: trip.to }),
      });
      if (res.status === 402) {
        console.log("402 (Gateway balance insufficient)");
        fail++;
        continue;
      }
      const data = await res.json() as {
        success: boolean;
        payment?: { transaction?: string };
        agent?: {
          totalToolCalls?: number;
          onchainTxCount?: number;
          toolCalls?: { name: string; txHash: string | null; txType: string }[];
        };
      };
      if (!data.success) {
        console.log("failed");
        fail++;
        continue;
      }
      const routeTx = data.payment?.transaction;
      if (routeTx) hashes.push({ tx: routeTx, kind: "route", trip: trip.name });
      const toolTxs = (data.agent?.toolCalls || []).filter((t) => t.txType === "onchain" && t.txHash);
      for (const t of toolTxs) hashes.push({ tx: t.txHash!, kind: `agent:${t.name}`, trip: trip.name });
      ok++;
      console.log(`ok · route=${routeTx ? "✓" : "–"} · agent tools=${toolTxs.length}`);
    } catch (err) {
      console.log("err:", err instanceof Error ? err.message.slice(0, 70) : String(err).slice(0, 70));
      fail++;
    }
    if (i < TRIPS.length - 1) await new Promise((r) => setTimeout(r, 12_000));
  }

  console.log(`\nSummary: ${ok} ok · ${fail} failed`);
  console.log(`Total on-chain tx collected: ${hashes.length}\n`);

  if (hashes.length > 0) {
    console.log(`ArcScan verification:`);
    hashes.forEach((h, i) => {
      console.log(`  [${String(i + 1).padStart(2, "0")}] ${h.kind.padEnd(28)} ${h.trip.padEnd(24)} https://testnet.arcscan.app/tx/${h.tx}`);
    });
  }

  console.log(`\nVerifying inclusion on Arc …`);
  let mined = 0;
  const sample = hashes.slice(0, 20);
  for (const h of sample) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: h.tx as `0x${string}` });
      if (receipt.status === "success") mined++;
    } catch { /* pending */ }
  }
  console.log(`Mined (first ${sample.length} sampled): ${mined}/${sample.length}`);

  if (hashes.length < 50) {
    console.warn(`\n⚠ Only ${hashes.length} tx — below 50 threshold.`);
    process.exit(1);
  }
  console.log(`\n✓ Hackathon threshold met: ${hashes.length} ≥ 50 on-chain transactions on Arc.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
