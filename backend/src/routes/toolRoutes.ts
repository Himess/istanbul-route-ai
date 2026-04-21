/**
 * Agent tool endpoints — each call is x402-protected ($0.0001 USDC).
 *
 * These endpoints are designed to be invoked by Gemini Function Calling.
 * Every call settles on Arc via Circle Nanopayments, contributing to the
 * hackathon's 50+ on-chain transaction requirement.
 *
 * All responses are structured JSON optimized for LLM consumption.
 */

import { Router, Request, Response } from "express";
import { nanopayToolMiddleware } from "../x402/gatewayMiddleware.js";
import type { PaymentRequest } from "../x402/gatewayMiddleware.js";
import { ibbClient } from "../data/ibbClient.js";
import { weatherClient } from "../data/weatherClient.js";
import { detectZone, ISTANBUL_DISTRICTS } from "../data/istanbulDistricts.js";
import { haversineMeters } from "../services/routeScorer.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInIstanbulBounds(lat: number, lng: number): boolean {
  return lat >= 40.5 && lat <= 41.5 && lng >= 28.5 && lng <= 29.5;
}

function classifyCongestion(index: number): "free" | "moderate" | "heavy" | "severe" {
  if (index < 30) return "free";
  if (index < 55) return "moderate";
  if (index < 75) return "heavy";
  return "severe";
}

