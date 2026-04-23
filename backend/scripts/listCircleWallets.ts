import "dotenv/config";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY!;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET!;
  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
  const chains: string[] = ["ARC-TESTNET", "EVM-TESTNET", "EVM"];
  const seen = new Set<string>();
  const wallets: Array<{ id: string; address: string; blockchain: string; state: string }> = [];
  for (const c of chains) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await client.listWallets({ blockchain: c as any });
      for (const w of r.data?.wallets || []) {
        if (!seen.has(w.id)) {
          seen.add(w.id);
          wallets.push({ id: w.id, address: w.address, blockchain: w.blockchain, state: w.state });
        }
      }
    } catch (e) {
      console.log(`  (skip ${c}: ${e instanceof Error ? e.message.slice(0, 60) : e})`);
    }
  }
  console.log(`Found ${wallets.length} wallets:\n`);
  for (const w of wallets) {
    console.log(`  id         : ${w.id}`);
    console.log(`  address    : ${w.address}`);
    console.log(`  blockchain : ${w.blockchain}`);
    console.log(`  state      : ${w.state}`);
    console.log(`  walletSet  : ${w.walletSetId}`);
    console.log("");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
