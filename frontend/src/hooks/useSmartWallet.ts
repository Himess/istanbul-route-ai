"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BACKEND_URL } from "@/lib/constants";

const ARC_RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";
const USDC_DECIMALS = 18; // Arc native USDC uses 18 decimals like ETH

async function fetchNativeBalance(address: string): Promise<number> {
  try {
    const res = await fetch(ARC_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });
    const data = await res.json();
    if (!data?.result) return 0;
    const wei = BigInt(data.result);
    return Number(wei) / 10 ** USDC_DECIMALS;
  } catch {
    return 0;
  }
}

type WalletMode = "metamask" | "circle" | null;
type WalletStatus = "idle" | "connecting" | "ready" | "low" | "error";

export interface WalletDelta {
  id: number;
  v: number;
}

export interface SmartWalletState {
  mode: WalletMode;
  address: string | null;
  balance: number;
  delta: WalletDelta | null;
  status: WalletStatus;
  error: string | null;
  /** User-readable string explaining what the app is waiting on. */
  message: string | null;
}

const LS = {
  mode: "irai:wallet:mode",
  address: "irai:wallet:address",
  sessionId: "irai:wallet:circle:session",
  balance: "irai:wallet:balance",
};

const LOW_THRESHOLD = 0.10; // 10¢

/**
 * Unified smart-wallet hook.
 *
 *   mode = "metamask"  →  user connects MetaMask, USDC balance read via RPC.
 *   mode = "circle"    →  backend creates a Circle Programmable Wallet; the
 *                         backend signs all on-chain actions on the user's
 *                         behalf. Zero popups after the initial create.
 *
 * Both modes share the same visible balance + silent-debit UX.
 */
export function useSmartWallet() {
  const [state, setState] = useState<SmartWalletState>({
    mode: null,
    address: null,
    balance: 0,
    delta: null,
    status: "idle",
    error: null,
    message: null,
  });

  const deltaIdRef = useRef(0);

  // ─── hydrate from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const mode = localStorage.getItem(LS.mode) as WalletMode;
      const address = localStorage.getItem(LS.address);
      const cachedBalance = Number(localStorage.getItem(LS.balance) || "0");
      if (mode && address) {
        setState((s) => ({
          ...s,
          mode,
          address,
          balance: cachedBalance,
          status: cachedBalance < LOW_THRESHOLD ? "low" : "ready",
        }));
      }
    } catch {
      /* noop */
    }
  }, []);

  // ─── fetch live balance from Arc RPC ───────────────────────────────────────
  const refreshBalance = useCallback(async (addr: string) => {
    const usdc = await fetchNativeBalance(addr);
    setState((s) => ({
      ...s,
      balance: usdc,
      status: usdc < LOW_THRESHOLD ? "low" : "ready",
    }));
    try { localStorage.setItem(LS.balance, String(usdc)); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (!state.address) return;
    refreshBalance(state.address);
    const id = setInterval(() => refreshBalance(state.address!), 30_000);
    return () => clearInterval(id);
  }, [state.address, refreshBalance]);

  // ─── visual debit (for smooth UX — actual settlement happens server-side) ──
  const chargeLocal = useCallback((v: number) => {
    if (!v || v <= 0) return;
    deltaIdRef.current += 1;
    const id = deltaIdRef.current;
    setState((s) => {
      const next = Math.max(0, +(s.balance - v).toFixed(6));
      return {
        ...s,
        balance: next,
        delta: { id, v },
        status: next < LOW_THRESHOLD ? "low" : "ready",
      };
    });
    setTimeout(() => {
      setState((s) => (s.delta?.id === id ? { ...s, delta: null } : s));
    }, 900);
  }, []);

  // ─── MetaMask connect ──────────────────────────────────────────────────────
  const connectMetaMask = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((s) => ({ ...s, status: "error", error: "MetaMask not installed" }));
      return;
    }
    setState((s) => ({ ...s, status: "connecting", error: null, message: "Awaiting MetaMask…" }));
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" } as Parameters<NonNullable<typeof window.ethereum>["request"]>[0])) as string[];
      const addr = accounts?.[0];
      if (!addr) throw new Error("No account returned");
      localStorage.setItem(LS.mode, "metamask");
      localStorage.setItem(LS.address, addr);
      localStorage.removeItem(LS.sessionId);
      setState({
        mode: "metamask",
        address: addr,
        balance: 0,
        delta: null,
        status: "ready",
        error: null,
        message: null,
      });
      refreshBalance(addr);
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [refreshBalance]);

  // ─── Circle Programmable Wallet create ─────────────────────────────────────
  const createManagedAccount = useCallback(async () => {
    setState((s) => ({
      ...s,
      status: "connecting",
      error: null,
      message: "Provisioning your Circle wallet…",
    }));
    try {
      const existingSession = localStorage.getItem(LS.sessionId);
      const res = await fetch(`${BACKEND_URL}/api/circle/wallet/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingSession ? { sessionId: existingSession } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const addr: string = data.wallet.address;
      const sid: string = data.sessionId;
      localStorage.setItem(LS.mode, "circle");
      localStorage.setItem(LS.address, addr);
      localStorage.setItem(LS.sessionId, sid);
      setState({
        mode: "circle",
        address: addr,
        balance: 0,
        delta: null,
        status: "ready",
        error: null,
        message: null,
      });
      refreshBalance(addr);
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [refreshBalance]);

  // ─── Top up hint (surface the address + faucet link) ───────────────────────
  const topUp = useCallback(async () => {
    if (!state.address) return;
    // In testnet demo: user must fund their address from Arc faucet.
    // We just refresh balance so the new amount appears.
    await refreshBalance(state.address);
  }, [state.address, refreshBalance]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(LS.mode);
    localStorage.removeItem(LS.address);
    localStorage.removeItem(LS.sessionId);
    localStorage.removeItem(LS.balance);
    setState({
      mode: null,
      address: null,
      balance: 0,
      delta: null,
      status: "idle",
      error: null,
      message: null,
    });
  }, []);

  // ─── Silent-paid fetch (wraps x402) ────────────────────────────────────────
  /**
   * Wraps fetch. In demo mode, injects X-DEMO-MODE header and fires
   * a local visual debit animation so the balance pill "ticks" instantly.
   * Actual on-chain settlement happens server-side (agent tool loop in
   * onchain mode; otherwise simulated).
   */
  const payFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit, localCharge: number = 0) => {
      const headers = new Headers(init?.headers || {});
      headers.set("X-DEMO-MODE", "true");
      if (state.address) headers.set("X-Payer-Address", state.address);
      if (localCharge > 0) chargeLocal(localCharge);
      return fetch(input, { ...init, headers });
    },
    [state.address, chargeLocal],
  );

  return {
    ...state,
    connectMetaMask,
    createManagedAccount,
    disconnect,
    topUp,
    payFetch,
    chargeLocal,
    refreshBalance: () => state.address && refreshBalance(state.address),
  };
}
