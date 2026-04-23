"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BACKEND_URL } from "@/lib/constants";

type WalletMode = "metamask" | "circle" | null;
type WalletStatus = "idle" | "connecting" | "ready" | "low" | "error";

export interface WalletDelta {
  id: number;
  v: number;
}

export interface SmartWalletState {
  mode: WalletMode;
  address: string | null;
  balance: number;       // Gateway USDC balance (what the app can spend)
  walletBalance: number; // USDC sitting outside Gateway (depositable)
  delta: WalletDelta | null;
  status: WalletStatus;
  error: string | null;
  message: string | null;
}

const LS = {
  mode: "irai:wallet:mode",
  address: "irai:wallet:address",
  sessionId: "irai:wallet:circle:session",
};

const LOW_THRESHOLD = 0.10; // $0.10 USDC

export function useSmartWallet() {
  const [state, setState] = useState<SmartWalletState>({
    mode: null,
    address: null,
    balance: 0,
    walletBalance: 0,
    delta: null,
    status: "idle",
    error: null,
    message: null,
  });

  const paidFetchRef = useRef<typeof fetch | null>(null);
  const deltaIdRef = useRef(0);

  // ─── Hydrate session + set up x402 client on reload ────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mode = localStorage.getItem(LS.mode) as WalletMode;
    const address = localStorage.getItem(LS.address);
    if (mode && address) {
      setState((s) => ({ ...s, mode, address, status: "ready" }));
      if (mode === "metamask") {
        setupMetaMaskClient(address).catch(() => {
          /* client setup failed — user can retry via Connect */
        });
      }
    }
  }, []);

  // ─── Balance poll (backend Gateway proxy) ──────────────────────────────────
  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gateway/balance/${addr}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data?.success) return;
      const gateway = Number(data.gateway || 0);
      const wallet = Number(data.wallet || 0);
      setState((s) => ({
        ...s,
        balance: gateway,
        walletBalance: wallet,
        status: gateway < LOW_THRESHOLD ? "low" : "ready",
      }));
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!state.address) return;
    refreshBalance(state.address);
    const id = setInterval(() => refreshBalance(state.address!), 12_000);
    return () => clearInterval(id);
  }, [state.address, refreshBalance]);

  // ─── Build the x402 client + wrapped fetch for a MetaMask address ─────────
  async function setupMetaMaskClient(address: string) {
    if (!window.ethereum) throw new Error("MetaMask not available");
    const [viem, viemA, x402Core, x402Batch, x402Fetch] = await Promise.all([
      import("viem"),
      import("@/lib/viemChains"),
      import("@x402/core/client"),
      import("@circle-fin/x402-batching/client"),
      import("@x402/fetch"),
    ]);
    const walletClient = viem.createWalletClient({
      account: address as `0x${string}`,
      chain: viemA.arcTestnet,
      transport: viem.custom(window.ethereum!),
    });
    const signer = {
      address: address as `0x${string}`,
      signTypedData: async (params: Parameters<typeof walletClient.signTypedData>[0]) =>
        walletClient.signTypedData(params),
    };
    const client = new x402Core.x402Client();
    // Restrict x402 to Arc Testnet only — avoids the signer picking a chain
    // MetaMask isn't currently on.
    x402Batch.registerBatchScheme(client, {
      signer: signer as never,
      networks: ["eip155:5042002"],
    });
    paidFetchRef.current = x402Fetch.wrapFetchWithPayment(fetch, client);
  }

  // ─── Connect MetaMask ──────────────────────────────────────────────────────
  const connectMetaMask = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((s) => ({ ...s, status: "error", error: "MetaMask not detected" }));
      return;
    }
    setState((s) => ({ ...s, status: "connecting", error: null, message: "Awaiting MetaMask…" }));
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      } as Parameters<NonNullable<typeof window.ethereum>["request"]>[0])) as string[];
      const addr = accounts?.[0];
      if (!addr) throw new Error("No account returned");
      // Ensure user is on Arc Testnet (will prompt to switch or add the network)
      const { ensureArcTestnet } = await import("@/lib/arcSwitch");
      await ensureArcTestnet();
      localStorage.setItem(LS.mode, "metamask");
      localStorage.setItem(LS.address, addr);
      localStorage.removeItem(LS.sessionId);
      await setupMetaMaskClient(addr);
      setState({
        mode: "metamask",
        address: addr,
        balance: 0,
        walletBalance: 0,
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

  // ─── Circle Managed Wallet onboarding (backend-signed) ────────────────────
  const createManagedAccount = useCallback(async () => {
    setState((s) => ({
      ...s,
      status: "connecting",
      error: null,
      message: "Provisioning your Circle wallet…",
    }));
    try {
      const existing = localStorage.getItem(LS.sessionId);
      const res = await fetch(`${BACKEND_URL}/api/circle/wallet/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existing ? { sessionId: existing } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || `HTTP ${res.status}`);
      const addr: string = data.wallet.address;
      const sid: string = data.sessionId;
      localStorage.setItem(LS.mode, "circle");
      localStorage.setItem(LS.address, addr);
      localStorage.setItem(LS.sessionId, sid);
      paidFetchRef.current = null; // managed mode → backend signs
      setState({
        mode: "circle",
        address: addr,
        balance: 0,
        walletBalance: 0,
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

  // ─── payFetch — real Gateway-signed fetch (no bypass) ─────────────────────
  const payFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit, localCharge: number = 0) => {
      if (localCharge > 0) {
        deltaIdRef.current += 1;
        const id = deltaIdRef.current;
        setState((s) => ({
          ...s,
          balance: Math.max(0, +(s.balance - localCharge).toFixed(6)),
          delta: { id, v: localCharge },
        }));
        setTimeout(() => {
          setState((s) => (s.delta?.id === id ? { ...s, delta: null } : s));
        }, 900);
      }

      if (state.mode === "metamask" && paidFetchRef.current) {
        return paidFetchRef.current(input, init);
      }

      if (state.mode === "circle" && state.address) {
        // Managed wallet — backend signs on user's behalf
        const headers = new Headers(init?.headers || {});
        headers.set("X-Circle-Wallet", state.address);
        return fetch(input, { ...init, headers });
      }

      // Unsigned request — backend will 402 (no bypass)
      return fetch(input, init);
    },
    [state.mode, state.address],
  );

  const chargeLocal = useCallback((v: number) => {
    if (!v || v <= 0) return;
    deltaIdRef.current += 1;
    const id = deltaIdRef.current;
    setState((s) => ({
      ...s,
      balance: Math.max(0, +(s.balance - v).toFixed(6)),
      delta: { id, v },
    }));
    setTimeout(() => {
      setState((s) => (s.delta?.id === id ? { ...s, delta: null } : s));
    }, 900);
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(LS.mode);
    localStorage.removeItem(LS.address);
    localStorage.removeItem(LS.sessionId);
    paidFetchRef.current = null;
    setState({
      mode: null,
      address: null,
      balance: 0,
      walletBalance: 0,
      delta: null,
      status: "idle",
      error: null,
      message: null,
    });
  }, []);

  return {
    ...state,
    connectMetaMask,
    createManagedAccount,
    disconnect,
    payFetch,
    chargeLocal,
    refreshBalance: () => state.address && refreshBalance(state.address),
  };
}
