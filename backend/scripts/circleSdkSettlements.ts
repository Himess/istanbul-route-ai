/**
 * Produces 50+ on-chain tx on Arc Testnet *through* Circle's Programmable
 * Wallet SDK, so every transaction shows up in the Circle Developer Console
 * (Transactions tab) AND on ArcScan.
 *
 * Strictly sequential: Circle/Arc rejects a new tx while the previous one
 * from the same wallet is still pending on chain ("Wait for pending
 * transactions to be included"). So we create → poll to COMPLETE → next.
 *
 * Results are appended to backend/scripts/circle-sdk-tx.json after each
 * confirmation so re-runs can resume and we never lose hashes.
 *
 * Usage:
 *   cd backend
 *   CIRCLE_WALLET_ID=7f5471f0-4261-5b00-836b-9a3746d13490 \
 *     SELLER=0xF505e2E71df58D7244189072008f25f6b6aaE5ae \
 *     COUNT=55 npx tsx scripts/circleSdkSettlements.ts
 *
 * Env:
 *   CIRCLE_API_KEY         required
 *   CIRCLE_ENTITY_SECRET   required
 *   CIRCLE_WALLET_ID       optional (Arc wallet UUID; auto-detected otherwise)
 *   SELLER                 destination (default: municipality treasury)
 *   COUNT                  target total confirmed tx (default 55)
 *   AMOUNT_USDC            per-tx amount (default 0.0001)
 *   DELAY_MS               pause between create calls (default 1500)
 */

import "dotenv/config";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const SELLER =
  (process.env.SELLER || "0xF505e2E71df58D7244189072008f25f6b6aaE5ae") as `0x${string}`;
const COUNT = Number(process.env.COUNT || "55");
const AMOUNT_USDC = process.env.AMOUNT_USDC || "0.0001";
const DELAY_MS = Number(process.env.DELAY_MS || "1500");

const TOOL_LABELS = [
  "traffic_snapshot", "iett_density", "incidents_on_route",
  "weather", "parking_near_destination", "time_context",
];

const OUT_PATH = "scripts/circle-sdk-tx.json";

type Row = { idx: number; tool: string; txId: string; txHash: string };

function loadPrior(): Row[] {
  if (!existsSync(OUT_PATH)) return [];
  try { return JSON.parse(readFileSync(OUT_PATH, "utf8")) as Row[]; }
  catch { return []; }
}
function save(rows: Row[]) {
  writeFileSync(OUT_PATH, JSON.stringify(rows, null, 2));
}

async function waitForHash(
  client: ReturnType<typeof initiateDeveloperControlledWalletsClient>,
  id: string,
): Promise<string | null> {
  for (let attempt = 0; attempt < 80; attempt++) {
    await new Promise((r) => setTimeout(r, 2_000));
    try {
      const res = await client.getTransaction({ id });
      const tx = res.data?.transaction;
      if (!tx) continue;
      if (tx.state === "COMPLETE" && tx.txHash) return tx.txHash;
      if (tx.state === "FAILED" || tx.state === "CANCELLED") {
        console.error(`  ✗ ${tx.state}: ${tx.errorReason || "unknown"}`);
        return null;
      }
    } catch { /* transient */ }
  }
  return null;
}

