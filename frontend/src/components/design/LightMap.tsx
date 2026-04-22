"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { MunicipalVehicle } from "@/types";

const LIGHT_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    },
  },
  layers: [
    { id: "carto-base", type: "raster", source: "carto", minzoom: 0, maxzoom: 20 },
  ],
};

export interface LightMapProps {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  interactive?: boolean;
  /** Primary route (optimized / post-payment) — drawn in teal. */
  route?: [number, number][];
  /** Baseline route (free OSRM) — drawn faded under primary route. */
  baselineRoute?: [number, number][];
  start?: { lat: number; lng: number } | null;
  end?: { lat: number; lng: number } | null;
  parkingPins?: { lat: number; lng: number; label: string; color: string }[];
  vehicles?: MunicipalVehicle[];
  onMapClick?: (lat: number, lng: number) => void;
  mapClickEnabled?: boolean;
  follow?: boolean;
  className?: string;
}

const VEHICLE_COLOR: Record<string, string> = {
  bus:           "oklch(60% 0.09 200)", // teal
  garbage_truck: "oklch(65% 0.09 155)", // good/green
  service:       "oklch(82% 0.04 75)",  // sand
  ambulance:     "oklch(58% 0.16 30)",  // danger/red
  police:        "oklch(65% 0.1 290)",  // iris
};

export function LightMap({
  center = [28.99, 41.03],
  zoom = 12,
  pitch = 0,
  bearing = 0,
  interactive = true,
  route,
  baselineRoute,
  start,
  end,
  parkingPins,
  vehicles,
  onMapClick,
  mapClickEnabled = false,
  className = "absolute inset-0",
}: LightMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const vehicleMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const clickHandlerRef = useRef<((lat: number, lng: number) => void) | null>(null);
  clickHandlerRef.current = onMapClick ?? null;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: LIGHT_STYLE,
      center,
      zoom,
      pitch,
      bearing,
      interactive,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on("click", (e) => {
      const handler = clickHandlerRef.current;
      if (handler) handler(e.lngLat.lat, e.lngLat.lng);
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle cursor when map-click is armed
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const canvas = map.getCanvas();
    canvas.style.cursor = mapClickEnabled ? "crosshair" : "";
  }, [mapClickEnabled]);

  // Sync camera
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ center, zoom, pitch, bearing, duration: 600 });
  }, [center, zoom, pitch, bearing]);

  // Sync baseline route (faded grey — shown before payment)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const run = () => {
      if (!baselineRoute || baselineRoute.length < 2) {
        if (map.getLayer("baseline-line")) map.removeLayer("baseline-line");
        if (map.getSource("baseline")) map.removeSource("baseline");
        return;
      }
      const data: GeoJSON.Feature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: baselineRoute.map(([lat, lng]) => [lng, lat]),
        },
      };
      if (map.getSource("baseline")) {
        (map.getSource("baseline") as maplibregl.GeoJSONSource).setData(data);
      } else {
        map.addSource("baseline", { type: "geojson", data });
        map.addLayer({
          id: "baseline-line",
          type: "line",
          source: "baseline",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#848893",
            "line-width": 4,
            "line-opacity": 0.55,
            "line-dasharray": [2, 1.4],
          },
        });
      }
    };
    if (map.isStyleLoaded()) run();
    else map.once("load", run);
  }, [baselineRoute]);

  // Sync optimized route line (primary teal — post-payment)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const run = () => {
      if (!route || route.length < 2) {
        if (map.getLayer("route-line")) map.removeLayer("route-line");
        if (map.getLayer("route-line-shadow")) map.removeLayer("route-line-shadow");
        if (map.getSource("route")) map.removeSource("route");
        return;
      }
      const data: GeoJSON.Feature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route.map(([lat, lng]) => [lng, lat]),
        },
      };
      if (map.getSource("route")) {
        (map.getSource("route") as maplibregl.GeoJSONSource).setData(data);
      } else {
        map.addSource("route", { type: "geojson", data });
        map.addLayer({
          id: "route-line-shadow",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#000000", "line-opacity": 0.1, "line-width": 10, "line-blur": 6 },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#1C8490", "line-width": 5, "line-opacity": 0.95 },
        });
      }
    };
    if (map.isStyleLoaded()) run();
    else map.once("load", run);
  }, [route]);

  // Sync municipal vehicles as pulsing dots
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const run = () => {
      const live = vehicles || [];
      const seen = new Set<string>();
      for (const v of live) {
        seen.add(v.id);
        let marker = vehicleMarkersRef.current.get(v.id);
        if (!marker) {
          const el = document.createElement("div");
          const color = VEHICLE_COLOR[v.type] || "oklch(60% 0.09 200)";
          el.style.cssText = [
            "width:12px", "height:12px", "border-radius:999px",
            "border:2px solid rgba(255,255,255,0.95)",
            `background:${color}`,
            "box-shadow:0 2px 6px rgba(20,30,50,.18)",
            "transition:transform 250ms ease-out",
          ].join(";");
          el.className = "irai-vehicle";
          el.title = `${v.type} · ${Math.round(v.speed)} km/h`;
          marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([v.lng, v.lat])
            .addTo(map);
          vehicleMarkersRef.current.set(v.id, marker);
        } else {
          marker.setLngLat([v.lng, v.lat]);
        }
      }
      // remove markers no longer in stream
      for (const [id, m] of vehicleMarkersRef.current.entries()) {
        if (!seen.has(id)) {
          m.remove();
          vehicleMarkersRef.current.delete(id);
        }
      }
    };
    if (map.isStyleLoaded()) run();
    else map.once("load", run);
  }, [vehicles]);

  // Sync start/end markers + parking pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const newMarkers: maplibregl.Marker[] = [];

    const makePin = (color: string, label?: string) => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:22px;height:22px;border-radius:999px;" +
        `background:${color};border:3px solid white;box-shadow:0 4px 12px rgba(20,30,50,.25);` +
        "display:flex;align-items:center;justify-content:center;" +
        "font-family:'JetBrains Mono',monospace;font-weight:600;font-size:10px;color:white;";
      if (label) el.textContent = label;
      return el;
    };

    if (start) {
      const m = new maplibregl.Marker({ element: makePin("oklch(60% 0.09 200)"), anchor: "center" })
        .setLngLat([start.lng, start.lat])
        .addTo(map);
      newMarkers.push(m);
    }
    if (end) {
      const m = new maplibregl.Marker({ element: makePin("oklch(40% 0.09 290)"), anchor: "center" })
        .setLngLat([end.lng, end.lat])
        .addTo(map);
      newMarkers.push(m);
    }
    if (parkingPins) {
      parkingPins.forEach((p) => {
        const m = new maplibregl.Marker({ element: makePin(p.color, p.label), anchor: "center" })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        newMarkers.push(m);
      });
    }
    markersRef.current = newMarkers;
  }, [start, end, parkingPins]);

  // Fit bounds when we have a route (baseline or optimized) + endpoints
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !start || !end) return;
    const geom = (route && route.length >= 2) ? route : baselineRoute;
    if (!geom || geom.length < 2) return;
    const bounds = new maplibregl.LngLatBounds(
      [start.lng, start.lat],
      [start.lng, start.lat],
    );
    geom.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    bounds.extend([end.lng, end.lat]);
    map.fitBounds(bounds, { padding: { top: 140, right: 60, bottom: 360, left: 60 }, duration: 800 });
  }, [route, baselineRoute, start, end]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
