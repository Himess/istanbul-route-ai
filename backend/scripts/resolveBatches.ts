/**
 * Queries Circle Gateway for every USDC transfer the demo user has paid,
 * resolves each batch into real on-chain settlement tx hashes on Arc, and
 * prints a verifiable ArcScan URL list.
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/resolveBatches.ts
 */

import { GatewayClient } from "@circle-fin/x402-batching/client";
import { privateKeyToAccount } from "viem/accounts";

const PK_RAW = process.env.PRIVATE_KEY;
if (!PK_RAW) {
  console.error("Set PRIVATE_KEY");
  process.exit(1);
}
const PK = (PK_RAW.startsWith("0x") ? PK_RAW : `0x${PK_RAW}`) as `0x${string}`;

async function main() {
  const account = privateKeyToAccount(PK);
  const client = new GatewayClient({ chain: "arcTestnet", privateKey: PK });

  console.log(`Querying Circle Gateway transfers for ${account.address} …\n`);
  const result = await client.searchTransfers({ from: account.address, pageSize: 50 });
  console.log(`Total transfers found: ${result.transfers.length}\n`);

  const withTx: string[] = [];
  for (const t of result.transfers) {
    const raw = t as Record<string, unknown>;
    const hash =
      (raw.sendingTransactionHash as string | undefined) ||
      (raw.recipientTransactionHash as string | undefined) ||
      (raw.transactionHash as string | undefined);
    console.log(`  [${t.status.padEnd(10)}] id=${t.id}  amt=${t.amount} USDC  tx=${hash || "(not mined yet)"}`);
    if (hash) withTx.push(hash);
  }

  console.log(`\nMined settlements: ${withTx.length}`);
  withTx.forEach((h, i) => {
    console.log(`  [${String(i + 1).padStart(2, "0")}] https://testnet.arcscan.app/tx/${h}`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