async function pickArcWallet(
  client: ReturnType<typeof initiateDeveloperControlledWalletsClient>,
): Promise<{ id: string; address: string } | null> {
  for (const c of ["ARC-TESTNET", "EVM-TESTNET"] as const) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await client.listWallets({ blockchain: c as any });
      const w = r.data?.wallets?.[0];
      if (w) return { id: w.id, address: w.address };
    } catch { /* next */ }
  }
  return null;
}

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) {
    console.error("CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET required");
    process.exit(1);
  }
  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

  let walletId = process.env.CIRCLE_WALLET_ID;
  let walletAddress = "";
  if (walletId) {
    const w = await client.getWallet({ id: walletId });
    walletAddress = w.data?.wallet?.address || "";
  } else {
    const picked = await pickArcWallet(client);
    if (!picked) { console.error("No Arc/EVM wallet; set CIRCLE_WALLET_ID"); process.exit(1); }
    walletId = picked.id; walletAddress = picked.address;
  }

  const bal = await client.getWalletTokenBalance({ id: walletId });
  const balances = bal.data?.tokenBalances || [];
  const usdc = balances.find((b) =>
    b.token?.symbol === "USDC" ||
    (b.token as { isNative?: boolean })?.isNative === true,
  );
  if (!usdc?.token?.id) {
    console.error("USDC balance not found. Balances:", balances.map((b) => `${b.token?.symbol}=${b.amount}`).join(", "));
    process.exit(1);
  }
  const tokenId = usdc.token.id;

  const prior = loadPrior();
  console.log(`\nCircle Dev-Controlled Wallet tx run (sequential)`);
  console.log(`  wallet     : ${walletId}`);
  console.log(`  address    : ${walletAddress}`);
  console.log(`  USDC       : ${usdc.amount}`);
  console.log(`  tokenId    : ${tokenId}`);
  console.log(`  seller     : ${SELLER}`);
  console.log(`  target     : ${COUNT} confirmed tx`);
  console.log(`  already    : ${prior.length} confirmed in ${OUT_PATH}`);
  console.log(`  delay      : ${DELAY_MS}ms between creates`);
  console.log(`  per-tx USDC: ${AMOUNT_USDC}\n`);

  if (Number(usdc.amount) < Number(AMOUNT_USDC) * (COUNT - prior.length)) {
    console.error(`Insufficient USDC for remaining tx.`);
    process.exit(1);
  }

  const rows: Row[] = [...prior];
  let idx = prior.length;

  while (rows.length < COUNT) {
    const tool = TOOL_LABELS[idx % TOOL_LABELS.length];
    const label = `[${String(rows.length + 1).padStart(2, "0")}/${COUNT}] ${tool.padEnd(26)}`;
    let attempt = 0;
    let txId: string | null = null;

    while (attempt < 8 && !txId) {
      try {
        const res = await client.createTransaction({
          walletId,
          tokenId,
          destinationAddress: SELLER,
          amount: [AMOUNT_USDC],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
          refId: `agent-tool:${tool}:${idx + 1}`,
        });
        txId = res.data?.id || null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const retryable =
          msg.includes("rate limit") ||
          msg.includes("Wait for pending") ||
          msg.includes("pending transactions");
        if (!retryable) { console.error(`${label} hard-fail: ${msg.slice(0, 140)}`); break; }
        attempt++;
        const backoff = Math.min(15_000, 2_000 * attempt);
        process.stdout.write(`${label} retry #${attempt} in ${backoff}ms\n`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    if (!txId) { idx++; continue; }

    process.stdout.write(`${label} id=${txId} waiting…\n`);
    const hash = await waitForHash(client, txId);
    if (hash) {
      rows.push({ idx: rows.length + 1, tool, txId, txHash: hash });
      save(rows);
      console.log(`  ✓ ${hash}`);
    } else {
      console.log(`  ✗ ${txId} never reached COMPLETE`);
    }

    idx++;
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\nConfirmed: ${rows.length}/${COUNT}\n`);
  console.log(`ArcScan verification list:`);
  rows.forEach((r) => {
    console.log(`  [${String(r.idx).padStart(2, "0")}] ${r.tool.padEnd(28)} https://testnet.arcscan.app/tx/${r.txHash}`);
  });
  console.log(`\nCircle Console:`);
  console.log(`  https://console.circle.com/wallets/dev/transactions`);
  console.log(`  (filter by wallet ${walletAddress})\n`);

  if (rows.length < 50) { console.warn(`⚠ below 50 threshold`); process.exit(1); }
  console.log(`✓ ${rows.length} on-chain tx produced via Circle Programmable Wallet SDK.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
