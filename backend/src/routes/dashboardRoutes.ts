import { Router, Request, Response } from "express";
import { VehicleSimulator } from "../simulator/vehicleSimulator.js";
import { getAllZoneCongestion, getHeatmapData } from "../simulator/trafficEngine.js";
import { x402Verifier } from "../x402/verifier.js";
import { eventStream } from "../services/eventStream.js";
import { getStats24h, getDecisionMix24h, getRevenueSeries7d, recordRevenueDelta } from "../services/agentStats.js";
import { ibbClient } from "../data/ibbClient.js";
import { ISTANBUL_DISTRICTS, detectZone } from "../data/istanbulDistricts.js";

interface PaymentRecord {
  id: string;
  txHash: string;
  from: string;
  endpoint: string;
  amount: string;
  timestamp: number;
  zone: string;
}

// In-memory payment store (mix of real and simulated)
const payments: PaymentRecord[] = [];
let totalQueries = 0;
let totalRevenue = 0;

/**
 * Record a payment (real or simulated). Also feeds the 7-day revenue series.
 */
export function recordPayment(payment: PaymentRecord): void {
  payments.unshift(payment);
  if (payments.length > 200) {
    payments.length = 200; // Keep last 200
  }
  totalQueries++;
  const amt = parseFloat(payment.amount);
  totalRevenue += amt;
  if (amt > 0) recordRevenueDelta(amt, payment.timestamp || Date.now());
}

/**
 * Seeds totalRevenue + totalQueries from the on-chain event history on
 * startup. Called once by index.ts after eventStream.loadHistory finishes.
 */
export function seedFromEventHistory(): void {
  const historical = eventStream.getAll();
  for (const p of historical) {
    const amt = parseFloat(p.amount);
    if (!isFinite(amt)) continue;
    totalQueries++;
    totalRevenue += amt;
    recordRevenueDelta(amt, (p.timestamp || Date.now() / 1000) * 1000);
  }
  console.log(`[Dashboard] Seeded ${historical.length} historical payments (${totalRevenue.toFixed(6)} USDC total)`);
}

/**
 * Increment query counter (for free endpoints too).
 */
export function recordQuery(): void {
  totalQueries++;
}