function getHourContext(hour: number): {
  isRushHour: boolean;
  rushType: "morning" | "evening" | "none";
  label: string;
} {
  if (hour >= 7 && hour <= 10) {
    return { isRushHour: true, rushType: "morning", label: "morning rush" };
  }
  if (hour >= 17 && hour <= 20) {
    return { isRushHour: true, rushType: "evening", label: "evening rush" };
  }
  if (hour >= 23 || hour <= 5) {
    return { isRushHour: false, rushType: "none", label: "late night / early morning (light traffic)" };
  }
  return { isRushHour: false, rushType: "none", label: "off-peak" };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function createToolRoutes(): Router {
  const router = Router();

  /**
   * POST /api/tools/traffic_snapshot
   * Body: { zones?: string[] }   // optional — filter by district names
   * Returns: Istanbul traffic index + per-zone breakdown.
   */
  router.post("/traffic_snapshot", nanopayToolMiddleware as any, async (req: Request, res: Response) => {
    const requestedZones = Array.isArray(req.body?.zones) ? (req.body.zones as string[]) : null;

    try {
      const trafficHistory = await ibbClient.getTrafficIndex();
      const latest = trafficHistory[0];
      const current = latest?.trafficIndex ?? 0;
      const avg = trafficHistory.length
        ? trafficHistory.reduce((s, t) => s + t.trafficIndex, 0) / trafficHistory.length
        : 0;

      // Zone-level: derive from real bus speeds (buses stuck in traffic = congestion signal)
      const buses = await ibbClient.getBusPositions();
      const zoneMap = new Map<string, { speeds: number[]; count: number }>();

      for (const bus of buses) {
        const zone = detectZone(bus.lat, bus.lng);
        if (!zoneMap.has(zone)) zoneMap.set(zone, { speeds: [], count: 0 });
        const entry = zoneMap.get(zone)!;
        if (bus.speed > 0) entry.speeds.push(bus.speed);
        entry.count++;
      }

      const zones = ISTANBUL_DISTRICTS.map((d) => {
        const info = zoneMap.get(d.name);
        const avgBusSpeed = info?.speeds.length
          ? info.speeds.reduce((s, v) => s + v, 0) / info.speeds.length
          : null;
        // Map bus speed to congestion: 50 km/h+ = free, 5 km/h = jam
        const zoneCongestion = avgBusSpeed !== null
          ? Math.max(0, Math.min(100, Math.round(100 - avgBusSpeed * 2)))
          : null;
        return {
          zone: d.name,
          busSampleSize: info?.count ?? 0,
          avgBusSpeedKmh: avgBusSpeed !== null ? Math.round(avgBusSpeed * 10) / 10 : null,
          congestionIndex: zoneCongestion,
          classification: zoneCongestion !== null ? classifyCongestion(zoneCongestion) : "unknown",
        };
      }).filter((z) => requestedZones === null || requestedZones.includes(z.zone));

      res.json({
        success: true,
        timestamp: Date.now(),
        source: "IBB Open Data (real-time)",
        cityWide: {
          currentIndex: current,
          hourAverage: Math.round(avg * 10) / 10,
          classification: classifyCongestion(current),
        },
        zones,
        payment: (req as PaymentRequest).payment,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: `traffic_snapshot failed: ${message}` });
    }
  });

  /**
   * POST /api/tools/iett_density
   * Body: { route: [[lat,lng], ...], radiusMeters?: 400 }
   * Returns: IETT bus count + avg speed within radius of the given route polyline.
   * Low bus speeds along route = congestion proxy.
   */
  router.post("/iett_density", nanopayToolMiddleware as any, async (req: Request, res: Response) => {
    const routeGeom = req.body?.route as [number, number][] | undefined;
    const radius = (req.body?.radiusMeters as number) || 400;

    if (!Array.isArray(routeGeom) || routeGeom.length < 2) {
      res.status(400).json({ success: false, error: "Required: route as array of [lat,lng] pairs (min length 2)" });
      return;
    }

    try {
      const buses = await ibbClient.getBusPositions();
      const nearbyBuses = new Set<string>();
      const speeds: number[] = [];

      // Sample every Nth point for efficiency
      const sampleStep = Math.max(1, Math.floor(routeGeom.length / 20));
      for (let i = 0; i < routeGeom.length; i += sampleStep) {
        const [rlat, rlng] = routeGeom[i];
        for (const bus of buses) {
          if (nearbyBuses.has(bus.id)) continue;
          const d = haversineMeters(rlat, rlng, bus.lat, bus.lng);
          if (d <= radius) {
            nearbyBuses.add(bus.id);
            if (bus.speed > 0) speeds.push(bus.speed);
          }
        }
      }

      const avgSpeed = speeds.length > 0 ? speeds.reduce((s, v) => s + v, 0) / speeds.length : null;
      const slowBusFraction = speeds.length > 0
        ? speeds.filter((s) => s < 10).length / speeds.length
        : 0;

      res.json({
        success: true,
        timestamp: Date.now(),
        source: "IETT real-time bus positions (IBB SOAP API)",
        totalBusesNearRoute: nearbyBuses.size,
        avgBusSpeedKmh: avgSpeed !== null ? Math.round(avgSpeed * 10) / 10 : null,
        slowBusFraction: Math.round(slowBusFraction * 100) / 100,
        interpretation: avgSpeed === null
          ? "no bus data — limited transit coverage on this route"
          : avgSpeed < 10 ? "likely heavy congestion on route (buses slow)"
          : avgSpeed < 20 ? "moderate traffic"
          : "free-flowing traffic",
        payment: (req as PaymentRequest).payment,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: `iett_density failed: ${message}` });
    }
  });

  /**
   * POST /api/tools/incidents_on_route
   * Body: { route: [[lat,lng], ...], bufferMeters?: 300 }
   * Returns: Active İBB traffic incidents within buffer of the route.
   */
  router.post("/incidents_on_route", nanopayToolMiddleware as any, async (req: Request, res: Response) => {
    const routeGeom = req.body?.route as [number, number][] | undefined;
    const buffer = (req.body?.bufferMeters as number) || 300;

    if (!Array.isArray(routeGeom) || routeGeom.length < 2) {
      res.status(400).json({ success: false, error: "Required: route as array of [lat,lng] pairs (min length 2)" });
      return;
    }

    try {
      const incidents = await ibbClient.getTrafficIncidents();
      const hits: typeof incidents = [];

      for (const inc of incidents) {
        // Check if incident is within buffer of ANY route point
        for (const [rlat, rlng] of routeGeom) {
          if (haversineMeters(rlat, rlng, inc.lat, inc.lng) <= buffer) {
            hits.push(inc);
            break;
          }
        }
      }

      res.json({
        success: true,
        timestamp: Date.now(),
        source: "IBB Open Data — traffic incidents",
        incidentsOnRoute: hits.length,
        severity: hits.length === 0 ? "none"
          : hits.some((i) => i.closedLanes >= 2) ? "severe"
          : hits.length >= 2 ? "high" : "moderate",
        details: hits.slice(0, 5).map((i) => ({
          title: i.title,
          type: i.type,
          closedLanes: i.closedLanes,
          startTime: i.startTime,
        })),
        payment: (req as PaymentRequest).payment,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: `incidents_on_route failed: ${message}` });
    }
  });

  /**
   * POST /api/tools/weather
   * Body: { lat: number, lng: number }
   * Returns: Weather snapshot — rain, wind, visibility implications for driving.
   */
  router.post("/weather", nanopayToolMiddleware as any, async (req: Request, res: Response) => {
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);

    if (isNaN(lat) || isNaN(lng) || !isInIstanbulBounds(lat, lng)) {
      res.status(400).json({ success: false, error: "Required: lat, lng within Istanbul bounds" });
      return;
    }

    try {
      const weather = await weatherClient.getCurrent(lat, lng);

      let drivingImpact: "none" | "minor" | "significant" = "none";
      if (weather.isSnowing || weather.precipitation > 5) drivingImpact = "significant";
      else if (weather.isRaining || weather.visibility === "reduced") drivingImpact = "minor";

      res.json({
        success: true,
        timestamp: Date.now(),
        source: "Open-Meteo (real-time)",
        ...weather,
        drivingImpact,
        payment: (req as PaymentRequest).payment,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: `weather failed: ${message}` });
    }
  });

  /**
   * POST /api/tools/parking_near_destination
   * Body: { lat: number, lng: number, radiusMeters?: 800 }
   * Returns: ISPARK availability near destination — easy-park signal for agent.
   */
  router.post("/parking_near_destination", nanopayToolMiddleware as any, async (req: Request, res: Response) => {
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);
    const radius = (req.body?.radiusMeters as number) || 800;

    if (isNaN(lat) || isNaN(lng) || !isInIstanbulBounds(lat, lng)) {
      res.status(400).json({ success: false, error: "Required: lat, lng within Istanbul bounds" });
      return;
    }

    try {
      const allParking = await ibbClient.getParkingData();
      const nearby = allParking.filter((p) => haversineMeters(lat, lng, p.lat, p.lng) <= radius);

      const openLots = nearby.filter((p) => p.isOpen);
      const totalCap = openLots.reduce((s, p) => s + p.capacity, 0);
      const totalEmpty = openLots.reduce((s, p) => s + p.emptyCapacity, 0);
      const avgOccupancy = totalCap > 0 ? 1 - totalEmpty / totalCap : 0;

      // Pick best 3 options (most empty spots first)
      const topOptions = openLots
        .filter((p) => p.emptyCapacity > 0)
        .sort((a, b) => b.emptyCapacity - a.emptyCapacity)
        .slice(0, 3)
        .map((p) => ({
          name: p.name,
          district: p.district,
          emptyCapacity: p.emptyCapacity,
          capacity: p.capacity,
          distanceMeters: Math.round(haversineMeters(lat, lng, p.lat, p.lng)),
        }));

      res.json({
        success: true,
        timestamp: Date.now(),
        source: "ISPARK live data (IBB)",
        radiusMeters: radius,
        totalLots: nearby.length,
        openLots: openLots.length,
        totalCapacity: totalCap,
        totalAvailable: totalEmpty,
        avgOccupancyRate: Math.round(avgOccupancy * 100) / 100,
        availability:
          totalEmpty === 0 ? "no spots"
          : totalEmpty < 20 ? "scarce"
          : totalEmpty < 100 ? "moderate" : "plenty",
        topOptions,
        payment: (req as PaymentRequest).payment,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: `parking_near_destination failed: ${message}` });
    }
  });

  /**
   * POST /api/tools/time_context
   * Body: (empty or ignored)
   * Returns: Current Istanbul time + rush-hour flag — cheap structural signal.
   */
  router.post("/time_context", nanopayToolMiddleware as any, async (req: Request, res: Response) => {
    const now = new Date();
    // Istanbul = UTC+3
    const istanbulHour = (now.getUTCHours() + 3) % 24;
    const istanbulMinute = now.getUTCMinutes();
    const istanbulDay = now.getUTCDay(); // 0=Sunday, 6=Saturday
    const isWeekend = istanbulDay === 0 || istanbulDay === 6;
    const hourCtx = getHourContext(istanbulHour);

    res.json({
      success: true,
      timestamp: Date.now(),
      source: "server clock (Istanbul TZ)",
      hour: istanbulHour,
      minute: istanbulMinute,
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][istanbulDay],
      isWeekend,
      isRushHour: hourCtx.isRushHour,
      rushType: hourCtx.rushType,
      periodLabel: isWeekend ? `weekend ${hourCtx.label}` : hourCtx.label,
      payment: (req as PaymentRequest).payment,
    });
  });

  return router;
}
