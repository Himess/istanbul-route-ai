"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/design/TopBar";
import { BottomNav } from "@/components/design/BottomNav";
import { LightMap } from "@/components/design/LightMap";
import { SignalBadge, badgeForSignal } from "@/components/design/SignalBadge";
import { AgentWhisper } from "@/components/design/AgentWhisper";
import { HaloDot } from "@/components/design/HaloDot";
import { MobileShell } from "@/components/design/MobileShell";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { useVehicleStream } from "@/hooks/useVehicleStream";
import { BACKEND_URL } from "@/lib/constants";
import { detectZone } from "@/lib/zones";
import type { RouteResult, AgentDecision } from "@/types";

type Phase = "initial" | "baseline" | "route" | "navigating";
type Destination = { lat: number; lng: number; name: string };

const SAVED_PLACES: Destination[] = [
  { name: "Home",   lat: 41.0479, lng: 28.9872 },
  { name: "Office", lat: 41.0818, lng: 29.0089 },
];
const SAVED_META: Record<string, string> = {
  Home: "Nişantaşı",
  Office: "Levent · Kanyon",
};

const DEFAULT_START: Destination = { lat: 41.0369, lng: 28.985, name: "Taksim" };
const IST_BOUNDS = { minLat: 40.8, maxLat: 41.3, minLng: 28.5, maxLng: 29.4 };

function inIstanbul(lat: number, lng: number) {
  return lat >= IST_BOUNDS.minLat && lat <= IST_BOUNDS.maxLat
      && lng >= IST_BOUNDS.minLng && lng <= IST_BOUNDS.maxLng;
}

interface BaselineRoute {
  route: [number, number][];
  distanceMeters: number;
  durationMin: number;
}