export function createDashboardRoutes(simulator: VehicleSimulator): Router {
  const router = Router();

  /**
   * GET /api/dashboard/stats
   * Public — returns overall system stats
   */
  router.get("/stats", (_req: Request, res: Response) => {
    const vehicles = simulator.getVehicles();
    const movingVehicles = vehicles.filter((v) => v.status === "moving");
    const avgSpeed =
      movingVehicles.length > 0
        ? movingVehicles.reduce((sum, v) => sum + v.speed, 0) / movingVehicles.length
        : 0;

    // Find busiest zone
    const zoneCounts: Record<string, number> = {};
    for (const v of vehicles) {
      zoneCounts[v.zone] = (zoneCounts[v.zone] || 0) + 1;
    }
    let busiestZone = "Unknown";
    let maxCount = 0;
    for (const [zone, count] of Object.entries(zoneCounts)) {
      if (count > maxCount) {
        maxCount = count;
        busiestZone = zone;
      }
    }

    const congestionData = getAllZoneCongestion();
    const avgCongestion = congestionData.length > 0
      ? congestionData.reduce((sum, z) => sum + z.congestion, 0) / congestionData.length
      : 0;

    const agent24h = getStats24h();
    const revenueSeries = getRevenueSeries7d();

    res.json({
      success: true,
      timestamp: Date.now(),
      stats: {
        totalQueries,
        totalRevenue: Math.round(totalRevenue * 10000) / 10000,
        activeVehicles: vehicles.length,
        movingVehicles: movingVehicles.length,
        stoppedVehicles: vehicles.length - movingVehicles.length,
        avgSpeed: Math.round(avgSpeed * 10) / 10,
        avgCitySpeed: Math.round(avgSpeed * 10) / 10,
        busiestZone,
        busiestZoneVehicles: maxCount,
        avgCongestion: Math.round(avgCongestion * 100) / 100,
        zones: congestionData,
        vehiclesByType: {
          bus: vehicles.filter((v) => v.type === "bus").length,
          garbage_truck: vehicles.filter((v) => v.type === "garbage_truck").length,
          service: vehicles.filter((v) => v.type === "service").length,
          ambulance: vehicles.filter((v) => v.type === "ambulance").length,
          police: vehicles.filter((v) => v.type === "police").length,
        },
        agent24h,
        revenueSeries7d: revenueSeries,
      },
    });
  });

  /**
   * GET /api/dashboard/agent-mix
   * Real-signal decision mix the agent produced over the last 24h.
   */
  router.get("/agent-mix", (_req: Request, res: Response) => {
    res.json({
      success: true,
      timestamp: Date.now(),
      ...getStats24h(),
      mix: getDecisionMix24h(),
    });
  });

  /**
   * GET /api/dashboard/zone-heatmap
   * Real zone congestion: blends IBB traffic index + IETT bus avg speed +
   * simulator fleet per district. Returns a per-district status usable by
   * the Municipality dashboard without any synthetic cells.
   */
  router.get("/zone-heatmap", async (_req: Request, res: Response) => {
    try {
      const trafficHistory = await ibbClient.getTrafficIndex();
      const latest = trafficHistory[0];
      const cityIndex = latest?.trafficIndex ?? 0; // 1..99

      const buses = await ibbClient.getBusPositions().catch(() => []);
      const vehicles = simulator.getVehicles();

      const zones = ISTANBUL_DISTRICTS.map((d) => {
        const busesHere = buses.filter(
          (b) => detectZone(b.lat, b.lng) === d.name && b.speed > 0,
        );
        const simHere = vehicles.filter((v) => v.zone === d.name && v.speed > 0);
        const speeds = [
          ...busesHere.map((b) => b.speed),
          ...simHere.map((v) => v.speed),
        ];
        const avgSpeedHere = speeds.length > 0
          ? speeds.reduce((s, x) => s + x, 0) / speeds.length
          : 0;
        // congestion 0..1 — higher is worse
        const congestion = avgSpeedHere > 0
          ? Math.max(0, Math.min(1, 1 - avgSpeedHere / 50))
          : Math.min(1, cityIndex / 100);
        let kind: "flowing" | "moderate" | "jam" = "flowing";
        if (congestion >= 0.65) kind = "jam";
        else if (congestion >= 0.4) kind = "moderate";
        return {
          zone: d.name,
          center: d.center,
          congestion: +congestion.toFixed(2),
          avgSpeed: Math.round(avgSpeedHere * 10) / 10,
          sampleSize: speeds.length,
          kind,
        };
      });

      res.json({
        success: true,
        timestamp: Date.now(),
        source: "IBB traffic index + IETT speed + simulator",
        cityWideIndex: cityIndex,
        zones,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * GET /api/dashboard/heatmap
   * Public — congestion heatmap data
   */
  router.get("/heatmap", (_req: Request, res: Response) => {
    const heatmap = getHeatmapData(simulator);

    res.json({
      success: true,
      timestamp: Date.now(),
      count: heatmap.length,
      heatmap,
    });
  });

  /**
   * GET /api/dashboard/payments
   * Public — last 50 payments (includes both real on-chain and simulated)
   */
  router.get("/payments", (_req: Request, res: Response) => {
    // Merge in-memory payments with historical on-chain payments
    const onChainPayments = eventStream.getHistorical().map((p) => ({
      id: `chain_${p.txHash.slice(0, 16)}`,
      txHash: p.txHash,
      from: p.driver,
      endpoint: `/api/traffic/route/${p.fromZone}-${p.toZone}`,
      amount: p.amount,
      timestamp: p.timestamp * 1000 || Date.now(),
      zone: p.fromZone,
      fromZone: p.fromZone,
      toZone: p.toZone,
      vehiclesQueried: p.vehiclesQueried,
      blockNumber: p.blockNumber,
      isReal: true,
    }));

    // Combine: on-chain first, then in-memory, deduplicate by txHash
    const seen = new Set<string>();
    const combined = [];

    for (const p of onChainPayments) {
      if (!seen.has(p.txHash)) {
        seen.add(p.txHash);
        combined.push(p);
      }
    }
    for (const p of payments) {
      if (!seen.has(p.txHash)) {
        seen.add(p.txHash);
        combined.push({ ...p, isReal: false });
      }
    }

    // Sort by timestamp descending
    combined.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      timestamp: Date.now(),
      count: Math.min(combined.length, 50),
      totalQueries,
      totalRevenue: Math.round(totalRevenue * 10000) / 10000,
      onChainPayments: onChainPayments.length,
      payments: combined.slice(0, 50),
    });
  });

  /**
   * GET /api/dashboard/vehicles
   * Public — vehicle positions for the dashboard map (no payment required)
   */
  router.get("/vehicles", (_req: Request, res: Response) => {
    recordQuery();
    const publicData = simulator.getPublicData();

    res.json({
      success: true,
      timestamp: Date.now(),
      count: publicData.length,
      vehicles: publicData,
    });
  });

  /**
   * GET /api/dashboard/contract-stats
   * Public — live on-chain contract statistics
   */
  router.get("/contract-stats", async (_req: Request, res: Response) => {
    try {
      const contractStats = await x402Verifier.getContractStats();
      const historicalCount = eventStream.getCount();

      res.json({
        success: true,
        timestamp: Date.now(),
        contract: {
          address: process.env.CONTRACT_ADDRESS || "0xD117bDB3d1463a1B47561eb74BEa88ebE93B81CF",
          network: "arc-testnet",
          chainId: 5042002,
          ...contractStats,
        },
        historicalPaymentsLoaded: historicalCount,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        error: `Failed to fetch contract stats: ${message}`,
      });
    }
  });

  return router;
}
