"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HaloDot } from "./HaloDot";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
const GATEWAY_WALLET = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as const;
const USDC_DECIMALS = 6;

const USDC_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const GATEWAY_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  userAddress: string | null;
  initialAmount?: string;
  onDone?: () => void;
}

type Step = "amount" | "approving" | "depositing" | "done" | "error";

export function DepositModal({ open, onClose, userAddress, initialAmount = "10.00", onDone }: Props) {
  const [amount, setAmount] = useState(initialAmount);
  const [step, setStep] = useState<Step>("amount");
  const [approveTx, setApproveTx] = useState<string | null>(null);
  const [depositTx, setDepositTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDeposit() {
    if (!userAddress) { setError("No wallet address"); setStep("error"); return; }
    if (!window.ethereum) { setError("MetaMask not available"); setStep("error"); return; }
    const amountNum = Number(amount);
    if (!isFinite(amountNum) || amountNum <= 0) { setError("Invalid amount"); setStep("error"); return; }

    try {
      setError(null);
      const viem = await import("viem");
      const { arcTestnet } = await import("@/lib/viemChains");

      const walletClient = viem.createWalletClient({
        account: userAddress as `0x${string}`,
        chain: arcTestnet,
        transport: viem.custom(window.ethereum!),
      });
      const publicClient = viem.createPublicClient({
        chain: arcTestnet,
        transport: viem.http(),
      });

      const atomic = viem.parseUnits(amount, USDC_DECIMALS);

      // Step 1: ensure allowance
      const allowance = (await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "allowance",
        args: [userAddress as `0x${string}`, GATEWAY_WALLET],
      })) as bigint;

      if (allowance < atomic) {
        setStep("approving");
        const approveHash = await walletClient.writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: "approve",
          args: [GATEWAY_WALLET, atomic * BigInt(1000)], // approve 1000x so future deposits don't need approve
        });
        setApproveTx(approveHash);
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // Step 2: deposit
      setStep("depositing");
      const depositHash = await walletClient.writeContract({
        address: GATEWAY_WALLET,
        abi: GATEWAY_ABI,
        functionName: "deposit",
        args: [USDC_ADDRESS, atomic],
      });
      setDepositTx(depositHash);
      await publicClient.waitForTransactionReceipt({ hash: depositHash });

      setStep("done");
      onDone?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.length > 200 ? msg.slice(0, 200) + "…" : msg);
      setStep("error");
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 bg-black/35 flex items-end justify-center"
        onClick={() => { if (step === "amount" || step === "done" || step === "error") onClose(); }}
      >
        <motion.div
          key="sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-paper rounded-t-[28px] border-t border-line shadow-4 overflow-hidden"
        >
          <div className="px-5 pt-4 pb-3">
            <div className="w-10 h-1 rounded-full bg-line mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">Deposit to Gateway</div>
                <div className="font-serif text-[22px] ink leading-tight">Fund your <span className="italic">smart wallet</span></div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center"
                disabled={step === "approving" || step === "depositing"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-3">
            {step === "amount" && (
              <>
                <div className="flex gap-2">
                  {["5.00", "10.00", "25.00"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      className="flex-1 rounded-2xl border border-line bg-paper py-3 flex flex-col items-center gap-0.5 hover:bg-ivory-2 transition-colors"
                      style={{
                        background: amount === a ? "var(--teal-tint)" : "var(--paper)",
                        borderColor: amount === a ? "oklch(85% 0.06 200)" : "var(--line)",
                      }}
                    >
                      <div className="font-mono text-[18px] ink tabular-nums">{a}</div>
                      <div className="text-[10px] font-mono ink-3">USDC</div>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-[54px] rounded-2xl border border-line bg-ivory px-4 pr-16 font-mono text-[18px] ink tabular-nums focus:outline-none focus:border-teal"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-mono ink-3">USDC</span>
                </div>
                <div className="text-[11px] ink-3 leading-snug">
                  Two MetaMask popups: approve Gateway spend → deposit. After this, the app debits silently.
                </div>
                <button
                  onClick={handleDeposit}
                  className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 font-medium text-[15px] shadow-2 text-white"
                  style={{ background: "linear-gradient(180deg, oklch(62% 0.09 200), oklch(55% 0.09 200))" }}
                >
                  Deposit {amount} USDC
                </button>
              </>
            )}

            {(step === "approving" || step === "depositing") && (
              <div className="py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <HaloDot />
                  <div className="flex-1">
                    <div className="text-[13px] ink">
                      {step === "approving" ? "Approving Gateway to spend USDC…" : "Depositing to Gateway…"}
                    </div>
                    <div className="text-[11px] ink-3">Confirm in MetaMask. This settles on Arc.</div>
                  </div>
                </div>
                {approveTx && (
                  <div className="text-[10px] font-mono ink-3 break-all">Approve tx: {approveTx.slice(0, 12)}…{approveTx.slice(-6)}</div>
                )}
                {depositTx && (
                  <div className="text-[10px] font-mono ink-3 break-all">Deposit tx: {depositTx.slice(0, 12)}…{depositTx.slice(-6)}</div>
                )}
              </div>
            )}

            {step === "done" && (
              <div className="py-5 space-y-3 text-center">
                <div className="font-serif text-[24px] ink">Deposited.</div>
                <div className="text-[12px] ink-3">Your Gateway balance will refresh within 10 seconds.</div>
                {depositTx && (
                  <a
                    href={`https://testnet.arcscan.app/tx/${depositTx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[11px] font-mono text-teal-ink underline"
                  >
                    View on ArcScan ↗
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-full mt-3 h-[48px] rounded-2xl bg-teal text-white text-[14px] font-medium"
                >
                  Done
                </button>
              </div>
            )}

            {step === "error" && (
              <div className="py-4 space-y-2">
                <div className="text-[13px]" style={{ color: "var(--danger)" }}>Deposit failed</div>
                <div className="text-[11px] font-mono ink-3 break-words">{error}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setStep("amount")} className="flex-1 h-[44px] rounded-2xl border border-line bg-paper text-[13px] ink-2">Retry</button>
                  <button onClick={onClose} className="flex-1 h-[44px] rounded-2xl bg-teal text-white text-[13px]">Close</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
