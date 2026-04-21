/**
 * Function declarations for Gemini Function Calling.
 *
 * Each declaration describes one tool the agent can invoke. Gemini decides
 * which to call based on the user's destination, route options, and prior
 * tool results. Every invocation corresponds to one Circle Nanopayment on Arc.
 */

import { Type } from "@google/genai";
import type { Tool } from "@google/genai";

export const ROUTE_AGENT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "traffic_snapshot",
        description:
          "Get the current Istanbul-wide traffic congestion index from the IBB Open Data feed, plus per-district congestion derived from real IETT bus speeds. " +
          "Call this when you need a macro view of city traffic. Each call is a paid Arc settlement ($0.0001 USDC).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            zones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Optional list of Istanbul district names to filter by (e.g. ['Kadikoy','Uskudar']). Omit to get all districts.",
            },
          },
        },
      },
      {
        name: "iett_density",
        description:
          "Count IETT buses within a radius of the candidate route and report their average speed. Low bus speeds are a strong proxy for car congestion on the same corridor. " +
          "Call once per candidate route you're seriously considering.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            route: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              description: "Array of [lat, lng] pairs defining the route polyline.",
            },
            radiusMeters: {
              type: Type.NUMBER,
              description: "Search radius around the polyline. Default 400.",
            },
          },
          required: ["route"],
        },
      },
      {
        name: "incidents_on_route",
        description:
          "Find active İBB-reported traffic incidents (accidents, roadworks, closures) within a buffer of a candidate route. Returns severity and up to 5 incident details. " +
          "Call when you want to check whether a route is blocked or disrupted.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            route: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              description: "Array of [lat, lng] pairs.",
            },
            bufferMeters: {
              type: Type.NUMBER,
              description: "Buffer distance from route. Default 300.",
            },
          },
          required: ["route"],
        },
      },
      {
        name: "weather",
        description:
          "Current weather at a specific lat/lng. Reports temperature, precipitation, visibility, and a driving-impact classification. " +
          "Call when rain/snow could meaningfully change which route to prefer (e.g. open bridges vs. tunnels).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER, description: "Latitude (must be in Istanbul bounds)." },
            lng: { type: Type.NUMBER, description: "Longitude." },
          },
          required: ["lat", "lng"],
        },
      },
      {
        name: "parking_near_destination",
        description:
          "Check ISPARK live parking availability around the destination. Returns total capacity, available spots, and top 3 options. " +
          "Call once, near the end of deliberation, when the destination is urban and parking may influence recommendation.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            radiusMeters: {
              type: Type.NUMBER,
              description: "Search radius. Default 800.",
            },
          },
          required: ["lat", "lng"],
        },
      },
      {
        name: "time_context",
        description:
          "Returns current Istanbul time, day of week, and whether we're in rush hour. " +
          "Call first if the answer might depend on time-of-day effects; skip if the context is already obvious.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "submit_decision",
        description:
          "Submit the final route selection with rationale. Call this EXACTLY ONCE, as the LAST action, after you have gathered enough signals to justify a choice.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            chosenRouteIndex: {
              type: Type.INTEGER,
              description: "Index of the chosen route (0, 1, or 2) from the candidate list.",
            },
            rationale: {
              type: Type.STRING,
              description:
                "One concise sentence (max 2) explaining WHY this route was chosen, referencing the specific signals that mattered. Avoid generic filler.",
            },
            signalsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Names of the signals / tool results that actually drove the decision (e.g. ['iett_density','weather']). Not the tools you called but then ignored.",
            },
          },
          required: ["chosenRouteIndex", "rationale", "signalsUsed"],
        },
      },
    ],
  },
];
