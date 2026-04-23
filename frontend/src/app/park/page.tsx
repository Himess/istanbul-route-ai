"use client";

import Link from "next/link";
import { useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/design/TopBar";
import { BottomNav } from "@/components/design/BottomNav";
import { LightMap } from "@/components/design/LightMap";
import { HaloDot } from "@/components/design/HaloDot";
import { MobileShell } from "@/components/design/MobileShell";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { BACKEND_URL } from "@/lib/constants";
import { detectZone } from "@/lib/zones";

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

interface AreaResult {
  centerLat: number;
  centerLng: number;
  zone: string;
  totalLots: number;
  totalCapacity: number;
  totalAvailable: number;
  lots: Lot[];
}

const IST_BOUNDS = { minLat: 40.8, maxLat: 41.3, minLng: 28.5, maxLng: 29.4 };
function inIstanbul(lat: number, lng: number) {
  return lat >= IST_BOUNDS.minLat && lat <= IST_BOUNDS.maxLat
      && lng >= IST_BOUNDS.minLng && lng <= IST_BOUNDS.maxLng;
}

export default function ParkPage() {
  const wallet = useSmartWallet();
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number; zone: string } | null>(null);
  const [result, setResult] = useState<AreaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable payFetch reference across renders
  const payFetchRef = useRef(wallet.payFetch);
  payFetchRef.current = wallet.payFetch;

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!inIstanbul(lat, lng)) {
      setError("Pick a point within Istanbul.");
      return;
    }
    setError(null);
    setResult(null);
    setPickedPoint({ lat, lng, zone: detectZone(lat, lng) });
  }, []);

  const queryArea = useCallback(async () => {
    if (!pickedPoint) return;
    if (wallet.balance < 0.00015) {
      setError("Deposit USDC in the Card tab to query parking.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${BACKEND_URL}/api/parking/availability`);
      url.searchParams.set("lat", String(pickedPoint.lat));
      url.searchParams.set("lng", String(pickedPoint.lng));
      url.searchParams.set("radius", "1200");
      const res = await payFetchRef.current(url.toString(), { method: "GET" }, 0.0001);
      if (res.status === 402) {
        throw new Error("Payment verification failed. Deposit USDC first.");
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Parking query failed");
      const lots = (data.parkingLots || []) as Lot[];
      const totalCap = lots.reduce((s, l) => s + l.capacity, 0);
      const totalEmpty = lots.reduce((s, l) => s + l.emptyCapacity, 0);
      setResult({
        centerLat: pickedPoint.lat,
        centerLng: pickedPoint.lng,
        zone: pickedPoint.zone,
        totalLots: lots.length,
        totalCapacity: totalCap,
        totalAvailable: totalEmpty,
        lots: lots.slice(0, 5),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [pickedPoint, wallet.balance]);

  const clearSelection = useCallback(() => {
    setPickedPoint(null);
    setResult(null);
    setError(null);
  }, []);

  const mapCenter = useMemo<[number, number]>(() => {
    if (pickedPoint) return [pickedPoint.lng, pickedPoint.lat];
    return [28.9784, 41.0082];
  }, [pickedPoint]);

  const pins = useMemo(() => {
    if (!result) return [];
    return result.lots.map((l, i) => ({
      lat: l.lat,
      lng: l.lng,
      label: `P${i + 1}`,
      color: i === 0 ? "oklch(60% 0.09 200)" : i === 1 ? "oklch(82% 0.04 75)" : "oklch(65% 0.1 290)",
    }));
  }, [result]);

  if (!wallet.mode) {
    return (
      <MobileShell>
        <div className="relative w-full h-full overflow-hidden bg-ivory flex items-center justify-center p-6">
          <div className="max-w-[420px] w-full text-center space-y-3">
            <div className="font-serif text-[32px] leading-[1.05] ink">Set up a wallet</div>
            <div className="text-[13px] ink-3">Each parking query debits $0.0001 USDC silently. Set up your wallet in Drive first.</div>
            <Link href="/drive" className="inline-flex items-center gap-2 px-5 h-[48px] rounded-2xl bg-teal text-white text-[14px] font-medium">
              Open Drive
            </Link>
          </div>
          <BottomNav />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="relative w-full h-full overflow-hidden bg-ivory">
        <LightMap
          center={mapCenter}
          zoom={pickedPoint ? 14 : 12}
          start={pickedPoint ? { lat: pickedPoint.lat, lng: pickedPoint.lng } : null}
          parkingPins={pins}
          mapClickEnabled={!loading}
          onMapClick={handleMapClick}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 500px at 50% 120%, rgba(250,249,246,0.9), transparent 70%)",
          }}
        />

        <TopBar
          balance={wallet.balance}
          delta={wallet.delta}
          tone={wallet.status === "low" ? "low" : "normal"}
          address={wallet.address}
          mode={wallet.mode}
          onDisconnect={wallet.disconnect}
        />

        <div className="absolute top-[112px] left-3 right-3 z-20">
          <div className="bg-paper/90 backdrop-blur-xl rounded-2xl border border-line-2 px-4 py-3 flex items-center gap-3 shadow-2">
            {loading ? <HaloDot /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="1.9" strokeLinecap="round">
                <path d="M12 22s8-6 8-12a8 8 0 1 0-16 0c0 6 8 12 8 12Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            )}
            <div className="flex-1 text-[12px] ink-2">
              {loading
                ? "Querying ISPARK…"
                : pickedPoint
                  ? <>Picked area — <span className="font-mono ink">{pickedPoint.zone}</span>. Query to unlock.</>
                  : "Tap anywhere on the map to check parking in that area."}
            </div>
            <div className="text-[10px] font-mono ink-3">$0.0001</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="picker"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="absolute left-3 right-3 bottom-[102px] z-20"
            >
              <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <div className="text-[11px] font-mono ink-3 tracking-[.12em] uppercase">
                    ISPARK availability · per-query data
                  </div>
                  <div className="font-serif text-[26px] leading-[1.1] ink mt-1">
                    Where <span className="italic">do you need</span> a spot?
                  </div>
                  <div className="text-[12px] ink-3 mt-1">
                    Tap the map. We query ISPARK within 1.2 km and return real-time availability.
                  </div>
                </div>

                {pickedPoint && (
                  <div className="mx-4 mb-3 p-3 rounded-2xl bg-ivory border border-line flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-paper border border-line flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="1.9">
                        <path d="M12 22s8-6 8-12a8 8 0 1 0-16 0c0 6 8 12 8 12Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium ink">{pickedPoint.zone}</div>
                      <div className="text-[10px] font-mono ink-3">
                        {pickedPoint.lat.toFixed(4)}, {pickedPoint.lng.toFixed(4)}
                      </div>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="w-8 h-8 rounded-full border border-line bg-paper flex items-center justify-center"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="px-4 pb-4">
                  {wallet.balance < 0.00015 ? (
                    <Link
                      href="/card"
                      className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2 font-medium text-[14px] shadow-2 text-white"
                      style={{
                        background: "linear-gradient(180deg, oklch(65% 0.1 290), oklch(55% 0.1 290))",
                      }}
                    >
                      Deposit USDC to Gateway first →
                    </Link>
                  ) : (
                    <button
                      onClick={queryArea}
                      disabled={!pickedPoint || loading}
                      className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2 font-medium text-[14px] shadow-2 text-white disabled:opacity-50"
                      style={{
                        background: "linear-gradient(180deg, oklch(62% 0.09 200), oklch(55% 0.09 200))",
                      }}
                    >
                      {loading ? "Querying…" : pickedPoint ? (
                        <>
                          Unlock availability · <span className="font-mono">$0.0001</span>
                        </>
                      ) : "Tap the map to pick a spot"}
                    </button>
                  )}
                  {error && (
                    <div className="mt-2 text-[12px] text-center" style={{ color: "var(--danger)" }}>
                      {error}
                    </div>
                  )}
                  <div className="mt-2 text-[10px] font-mono ink-3 text-center">
                    Settles on Arc · payment flows to municipality treasury
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="absolute left-3 right-3 bottom-[102px] z-20"
            >
              <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
                <div className="px-5 pt-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-1">
                        Area unlocked
                      </div>
                      <div className="font-serif text-[24px] leading-[1.1] ink">{result.zone}</div>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-line">
                    <div>
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">Free</div>
                      <div className="font-mono text-[22px] ink tabular-nums mt-0.5">
                        {result.totalAvailable}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">Total</div>
                      <div className="font-mono text-[22px] ink tabular-nums mt-0.5">
                        {result.totalCapacity}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase">Lots</div>
                      <div className="font-mono text-[22px] ink tabular-nums mt-0.5">
                        {result.totalLots}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 space-y-1.5 max-h-[240px] overflow-y-auto">
                  {result.lots.map((lot, i) => (
                    <div
                      key={lot.id}
                      className="w-full rounded-2xl border border-line bg-paper p-3"
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
                          <div className="text-[13px] font-medium ink truncate">{lot.name}</div>
                          <div className="text-[11px] ink-3 mt-0.5">
                            {lot.district} · {Math.round(lot.distance)} m away
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[14px] ink tabular-nums">
                            {lot.emptyCapacity}
                            <span className="ink-3 text-[10px]">/{lot.capacity}</span>
                          </div>
                          <div className="text-[10px] font-mono ink-3">free</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {result.lots.length === 0 && (
                    <div className="py-6 text-center text-[12px] ink-3">
                      No ISPARK lots within 1.2 km. Tap a different spot.
                    </div>
                  )}
                </div>

                <div className="border-t border-line px-4 py-3 flex items-center justify-between text-[11px] ink-3">
                  <span>Data fresh from İBB · valid 15 min</span>
                  <button
                    onClick={clearSelection}
                    className="font-mono text-teal-ink"
                  >
                    New query →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </MobileShell>
  );
}
