"use client";

import { useEffect, useState, useRef } from "react";
import { WS_URL } from "@/lib/constants";
import type { MunicipalVehicle } from "@/types";

/**
 * Subscribes to backend WebSocket and yields live municipal vehicle positions.
 * Falls back gracefully when the backend is unreachable (demo-safe empty array).
 */
export function useVehicleStream() {
  const [vehicles, setVehicles] = useState<MunicipalVehicle[]>([]);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(0);

  useEffect(() => {
    let socket: import("socket.io-client").Socket | null = null;
    let alive = true;

    async function connect() {
      try {
        const { io } = await import("socket.io-client");
        socket = io(WS_URL, {
          transports: ["websocket", "polling"],
          reconnectionAttempts: 5,
          timeout: 8000,
        });
        socket.on("connect", () => { if (alive) { setConnected(true); retryRef.current = 0; } });
        socket.on("disconnect", () => { if (alive) setConnected(false); });
        socket.on("vehicle_update", (data: MunicipalVehicle[]) => {
          if (alive) setVehicles(data.slice(0, 80));
        });
      } catch {
        // socket.io-client not installed — skip
      }
    }
    connect();

    return () => {
      alive = false;
      socket?.disconnect();
    };
  }, []);

  return { vehicles, connected };
}
