export interface MunicipalVehicle {
  id: string;
  type: "bus" | "garbage_truck" | "service" | "ambulance" | "police";
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  zone: string;
  status: "moving" | "stopped" | "idle";
  source?: "ibb" | "simulated";
}

export interface PaymentEvent {
  driver: string;
  amount: string;
  fromZone: string;
  toZone: string;
  vehiclesQueried: number;
  savedMinutes: number;
  timestamp: number;
  txHash?: string;
  isReal?: boolean;
}

export interface NavigationStep {
  distance: number;    // meters
  duration: number;    // seconds
  name: string;        // street name
  instruction: string; // "Turn right onto X", "Continue straight", etc.
}

export interface AgentToolCall {
  round: number;
  name: string;
  args: Record<string, unknown>;
  durationMs: number;
  txHash: string | null;
  txType: "onchain" | "simulated" | "failed";
}

export interface AgentDecision {
  modelId: string;
  chosenRouteIndex: number;
  rationale: string;
  signalsUsed: string[];
  toolCalls: AgentToolCall[];
  totalRounds: number;
  totalToolCalls: number;
  onchainTxCount: number;
  elapsedMs: number;
  error?: string;
}

export interface RouteResult {
  optimizedRoute: [number, number][];
  normalRoute: [number, number][];
  normalTime: number;
  optimizedTime: number;
  savedMinutes: number;
  vehiclesUsed: string[];
  cost: string;
  routeDetails?: {
    normalDistance: number;
    optimizedDistance: number;
    segmentsWithRealData: number;
    dataSource: "osrm" | "grid-fallback";
  };
  steps?: NavigationStep[];
  agent?: AgentDecision | null;
}

export interface DashboardStats {
  totalQueries: number;
  totalRevenue: string;
  activeVehicles: number;
  avgCitySpeed: number;
  busiestZone: string;
  quietestZone: string;
  savedMinutesTotal: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface DashboardEvent {
  type: "payment" | "congestion_change" | "vehicle_zone" | "incident";
  timestamp: number;
  isReal: boolean;
  data: Record<string, unknown>;
}
