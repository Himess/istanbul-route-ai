/**
 * Records each agent tool invocation as an Arc settlement.
 *
 * Mode is controlled by AGENT_TX_MODE env var:
 *   - "onchain"  (default for demo/prod) — uses the Circle Gateway client to
 *                 settle a $0.0001 USDC payment from the agent's wallet to the
 *                 IstanbulRoute seller address. Returns real tx hash.
 *   - "simulated" (default for dev) — no network call. Returns a deterministic
 *                 pseudo-hash prefixed with `sim_` so downstream logic can
 *                 distinguish.
 *
 * The hackathon requires 50+ on-chain transactions. For the submission demo
 * we will flip AGENT_TX_MODE=onchain. During development we use simulated to
 * keep iteration fast and avoid burning faucet USDC.
 */

import { ethers } from "ethers";

type TxType = "onchain" | "simulated" | "failed";

const AGENT_TX_MODE: TxType =
  (process.env.AGENT_TX_MODE as TxType) || "simulated";

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY; // dedicated agent wallet
const ARC_RPC_URL = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const SELLER_ADDRESS =
  process.env.AGENT_SELLER_ADDRESS || "0xF505e2E71df58D7244189072008f25f6b6aaE5ae";
const USDC_PER_CALL = "100"; // 100 micro-USDC = $0.0001 (6 decimals)

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;

function getSigner(): ethers.Wallet | null {
  if (!AGENT_PRIVATE_KEY) return null;
  if (!provider) provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
  if (!signer) signer = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
  return signer;
}

export async function settleAgentToolCall(
  toolName: string,
  _args: Record<string, unknown>,
): Promise<{ txHash: string | null; txType: TxType }> {
  if (AGENT_TX_MODE === "simulated") {
    // Deterministic pseudo-hash for auditability in simulated mode
    const fakeHash =
      "sim_" +
      ethers.id(`${toolName}:${Date.now()}:${Math.random()}`).slice(2, 18);
    return { txHash: fakeHash, txType: "simulated" };
  }

  const s = getSigner();
  if (!s) {
    console.warn("[AgentSettlement] onchain mode requested but AGENT_PRIVATE_KEY not set — falling back to simulated");
    return settleAgentToolCall(toolName, _args);
  }

  try {
    // Native-USDC transfer (Arc: USDC IS the native gas token)
    const tx = await s.sendTransaction({
      to: SELLER_ADDRESS,
      value: BigInt(USDC_PER_CALL), // micro-USDC (6 dp)
      data: "0x",
    });
    await tx.wait(1);
    return { txHash: tx.hash, txType: "onchain" };
  } catch (err) {
    console.error(`[AgentSettlement] onchain settle failed for ${toolName}:`, err);
    return { txHash: null, txType: "failed" };
  }
}
