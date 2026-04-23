import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { VehicleSimulator } from "../simulator/vehicleSimulator.js";
import { recordPayment } from "../routes/dashboardRoutes.js";
import { eventStream, ContractPayment } from "../services/eventStream.js";
import { demoSimulator } from "../services/demoSimulator.js";
import { ibbClient } from "../data/ibbClient.js";
import { detectZone } from "../data/istanbulDistricts.js";

interface FleetMarker {
  id: string;
  type: "bus" | "garbage_truck" | "ambulance" | "police" | "service";
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  zone: string;
  status: "moving" | "stopped" | "idle";
  source: "ibb" | "simulator";
  plate?: string;
  operator?: string;
  garage?: string;
}

/**
 * Blends the municipal operations fleet (simulator — garbage trucks, police,
 * ambulances, service vehicles) with the IETT live bus feed when the IBB
 * SOAP endpoint is reachable. Each marker carries an explicit `source`
 * field so the UI can label it honestly in tooltips.
 */
async function collectLiveVehicles(simulator: VehicleSimulator): Promise<FleetMarker[]> {
  const realBuses = await ibbClient.getBusPositions().catch(() => []);
  const liveMapped: FleetMarker[] = realBuses.slice(0, 120).map((b) => ({
    id: `iett-${b.id}`,
    type: "bus",
    plate: b.plate,
    operator: b.operator,
    garage: b.garage,
    lat: b.lat,
    lng: b.lng,
    speed: b.speed,
    heading: 0,
    zone: detectZone(b.lat, b.lng),
    status: b.speed > 2 ? "moving" : "stopped",
    source: "ibb",
  }));
  // Operations fleet (simulator) — garbage trucks, police, ambulances, service.
  // Exclude "bus" type because we rely on the real IETT feed for those.
  const simFleet: FleetMarker[] = simulator
    .getPublicData()
    .filter((v) => v.type !== "bus")
    .map((v) => ({
      id: v.id,
      type: v.type as FleetMarker["type"],
      lat: v.lat,
      lng: v.lng,
      speed: v.speed,
      heading: v.heading,
      zone: v.zone,
      status: v.status as FleetMarker["status"],
      source: "simulator",
    }));
  return [...liveMapped, ...simFleet];
}

const ZONES = [
  "Eminonu",
  "Taksim",
  "Kadikoy",
  "Levent",
  "Bakirkoy",
  "Besiktas",
  "Fatih",
  "Sisli",
  "Beyoglu",
  "Uskudar",
];

const ENDPOINTS = [
  "/api/traffic/vehicles",
  "/api/traffic/zone/Taksim",
  "/api/traffic/zone/Kadikoy",
  "/api/route",
  "/api/traffic/zone/Eminonu",
];

const AMOUNTS = ["0.0001", "0.00005", "0.00005", "0.0005", "0.00005"];

function randomAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

function randomTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function setupWebSocket(
  httpServer: HttpServer,
  simulator: VehicleSimulator,
): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Live IETT positions refreshed every 30s (IBB cache TTL); simulator fleet
  // is read fresh on every emit tick so operations vehicles move smoothly.
  let ibbCache: FleetMarker[] = [];
  async function refreshIbbCache() {
    try {
      const all = await collectLiveVehicles(simulator);
      ibbCache = all.filter((v) => v.source === "ibb");
    } catch {
      ibbCache = [];
    }
  }
  refreshIbbCache();
  setInterval(refreshIbbCache, 30_000);

  function buildSnapshot(): FleetMarker[] {
    const simFleet: FleetMarker[] = simulator
      .getPublicData()
      .filter((v) => v.type !== "bus")
      .map((v) => ({
        id: v.id,
        type: v.type as FleetMarker["type"],
        lat: v.lat,
        lng: v.lng,
        speed: v.speed,
        heading: v.heading,
        zone: v.zone,
        status: v.status as FleetMarker["status"],
        source: "simulator",
      }));
    return [...ibbCache, ...simFleet];
  }

  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);
    socket.emit("vehicle_update", {
      timestamp: Date.now(),
      vehicles: buildSnapshot(),
    });
    socket.on("disconnect", () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // Emit every 2s with a fresh snapshot — simulator fleet animates smoothly.
  setInterval(() => {
    io.emit("vehicle_update", {
      timestamp: Date.now(),
      vehicles: buildSnapshot(),
    });
  }, 2_000);

  // --- Real contract payment events ---
  // When eventStream detects a new on-chain payment, broadcast it
  eventStream.onNewPayment((contractPayment: ContractPayment) => {
    const payment = {
      id: `real_${contractPayment.txHash.slice(0, 16)}_${Date.now()}`,
      txHash: contractPayment.txHash,
      from: contractPayment.driver,
      endpoint: `/api/traffic/route/${contractPayment.fromZone}-${contractPayment.toZone}`,
      amount: contractPayment.amount,
      timestamp: contractPayment.timestamp * 1000 || Date.now(),
      zone: contractPayment.fromZone,
      fromZone: contractPayment.fromZone,
      toZone: contractPayment.toZone,
      vehiclesQueried: contractPayment.vehiclesQueried,
      blockNumber: contractPayment.blockNumber,
      isReal: true,
    };

    // Record in dashboard store
    recordPayment({
      id: payment.id,
      txHash: payment.txHash,
      from: payment.from,
      endpoint: payment.endpoint,
      amount: payment.amount,
      timestamp: payment.timestamp,
      zone: payment.zone,
    });

    // Broadcast to all connected clients
    io.emit("payment", payment);
    console.log(
      `[WS] Real payment broadcast: ${contractPayment.fromZone} -> ${contractPayment.toZone}, ${contractPayment.amount} ETH`,
    );
  });

  // --- Demo simulator payment events ---
  // When demo simulator sends a payment, it shows up via eventStream (on-chain),
  // but we also log the intent here
  demoSimulator.onPayment((info) => {
    console.log(
      `[WS] Demo payment sent: ${info.fromZone} -> ${info.toZone}, tx: ${info.txHash.slice(0, 16)}...`,
    );
  });

  // --- Simulated (fake) payments for visual activity ---
  // These are purely cosmetic and clearly marked as simulated
  function scheduleSimulatedPayment(): void {
    const delay = 5000 + Math.random() * 10000; // 5-15 seconds
    setTimeout(() => {
      const endpointIdx = Math.floor(Math.random() * ENDPOINTS.length);
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];

      const payment = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        txHash: randomTxHash(),
        from: randomAddress(),
        endpoint: ENDPOINTS[endpointIdx],
        amount: AMOUNTS[endpointIdx],
        timestamp: Date.now(),
        zone,
        isReal: false,
      };

      // Record it
      recordPayment({
        id: payment.id,
        txHash: payment.txHash,
        from: payment.from,
        endpoint: payment.endpoint,
        amount: payment.amount,
        timestamp: payment.timestamp,
        zone: payment.zone,
      });

      // Broadcast to all connected clients
      io.emit("payment", payment);

      // Schedule next
      scheduleSimulatedPayment();
    }, delay);
  }

  scheduleSimulatedPayment();

  return io;
}
