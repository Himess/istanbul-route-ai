"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/design/TopBar";
import { BottomNav } from "@/components/design/BottomNav";
import { LightMap } from "@/components/design/LightMap";
import { HaloDot } from "@/components/design/HaloDot";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { BACKEND_URL } from "@/lib/constants";

interface Lot {
  id: number;
  name: string;
  district: string;
  lat: number;
  lng: number;
  capacity: number;
  emptyCapacity: number;
  occupancyRate: number;
  distance: number;
  color: "green" | "yellow" | "red";
}

const CENTER = { lat: 41.0082, lng: 28.9784, name: "Sultanahmet" };

export default function ParkPage() {
  const wallet = useSmartWallet();
  const [lots, setLots] = useState<Lot[]>([]);
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!wallet.mode) return;
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${BACKEND_URL}/api/parking/availability`);
      url.searchParams.set("lat", String(CENTER.lat));
      url.searchParams.set("lng", String(CENTER.lng));
      url.searchParams.set("radius", "1500");
      const res = await wallet.payFetch(url.toString(), { method: "GET" }, 0.0001);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Parking failed");
      const ranked = (data.parkingLots || []).slice(0, 3) as Lot[];
      setLots(ranked);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet.mode && !unlocked && lots.length === 0) {
      fetchAvailability();
    }
  }, [wallet.mode, unlocked, lots.length, fetchAvailability]);

  if (!wallet.mode) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-ivory flex items-center justify-center p-6">
        <div className="max-w-[420px] w-full text-center space-y-3">
          <div className="font-serif text-[32px] leading-[1.05] ink">Set up a wallet</div>
          <div className="text-[13px] ink-3">Parking availability queries cost $0.0001 USDC each. Set up your wallet in Drive first.</div>
          <Link href="/drive" className="inline-flex items-center gap-2 px-5 h-[48px] rounded-2xl bg-teal text-white text-[14px] font-medium">
            Open Drive
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const pins = lots.map((l, i) => ({
    lat: l.lat,
    lng: l.lng,
    label: `P${i + 1}`,
    color: i === 0 ? "oklch(60% 0.09 200)" : i === 1 ? "oklch(82% 0.04 75)" : "oklch(65% 0.1 290)",
  }));

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ivory">
      <LightMap
        center={[CENTER.lng, CENTER.lat]}
        zoom={14}
        parkingPins={pins}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 120%, rgba(250,249,246,0.9), transparent 70%)",
        }}
      />

      <TopBar balance={wallet.balance} delta={wallet.delta} tone={wallet.status === "low" ? "low" : "normal"} />

      <div className="absolute top-[112px] left-3 right-3 z-20 max-w-[420px] mx-auto">
        <div className="bg-paper/95 backdrop-blur-xl rounded-[22px] border border-line-2 shadow-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">Parking near</div>
              <div className="text-[15px] font-medium ink">{CENTER.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono ink-3">AVAILABILITY</div>
              <div className="font-mono text-[13px] ink tabular-nums">
                {lots.length > 0
                  ? `${Math.round((lots.reduce((s, l) => s + l.emptyCapacity, 0) / lots.reduce((s, l) => s + l.capacity, 1)) * 100)}% free`
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-3 right-3 bottom-[102px] z-20 max-w-[420px] mx-auto">
        <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="font-serif text-[26px] leading-[1.1] ink">
                {lots.length} lots <span className="italic">near you</span>
              </div>
              {loading && <HaloDot />}
            </div>
            <div className="text-[12px] ink-3 mt-0.5">
              Sorted by proximity. Reserving debits silently — no approval popups.
            </div>
          </div>

          <div className="px-3 pb-3 space-y-1.5">
            {loading && lots.length === 0 && (
              <div className="py-8 text-center text-[12px] ink-3">Querying ISPARK…</div>
            )}
            {error && (
              <div className="py-3 px-3 text-[12px]" style={{ color: "var(--danger)" }}>
                {error}
              </div>
            )}
            {lots.map((lot, i) => {
              const active = sel === i;
              return (
                <button
                  key={lot.id}
                  onClick={() => setSel(i)}
                  className="w-full text-left rounded-2xl border p-3 transition-colors"
                  style={{
                    borderColor: active ? "oklch(85% 0.06 200)" : "var(--line)",
                    background: active ? "var(--teal-tint)" : "var(--paper)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-[13px] font-semibold text-white"
                      style={{
                        background:
                          i === 0 ? "var(--teal)" : i === 1 ? "var(--sand)" : "var(--iris)",
                      }}
                    >
                      P{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="text-[13px] font-medium ink truncate">{lot.name}</div>
                        {i === 0 && (
                          <span
                            className="chip text-[9px]"
                            style={{
                              background: "var(--iris-tint)",
                              color: "var(--iris-ink)",
                              border: "1px solid oklch(88% 0.04 290)",
                            }}
                          >
                            AGENT PICK
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] ink-3 mt-0.5">
                        {lot.district} · {Math.round(lot.distance)} m away
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[14px] ink tabular-nums">
                        {lot.emptyCapacity}<span className="ink-3 text-[10px]">/{lot.capacity}</span>
                      </div>
                      <div className="text-[10px] font-mono ink-3">free</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {lots[sel] && (
            <div className="border-t border-line px-4 py-3 flex items-center gap-2">
              <button
                className="flex-1 h-[44px] rounded-2xl text-[14px] font-medium text-white"
                style={{ background: "var(--teal)" }}
              >
                Reserve 2h
              </button>
              <div className="text-[10px] font-mono ink-3">−$0.0001</div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
