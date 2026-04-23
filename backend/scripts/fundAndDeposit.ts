/**
 * One-shot helper for the 50+ tx proof script.
 *
 *   1. Transfers USDC ERC20 (0x3600…) from SELLER wallet → DEMO_USER wallet.
 *   2. From the DEMO_USER wallet, approves Gateway to spend USDC.
 *   3. Deposits USDC into Circle Gateway.
 *
 * After this runs the demo user has a spendable Gateway balance and is a
 * distinct address from the seller, so Circle's "no self-payments" rule
 * won't block the x402 flow.
 *
 * Usage:
 *   SELLER_PK=0x... DEMO_USER_PK=0x... AMOUNT=2.0 npx tsx scripts/fundAndDeposit.ts
 */

import { createWalletClient, createPublicClient, http, defineChain, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  testnet: true,
});

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
const GATEWAY_WALLET = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as const;
const USDC_DECIMALS = 6;

const USDC_ABI = [
  { name: "transfer", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

const GATEWAY_ABI = [
  { name: "deposit", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "token", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [] },
] as const;

async function main() {
  const sellerPkRaw = process.env.SELLER_PK || process.env.PRIVATE_KEY;
  const demoPkRaw = process.env.DEMO_USER_PK;
  const amountStr = process.env.AMOUNT || "2.0";
  if (!sellerPkRaw || !demoPkRaw) {
    console.error("Need SELLER_PK and DEMO_USER_PK env vars");
    process.exit(1);
  }
  const sellerPk = (sellerPkRaw.startsWith("0x") ? sellerPkRaw : `0x${sellerPkRaw}`) as `0x${string}`;
  const demoPk = (demoPkRaw.startsWith("0x") ? demoPkRaw : `0x${demoPkRaw}`) as `0x${string}`;

  const seller = privateKeyToAccount(sellerPk);
  const demo = privateKeyToAccount(demoPk);

  const pub = createPublicClient({ chain: arcTestnet, transport: http() });
  const sellerWallet = createWalletClient({ account: seller, chain: arcTestnet, transport: http() });
  const demoWallet = createWalletClient({ account: demo, chain: arcTestnet, transport: http() });

  console.log(`Seller : ${seller.address}`);
  console.log(`Demo   : ${demo.address}`);
  console.log(`Amount : ${amountStr} USDC (ERC20)\n`);

  const atomic = parseUnits(amountStr, USDC_DECIMALS);

  // 1) Transfer ERC20 USDC seller → demo
  console.log(`[1/3] ERC20 transfer seller → demo…`);
  const transferHash = await sellerWallet.writeContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "transfer",
    args: [demo.address, atomic],
  });
  console.log(`       tx: ${transferHash}`);
  await pub.waitForTransactionReceipt({ hash: transferHash });

  // Also send a tiny bit of native value for gas (Arc uses USDC as native gas).
  console.log(`[1.5/3] Gas top-up (0.01 native USDC) seller → demo…`);
  const gasTx = await sellerWallet.sendTransaction({
    to: demo.address,
    value: parseUnits("0.01", 18),
  });
  console.log(`       tx: ${gasTx}`);
  await pub.waitForTransactionReceipt({ hash: gasTx });

  const demoUsdc = await pub.readContract({
    address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf", args: [demo.address],
  }) as bigint;
  console.log(`       demo USDC balance: ${Number(demoUsdc) / 10 ** USDC_DECIMALS}`);

  // 2) Approve Gateway from demo
  console.log(`\n[2/3] Approving Gateway to spend USDC…`);
  const approveHash = await demoWallet.writeContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "approve",
    args: [GATEWAY_WALLET, atomic * BigInt(1000)],
  });
  console.log(`       tx: ${approveHash}`);
  await pub.waitForTransactionReceipt({ hash: approveHash });

  // 3) Deposit into Gateway
  console.log(`\n[3/3] Depositing to Gateway…`);
  const depositHash = await demoWallet.writeContract({
    address: GATEWAY_WALLET,
    abi: GATEWAY_ABI,
    functionName: "deposit",
    args: [USDC_ADDRESS, atomic],
  });
  console.log(`       tx: ${depositHash}`);
  await pub.waitForTransactionReceipt({ hash: depositHash });

  console.log(`\n✓ Demo user funded and deposited.`);
  console.log(`Run generate50Tx with PRIVATE_KEY=${demoPk} to produce the tx proof.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