export default function DrivePage() {
  const wallet = useSmartWallet();
  const { vehicles } = useVehicleStream();
  const [phase, setPhase] = useState<Phase>("initial");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [baseline, setBaseline] = useState<BaselineRoute | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapClickArmed, setMapClickArmed] = useState(false);

  const start = DEFAULT_START;

  // ───── baseline (free OSRM) ─────
  const fetchBaseline = useCallback(async (dest: Destination) => {
    setBaselineLoading(true);
    setBaseline(null);
    setRouteResult(null);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/route/baseline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: { lat: start.lat, lng: start.lng },
          to: { lat: dest.lat, lng: dest.lng },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Baseline failed");
      setBaseline({
        route: data.route,
        distanceMeters: Number(data.distance || 0),
        durationMin: Number(data.duration || 0),
      });
      setPhase("baseline");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBaselineLoading(false);
    }
  }, [start.lat, start.lng]);

  // ───── unlock (paid agent route) ─────
  const unlockRoute = useCallback(async () => {
    if (!destination) return;
    if (!wallet.mode) {
      setError("Choose a wallet first to unlock.");
      return;
    }
    setUnlocking(true);
    setError(null);
    try {
      const res = await wallet.payFetch(
        `${BACKEND_URL}/api/route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: { lat: start.lat, lng: start.lng },
            to: { lat: destination.lat, lng: destination.lng },
          }),
        },
        0.0005,
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Route failed");

      const toolCalls = data.agent?.totalToolCalls ?? 0;
      for (let i = 0; i < toolCalls; i++) {
        setTimeout(() => wallet.chargeLocal(0.0001), 180 + i * 140);
      }
      setRouteResult(data as RouteResult);
      setPhase("route");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUnlocking(false);
    }
  }, [wallet, destination, start.lat, start.lng]);

  const handlePickDestination = useCallback((dest: Destination) => {
    setDestination(dest);
    setMapClickArmed(false);
    fetchBaseline(dest);
  }, [fetchBaseline]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!mapClickArmed) return;
    if (!inIstanbul(lat, lng)) {
      setError("Please pick a point within Istanbul.");
      return;
    }
    handlePickDestination({ lat, lng, name: detectZone(lat, lng) });
  }, [mapClickArmed, handlePickDestination]);

  const handleStartDrive = useCallback(() => setPhase("navigating"), []);
  const handleClose = useCallback(() => {
    setDestination(null);
    setBaseline(null);
    setRouteResult(null);
    setMapClickArmed(false);
    setError(null);
    setPhase("initial");
  }, []);

  const mapCenter = useMemo<[number, number]>(() => {
    if (destination) return [(start.lng + destination.lng) / 2, (start.lat + destination.lat) / 2];
    return [start.lng, start.lat];
  }, [destination, start.lat, start.lng]);

  const optimizedGeom = (routeResult?.optimizedRoute || []) as [number, number][];
  const baselineGeom = (baseline?.route || []) as [number, number][];
  const agent: AgentDecision | null = routeResult?.agent || null;

  return (
    <MobileShell>
      <div className="relative w-full h-full overflow-hidden bg-ivory">
        <LightMap
          center={mapCenter}
          zoom={phase === "navigating" ? 15 : 13}
          pitch={phase === "navigating" ? 55 : 0}
          bearing={phase === "navigating" ? 20 : 0}
          route={optimizedGeom}
          baselineRoute={routeResult ? undefined : baselineGeom}
          start={start}
          end={destination}
          vehicles={vehicles}
          mapClickEnabled={mapClickArmed}
          onMapClick={handleMapClick}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 500px at 50% 120%, rgba(250,249,246,0.9), transparent 70%)",
          }}
        />

        {wallet.mode && (
          <TopBar
            balance={wallet.balance}
            delta={wallet.delta}
            tone={wallet.status === "low" ? "low" : "normal"}
          />
        )}

        {/* Idle pill + vehicle count */}
        {phase === "initial" && wallet.mode && (
          <div className="absolute top-[112px] left-3 right-3 z-20">
            <div className="bg-paper/90 backdrop-blur-xl rounded-2xl border border-line-2 px-4 py-3 flex items-center gap-3 shadow-2">
              <HaloDot />
              <div className="flex-1 text-[12px] ink-2">
                Agent prewarmed — watching <span className="font-mono ink-3">{vehicles.length || 0}</span> municipal vehicles.
              </div>
              <div className="text-[10px] font-mono ink-3">IDLE</div>
            </div>
          </div>
        )}

        {/* Map-click arm hint */}
        {mapClickArmed && phase === "initial" && (
          <div className="absolute top-[164px] left-3 right-3 z-20 pointer-events-none">
            <div className="bg-paper/90 backdrop-blur rounded-full px-4 py-2 border border-line mx-auto w-fit">
              <span className="text-[12px] ink-2">Tap anywhere on the map</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "initial" && (
            <motion.div
              key="initial"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="absolute left-3 right-3 bottom-[102px] z-20"
            >
              <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
                {!wallet.mode ? (
                  <OnboardingPanel wallet={wallet} />
                ) : (
                  <>
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[11px] font-mono ink-3 tracking-[.12em] uppercase">
                          Good evening · İstanbul
                        </div>
                        <div className="chip" style={{ background: "var(--iris-tint)", color: "var(--iris-ink)" }}>
                          <HaloDot /> Gemini ready
                        </div>
                      </div>
                      <div className="font-serif text-[34px] leading-[1.05] ink mt-1">
                        Where <span className="italic">shall we</span> go?
                      </div>
                      <div className="ink-3 text-[13px] mt-1">
                        Tap a saved place, or tap the map to drop a pin.
                      </div>
                    </div>

                    <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                      {SAVED_PLACES.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => handlePickDestination(p)}
                          disabled={baselineLoading}
                          className="rounded-2xl border border-line bg-ivory p-3 text-left active:scale-[0.98] transition-transform disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-xl bg-paper border border-line flex items-center justify-center">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="1.9" strokeLinecap="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                              </svg>
                            </div>
                            <div className="text-[13px] font-medium ink">{p.name}</div>
                          </div>
                          <div className="text-[11px] ink-3">{SAVED_META[p.name]}</div>
                        </button>
                      ))}
                    </div>

                    <div className="px-4 pb-4">
                      <button
                        onClick={() => setMapClickArmed((v) => !v)}
                        className="w-full h-[44px] rounded-2xl border border-line flex items-center justify-center gap-2 text-[13px] font-medium transition-colors"
                        style={{
                          background: mapClickArmed ? "var(--teal-tint)" : "var(--paper)",
                          color: mapClickArmed ? "var(--teal-ink)" : "var(--ink-2)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                          <path d="M12 22s8-6 8-12a8 8 0 1 0-16 0c0 6 8 12 8 12Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {mapClickArmed ? "Pin mode on — tap the map" : "Pick a custom spot on the map"}
                      </button>
                    </div>

                    <div className="border-t border-line bg-ivory-2/50 px-4 py-3">
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-2">
                        Live in your area
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <SignalBadge e="📊" l="IBB: moderate" />
                        <SignalBadge e="🚌" l="IETT calm" />
                        <SignalBadge e="🅿️" l="32% free" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {(error || baselineLoading) && (
                <div className="mt-2 px-4 py-2 rounded-xl bg-paper border border-line text-[12px] text-center flex items-center justify-center gap-2"
                  style={{ color: error ? "var(--danger)" : "var(--ink-3)" }}
                >
                  {baselineLoading && <HaloDot />}
                  {error || "Fetching standard route…"}
                </div>
              )}
            </motion.div>
          )}

          {phase === "baseline" && baseline && destination && (
            <motion.div
              key="baseline"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="absolute left-3 right-3 bottom-[102px] z-20"
            >
              <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-1">
                        Destination
                      </div>
                      <div className="font-serif text-[26px] leading-[1.1] ink">{destination.name}</div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mx-4 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory border border-line">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--ink-4)" }} />
                      <div className="truncate">
                        <div className="text-[13px] ink-2">Google Maps</div>
                        <div className="text-[10px] font-mono ink-3">illustrative · free</div>
                      </div>
                    </div>
                    <div className="font-mono text-[18px] ink tabular-nums">
                      {baseline.durationMin}
                      <span className="ink-3 text-[12px]"> min</span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between p-3 rounded-2xl border"
                    style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <HaloDot />
                      <div className="truncate">
                        <div className="text-[13px] font-medium" style={{ color: "var(--iris-ink)" }}>
                          IstanbulRoute AI
                        </div>
                        <div className="text-[10px] font-mono ink-3">Gemini + live municipal data</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--iris-ink)" strokeWidth="1.9" strokeLinecap="round">
                        <rect x="4" y="11" width="16" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      <span className="font-mono text-[14px]" style={{ color: "var(--iris-ink)" }}>? min</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pt-4 pb-4">
                  <button
                    onClick={unlockRoute}
                    disabled={unlocking}
                    className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 font-medium text-[15px] shadow-2 text-white disabled:opacity-70"
                    style={{
                      background:
                        "linear-gradient(180deg, oklch(62% 0.09 200), oklch(55% 0.09 200))",
                    }}
                  >
                    {unlocking ? (
                      <span className="flex items-center gap-2">
                        <HaloDot /> Agent reasoning…
                      </span>
                    ) : (
                      <>
                        Unlock AI route · <span className="font-mono">$0.0005</span>
                      </>
                    )}
                  </button>
                  <div className="mt-2 text-center text-[10px] font-mono ink-3">
                    Payment settles on Arc · goes to municipality treasury
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-2 px-4 py-2 rounded-xl bg-paper border border-line text-[12px] text-center" style={{ color: "var(--danger)" }}>
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {phase === "route" && routeResult && destination && baseline && (
            <motion.div
              key="route"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="absolute left-3 right-3 bottom-[102px] z-20"
            >
              <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono ink-3 tracking-[.12em] uppercase mb-1">
                        Unlocked
                      </div>
                      <div className="font-serif text-[26px] leading-[1.1] ink">{destination.name}</div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex items-end gap-4">
                    <div>
                      <div className="font-mono text-[38px] font-medium ink tracking-tight leading-none tabular-nums">
                        {routeResult.optimizedTime}
                        <span className="text-teal-ink"> min</span>
                      </div>
                      <div className="text-[11px] font-mono ink-3 mt-1">ISTANBUL ROUTE</div>
                    </div>
                    <div className="flex-1 h-px bg-line self-end mb-3" />
                    <div className="text-right">
                      <div className="font-mono text-[18px] ink-3 tabular-nums line-through decoration-[var(--ink-4)]">
                        {routeResult.normalTime} min
                      </div>
                      <div className="text-[11px] font-mono ink-3 mt-0.5">GOOGLE MAPS</div>
                    </div>
                  </div>
                </div>

                {agent && agent.rationale && !agent.error && (
                  <div className="mx-4">
                    <AgentWhisper
                      meta={`${agent.totalToolCalls} signals`}
                      signals={(agent.signalsUsed || []).slice(0, 4).map((s) => ({
                        e: badgeForSignal(s).emoji,
                        l: badgeForSignal(s).label,
                      }))}
                    >
                      {agent.rationale}
                    </AgentWhisper>
                  </div>
                )}

                <div className="px-4 pt-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="h-[52px] px-4 rounded-2xl border border-line bg-paper text-[13px] ink-2"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStartDrive}
                    className="flex-1 h-[52px] rounded-2xl flex items-center justify-center gap-2 font-medium text-[15px] shadow-2 text-white"
                    style={{
                      background: "linear-gradient(180deg, oklch(62% 0.09 200), oklch(55% 0.09 200))",
                    }}
                  >
                    Start drive
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "navigating" && routeResult && destination && (
            <NavigatingPanels
              key="nav"
              route={routeResult}
              destinationName={destination.name}
              onEnd={handleClose}
            />
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </MobileShell>
  );
}

function OnboardingPanel({ wallet }: { wallet: ReturnType<typeof useSmartWallet> }) {
  return (
    <div className="p-5">
      <div className="text-[11px] font-mono ink-3 tracking-[.12em] uppercase mb-1">
        First time
      </div>
      <div className="font-serif text-[28px] leading-[1.05] ink">
        Choose your <span className="italic">wallet</span>
      </div>
      <div className="ink-3 text-[13px] mt-1 mb-4">
        Both options work silently afterward. No popups once set up.
      </div>
      <div className="space-y-2">
        <button
          onClick={wallet.connectMetaMask}
          className="w-full p-4 rounded-2xl border border-line bg-paper flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-ivory-2 border border-line flex items-center justify-center text-[20px]">🦊</div>
          <div className="flex-1 text-left">
            <div className="text-[14px] font-medium ink">Connect MetaMask</div>
            <div className="text-[11px] ink-3">Use your existing wallet on Arc</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <button
          onClick={wallet.createManagedAccount}
          className="w-full p-4 rounded-2xl border flex items-center gap-3 active:scale-[0.99] transition-transform"
          style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}
        >
          <div className="w-10 h-10 rounded-xl bg-paper border border-line flex items-center justify-center">
            <div className="w-5 h-5 rounded-full" style={{ background: "conic-gradient(from 210deg, var(--teal), var(--iris), var(--teal))" }} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-medium ink">Create managed account</span>
              <span className="chip text-[9px] tracking-wider" style={{ background: "var(--paper)", color: "var(--iris-ink)" }}>BETA</span>
            </div>
            <div className="text-[11px] ink-3">Powered by Circle Programmable Wallets</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--iris-ink)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      {wallet.error && (
        <div className="mt-3 text-[12px]" style={{ color: "var(--danger)" }}>{wallet.error}</div>
      )}
      {wallet.message && !wallet.error && (
        <div className="mt-3 text-[12px] ink-3 flex items-center gap-2"><HaloDot /> {wallet.message}</div>
      )}
    </div>
  );
}

function NavigatingPanels({
  route, destinationName, onEnd,
}: { route: RouteResult; destinationName: string; onEnd: () => void }) {
  const firstStep = route.steps?.[0];
  const agent = route.agent;

  return (
    <>
      <motion.div
        key="turn-banner"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.15 }}
        className="absolute top-[112px] left-3 right-3 z-20"
      >
        <div className="backdrop-blur-xl rounded-[22px] px-4 py-3.5 flex items-center gap-3 shadow-4" style={{ background: "oklch(22% 0.012 255 / 0.96)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "oklch(32% 0.02 255)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4v9H5" /><path d="M9 17l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-mono tracking-[.1em]" style={{ color: "oklch(75% 0.02 255)" }}>IN {firstStep?.distance ?? 320} M</div>
            <div className="text-[15px] font-medium leading-tight" style={{ color: "#fff" }}>{firstStep?.instruction || "Continue on route"}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px]" style={{ color: "#fff" }}>{route.optimizedTime} <span style={{ color: "oklch(75% 0.06 200)" }}>min</span></div>
            <div className="text-[10px] font-mono" style={{ color: "oklch(70% 0.02 255)" }}>ETA</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        key="nav-bottom"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="absolute left-3 right-3 bottom-[102px] z-20"
      >
        <div className="bg-paper/95 backdrop-blur-xl rounded-[28px] border border-line-2 shadow-4 overflow-hidden">
          <div className="h-1 bg-ivory-2 relative">
            <div className="absolute left-0 top-0 bottom-0" style={{ background: "var(--teal)", width: "8%" }} />
          </div>
          <div className="px-5 pt-4 pb-2 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[30px] font-medium ink tabular-nums leading-none">
                {((route.routeDetails?.optimizedDistance || 0) / 1000).toFixed(1)} <span className="ink-3 text-[13px]">km</span>
              </div>
              <div className="text-[10px] font-mono ink-3 mt-1 tracking-[.1em]">TO {destinationName.toUpperCase()}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[22px] ink tabular-nums leading-none">{route.optimizedTime} min</div>
              <div className="text-[10px] font-mono ink-3 mt-1 tracking-[.1em]">ARRIVE</div>
            </div>
          </div>
          {agent && agent.rationale && !agent.error && (
            <div className="mx-4 mt-3 mb-3">
              <div className="rounded-2xl p-3 border flex items-center gap-3" style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}>
                <HaloDot />
                <div className="text-[12px] leading-snug flex-1" style={{ color: "var(--iris-ink)" }}>{agent.rationale}</div>
                <div className="text-[10px] font-mono ink-3">NOW</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 border-t border-line">
            <button className="py-4 flex flex-col items-center gap-1 border-r border-line">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="1.9" strokeLinecap="round">
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
              </svg>
              <span className="text-[11px] font-medium ink-2">Silence</span>
            </button>
            <button onClick={onEnd} className="py-4 flex flex-col items-center gap-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.9" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
              <span className="text-[11px] font-medium" style={{ color: "oklch(48% 0.14 30)" }}>End</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
