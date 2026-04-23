/**
 * Single-route diagnostic — signs one Gateway payment and prints the full
 * server response, so we can see exactly what the agent did and how many
 * real on-chain tx its tool loop produced.
 */
import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { registerBatchScheme } from "@circle-fin/x402-batching/client";
import { wrapFetchWithPayment } from "@x402/fetch";

const BACKEND = process.argv[2] || "https://istanbul-route-ai-backend.fly.dev";
const PK = (process.env.PRIVATE_KEY || "").startsWith("0x")
  ? (process.env.PRIVATE_KEY as `0x${string}`)
  : (`0x${process.env.PRIVATE_KEY}` as `0x${string}`);

const arcTestnet = defineChain({
  id: 5042002, name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  testnet: true,
});

async function main() {
  const account = privateKeyToAccount(PK);
  const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http() });
  const signer = {
    address: account.address,
    signTypedData: async (p: Parameters<typeof walletClient.signTypedData>[0]) =>
      walletClient.signTypedData(p),
  };
  const client = new x402Client();
  registerBatchScheme(client, { signer: signer as never, networks: ["eip155:5042002"] });
  const paidFetch = wrapFetchWithPayment(fetch, client);

  const res = await paidFetch(`${BACKEND}/api/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: { lat: 41.0369, lng: 28.985 }, to: { lat: 40.9903, lng: 29.0276 } }),
  });
  console.log("status:", res.status);
  const data = await res.json();
  console.log("agent.modelId:", data.agent?.modelId);
  console.log("agent.totalRounds:", data.agent?.totalRounds);
  console.log("agent.totalToolCalls:", data.agent?.totalToolCalls);
  console.log("agent.onchainTxCount:", data.agent?.onchainTxCount);
  console.log("agent.error:", data.agent?.error?.slice(0, 200));
  console.log("agent.rationale:", data.agent?.rationale?.slice(0, 200));
  console.log("agent.toolCalls:", JSON.stringify(data.agent?.toolCalls, null, 2));
  console.log("payment:", JSON.stringify(data.payment, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
