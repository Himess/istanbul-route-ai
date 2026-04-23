"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  address: string;
  mode: "metamask" | "circle" | null;
  onDisconnect: () => void;
  onClose: () => void;
}

export function WalletMenu({ address, mode, onDisconnect, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [onClose]);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="absolute right-4 top-[98px] z-40 w-[260px] bg-paper rounded-2xl border border-line-2 shadow-4 overflow-hidden"
      >
        <div className="px-4 pt-3 pb-2 border-b border-line">
          <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">
            {mode === "circle" ? "Managed account · Arc" : "Connected wallet · Arc"}
          </div>
          <div className="mt-1 font-mono text-[12px] ink break-all leading-tight">
            {address}
          </div>
        </div>
        <button
          onClick={copyAddress}
          className="w-full px-4 py-3 flex items-center gap-3 text-[13px] ink-2 hover:bg-ivory-2 transition-colors border-b border-line"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="flex-1 text-left">{copied ? "Copied!" : "Copy address"}</span>
        </button>
        <a
          href={`https://testnet.arcscan.app/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="w-full px-4 py-3 flex items-center gap-3 text-[13px] ink-2 hover:bg-ivory-2 transition-colors border-b border-line"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </svg>
          <span className="flex-1 text-left">View on ArcScan</span>
        </a>
        <button
          onClick={() => {
            onDisconnect();
            onClose();
          }}
          className="w-full px-4 py-3 flex items-center gap-3 text-[13px] hover:bg-ivory-2 transition-colors"
          style={{ color: "var(--danger)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span className="flex-1 text-left font-medium">Disconnect</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
