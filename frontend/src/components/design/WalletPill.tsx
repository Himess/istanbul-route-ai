"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface WalletDelta {
  id: number;
  v: number;
}

interface Props {
  balance: number;
  delta?: WalletDelta | null;
  tone?: "normal" | "low";
}

export function WalletPill({ balance, delta, tone = "normal" }: Props) {
  const low = tone === "low";
  return (
    <div
      className="flex items-center gap-2 bg-paper/90 backdrop-blur border rounded-full pl-2.5 pr-3 h-9 shadow-2 relative"
      style={{ borderColor: low ? "oklch(86% 0.06 55)" : "var(--line-2)" }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: low ? "oklch(96% 0.04 55)" : "oklch(97% 0.022 290)" }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: low ? "var(--warn)" : "var(--iris)" }}
        />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] font-mono ink-3 tracking-wider">USDC</span>
        <span className="font-mono text-[13px] font-medium ink tabular-nums">
          {balance.toFixed(4)}
        </span>
      </div>
      <AnimatePresence>
        {delta && (
          <motion.div
            key={delta.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute -top-1 right-3 font-mono text-[10px]"
            style={{ color: "var(--iris-ink)" }}
          >
            −${delta.v.toFixed(4)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
