/**
 * Pure tool functions — no HTTP coupling.
 *
 * Same functions are wrapped by HTTP routes in toolRoutes.ts (for external
 * callers paying via x402) AND invoked directly by the agent orchestrator
 * (which logs each invocation as an x402 settlement for on-chain counting).
 */

import { ibbClient } from "../data/ibbClient.js";
import { weatherClient } from "../data/weatherClient.js";
import { detectZone, ISTANBUL_DISTRICTS } from "../data/istanbulDistricts.js";
import { haversineMeters } from "../services/routeScorer.js";

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
  if (hour >= 7 && hour <= 10) return { isRushHour: true, rushType: "morning", label: "morning rush" };
  if (hour >= 17 && hour <= 20) return { isRushHour: true, rushType: "evening", label: "evening rush" };
  if (hour >= 23 || hour <= 5) return { isRushHour: false, rushType: "none", label: "late night / early morning (light traffic)" };
  return { isRushHour: false, rushType: "none", label: "off-peak" };
}

// ─── Tool: traffic_snapshot ───────────────────────────────────────────────────

export async function toolTrafficSnapshot(args: { zones?: string[] } = {}) {
  const requestedZones = Array.isArray(args.zones) ? args.zones : null;

  const trafficHistory = await ibbClient.getTrafficIndex();
  const latest = trafficHistory[0];
  const current = latest?.trafficIndex ?? 0;
  const avg = trafficHistory.length
    ? trafficHistory.reduce((s, t) => s + t.trafficIndex, 0) / trafficHistory.length
    : 0;

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

  return {
    source: "IBB Open Data (real-time)",
    cityWide: {
      currentIndex: current,
      hourAverage: Math.round(avg * 10) / 10,
      classification: classifyCongestion(current),
    },
    zones,
  };
}

// ─── Tool: iett_density ───────────────────────────────────────────────────────

export async function toolIettDensity(args: { route: [number, number][]; radiusMeters?: number }) {
  const routeGeom = args.route;
  const radius = args.radiusMeters ?? 400;

  if (!Array.isArray(routeGeom) || routeGeom.length < 2) {
    throw new Error("route must be an array of [lat,lng] pairs with length >= 2");
  }

  const buses = await ibbClient.getBusPositions();
  const nearbyBuses = new Set<string>();
  const speeds: number[] = [];

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

  return {
    source: "IETT real-time bus positions (IBB SOAP API)",
    totalBusesNearRoute: nearbyBuses.size,
    avgBusSpeedKmh: avgSpeed !== null ? Math.round(avgSpeed * 10) / 10 : null,
    slowBusFraction: Math.round(slowBusFraction * 100) / 100,
    interpretation: avgSpeed === null
      ? "no bus data — limited transit coverage on this route"
      : avgSpeed < 10 ? "likely heavy congestion on route (buses slow)"
      : avgSpeed < 20 ? "moderate traffic"
      : "free-flowing traffic",
  };
}

// ─── Tool: incidents_on_route ────────────────────────────────────────────────

export async function toolIncidentsOnRoute(args: { route: [number, number][]; bufferMeters?: number }) {
  const routeGeom = args.route;
  const buffer = args.bufferMeters ?? 300;

  if (!Array.isArray(routeGeom) || routeGeom.length < 2) {
    throw new Error("route must be an array of [lat,lng] pairs with length >= 2");
  }

  const incidents = await ibbClient.getTrafficIncidents();
  const hits: typeof incidents = [];

  for (const inc of incidents) {
    for (const [rlat, rlng] of routeGeom) {
      if (haversineMeters(rlat, rlng, inc.lat, inc.lng) <= buffer) {
        hits.push(inc);
        break;
      }
    }
  }

  return {
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
  };
}

// ─── Tool: weather ────────────────────────────────────────────────────────────

export async function toolWeather(args: { lat: number; lng: number }) {
  const weather = await weatherClient.getCurrent(args.lat, args.lng);

  let drivingImpact: "none" | "minor" | "significant" = "none";
  if (weather.isSnowing || weather.precipitation > 5) drivingImpact = "significant";
  else if (weather.isRaining || weather.visibility === "reduced") drivingImpact = "minor";

  return {
    source: "Open-Meteo (real-time)",
    ...weather,
    drivingImpact,
  };
}

// ─── Tool: parking_near_destination ──────────────────────────────────────────

export async function toolParkingNearDestination(args: { lat: number; lng: number; radiusMeters?: number }) {
  const radius = args.radiusMeters ?? 800;
  const allParking = await ibbClient.getParkingData();
  const nearby = allParking.filter((p) => haversineMeters(args.lat, args.lng, p.lat, p.lng) <= radius);

  const openLots = nearby.filter((p) => p.isOpen);
  const totalCap = openLots.reduce((s, p) => s + p.capacity, 0);
  const totalEmpty = openLots.reduce((s, p) => s + p.emptyCapacity, 0);
  const avgOccupancy = totalCap > 0 ? 1 - totalEmpty / totalCap : 0;

  const topOptions = openLots
    .filter((p) => p.emptyCapacity > 0)
    .sort((a, b) => b.emptyCapacity - a.emptyCapacity)
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      district: p.district,
      emptyCapacity: p.emptyCapacity,
      capacity: p.capacity,
      distanceMeters: Math.round(haversineMeters(args.lat, args.lng, p.lat, p.lng)),
    }));

  return {
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
  };
}

// ─── Tool: time_context ───────────────────────────────────────────────────────

export async function toolTimeContext() {
  const now = new Date();
  const istanbulHour = (now.getUTCHours() + 3) % 24;
  const istanbulMinute = now.getUTCMinutes();
  const istanbulDay = now.getUTCDay();
  const isWeekend = istanbulDay === 0 || istanbulDay === 6;
  const hourCtx = getHourContext(istanbulHour);

  return {
    source: "server clock (Istanbul TZ)",
    hour: istanbulHour,
    minute: istanbulMinute,
    dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][istanbulDay],
    isWeekend,
    isRushHour: hourCtx.isRushHour,
    rushType: hourCtx.rushType,
    periodLabel: isWeekend ? `weekend ${hourCtx.label}` : hourCtx.label,
  };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export const TOOL_REGISTRY = {
  traffic_snapshot: toolTrafficSnapshot,
  iett_density: toolIettDensity,
  incidents_on_route: toolIncidentsOnRoute,
  weather: toolWeather,
  parking_near_destination: toolParkingNearDestination,
  time_context: toolTimeContext,
} as const;

export type ToolName = keyof typeof TOOL_REGISTRY;

export async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const handler = (TOOL_REGISTRY as Record<string, (a: any) => Promise<unknown>>)[name];
  if (!handler) throw new Error(`Unknown tool: ${name}`);
  return handler(args);
}
