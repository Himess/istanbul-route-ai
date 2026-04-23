/**
 * Silent Agent Route Orchestrator.
 *
 * Takes 3 OSRM route alternatives + destination context → invokes Gemini 3
 * Flash with Function Calling → the agent decides which real-time signals to
 * fetch (IETT density, weather, parking, incidents, time context, etc.) →
 * each tool invocation is recorded as a Circle Nanopayment settlement on Arc
 * → the agent submits its final route choice with a short rationale.
 *
 * Design goals:
 *   - No chat. One request in, one decision out.
 *   - Signal choice is adaptive (LLM decides), not hard-coded.
 *   - Every tool call is auditable and pays a real Arc tx.
 *   - Rationale is grounded in specific signals, not generic filler.
 */

import { GoogleGenAI } from "@google/genai";
import type { FunctionCall, Part } from "@google/genai";
import { ROUTE_AGENT_TOOLS } from "./toolSchemas.js";
import { executeTool } from "./tools.js";
import { settleAgentToolCall } from "./agentSettlement.js";
import { recordPayment } from "../routes/dashboardRoutes.js";
import { recordAgentDecision } from "../services/agentStats.js";

const AGENT_ADDRESS_HINT = "0xAgent…";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const MAX_ROUNDS = 6;

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
}

export interface OsrmAlternative {
  index: number;
  distanceMeters: number;
  durationSeconds: number;
  geometrySample: [number, number][]; // downsampled for the prompt
  summary?: string;
}

export interface AgentToolInvocation {
  round: number;
  name: string;
  args: Record<string, unknown>;
  result: unknown;
  durationMs: number;
  txHash: string | null;
  txType: "onchain" | "simulated" | "failed";
}

export interface AgentDecision {
  chosenRouteIndex: number;
  rationale: string;
  signalsUsed: string[];
  toolInvocations: AgentToolInvocation[];
  totalRounds: number;
  totalToolCalls: number;
  onchainTxCount: number;
  modelId: string;
  elapsedMs: number;
  error?: string;
}

const SYSTEM_PROMPT = `You are IstanbulRoute Route Agent, selecting the best driving route in Istanbul.

Your job:
1. Read the candidate routes (up to 3 OSRM alternatives A, B, C).
2. Decide which real-time signals matter FOR THIS TRIP. Call tools adaptively:
   - Skip weather on short city-center hops in clear morning.
   - Skip parking_near_destination if destination is a highway exit.
   - Short trips often only need time_context + iett_density on the winning candidate.
   - Long cross-city trips may need traffic_snapshot + iett_density per candidate.
3. Do NOT call every tool. Be selective. Each call costs $0.0001 USDC — real money.
4. After gathering enough evidence, call submit_decision ONCE with:
   - chosenRouteIndex (0/1/2),
   - rationale: 1–2 sentences referencing SPECIFIC signal values (not "I think A is best"),
   - signalsUsed: the tool names that actually changed your mind.

Rules:
- If signals tie, prefer the shortest OSRM duration.
- If incidents_on_route returns severity 'severe' on a candidate, strongly avoid it.
- Don't call the same tool twice with identical args.
- Never call submit_decision before at least ONE other tool (otherwise you're guessing).
- Keep the rationale concrete: "Route B: IETT bus avg speed 8 km/h on A's corridor vs 24 km/h on B's — traffic is stuck on A."
`;

function routeSummary(alt: OsrmAlternative): string {
  return `Route ${String.fromCharCode(65 + alt.index)} [index=${alt.index}]: ${(alt.distanceMeters / 1000).toFixed(1)} km, ${Math.round(alt.durationSeconds / 60)} min OSRM estimate.${
    alt.summary ? " Summary: " + alt.summary : ""
  }`;
}

export async function runRouteAgent(opts: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  alternatives: OsrmAlternative[];
}): Promise<AgentDecision> {
  const started = Date.now();
  const invocations: AgentToolInvocation[] = [];
  const seenCalls = new Set<string>();

  // Build compact route summaries — pass polyline samples so agent can call
  // route-specific tools (iett_density, incidents_on_route).
  const routesDescription = opts.alternatives
    .map((alt) => routeSummary(alt) + ` geometrySample=${JSON.stringify(alt.geometrySample.slice(0, 20))}`)
    .join("\n");

  const userPrompt = `Origin: (${opts.from.lat}, ${opts.from.lng})
Destination: (${opts.to.lat}, ${opts.to.lng})

Candidate routes:
${routesDescription}

Decide which route to recommend. Use tools only when they would meaningfully change the answer.`;

  const ai = getClient();
  const contents: any[] = [
    { role: "user", parts: [{ text: userPrompt }] },
  ];

  let decision: {
    chosenRouteIndex: number;
    rationale: string;
    signalsUsed: string[];
  } | null = null;

  let round = 0;
  let lastError: string | undefined;

  try {
    while (round < MAX_ROUNDS && !decision) {
      round++;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: ROUTE_AGENT_TOOLS,
          temperature: 0.3,
        },
      });

      // Pull the raw parts from the first candidate so we preserve every
      // field Gemini emitted (including `thoughtSignature`, which Gemini 3
      // Preview REQUIRES to be echoed back verbatim in subsequent turns).
      const candidate = response.candidates?.[0];
      const modelParts: Part[] = (candidate?.content?.parts || []) as Part[];
      const calls: FunctionCall[] = modelParts
        .filter((p): p is Part & { functionCall: FunctionCall } => !!p.functionCall)
        .map((p) => p.functionCall);

      if (calls.length === 0) {
        // No tool call and no decision — agent gave up or returned plain text
        lastError = "Agent returned no tool calls and no decision. Falling back to shortest duration.";
        break;
      }

      // Echo the model's turn verbatim (preserves thoughtSignature on every part)
      contents.push({ role: "model", parts: modelParts });

      // Execute each call (or capture submit_decision and exit)
      const functionResponseParts: any[] = [];

      for (const call of calls) {
        const name = call.name!;
        const args = (call.args || {}) as Record<string, unknown>;

        if (name === "submit_decision") {
          decision = {
            chosenRouteIndex: Number(args.chosenRouteIndex),
            rationale: String(args.rationale ?? "").trim(),
            signalsUsed: Array.isArray(args.signalsUsed) ? (args.signalsUsed as string[]) : [],
          };
          break;
        }

        // Dedupe identical calls (agent guard — stops infinite loops)
        const fingerprint = `${name}::${JSON.stringify(args)}`;
        if (seenCalls.has(fingerprint)) {
          functionResponseParts.push({
            functionResponse: {
              name,
              response: { error: "Duplicate call with same args. Use the prior result." },
            },
          });
          continue;
        }
        seenCalls.add(fingerprint);

        const toolStarted = Date.now();
        let result: unknown;
        let txRecord: { txHash: string | null; txType: "onchain" | "simulated" | "failed" } = {
          txHash: null,
          txType: "simulated",
        };

        try {
          result = await executeTool(name, args);
          txRecord = await settleAgentToolCall(name, args).catch(() => txRecord);
          // Surface successful on-chain settlements in the Municipality feed.
          if (txRecord.txType === "onchain" && txRecord.txHash) {
            recordPayment({
              id: `agent_${txRecord.txHash.slice(2, 12)}_${Date.now()}`,
              txHash: txRecord.txHash,
              from: AGENT_ADDRESS_HINT,
              endpoint: `agent:${name}`,
              amount: "0.0001",
              timestamp: Date.now(),
              zone: "-",
            });
          }
        } catch (err) {
          result = { error: err instanceof Error ? err.message : String(err) };
          txRecord.txType = "failed";
        }

        const toolElapsed = Date.now() - toolStarted;

        invocations.push({
          round,
          name,
          args,
          result,
          durationMs: toolElapsed,
          txHash: txRecord.txHash,
          txType: txRecord.txType,
        });

        functionResponseParts.push({
          functionResponse: { name, response: { result } },
        });
      }

      if (decision) break;

      // Append tool results as a user-role function-response turn
      if (functionResponseParts.length > 0) {
        contents.push({ role: "user", parts: functionResponseParts });
      }
    }
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
  }

  // Fallback: no decision from agent → pick shortest duration
  if (!decision) {
    const shortest = opts.alternatives.reduce((best, cur) =>
      cur.durationSeconds < best.durationSeconds ? cur : best,
    );
    decision = {
      chosenRouteIndex: shortest.index,
      rationale: lastError
        ? `Agent fallback: shortest route selected (${lastError}).`
        : "Agent fallback: shortest duration route selected.",
      signalsUsed: [],
    };
  }

  const onchainTxCount = invocations.filter((i) => i.txType === "onchain").length;

  // Feed the Municipality dashboard's 24h rolling stats.
  recordAgentDecision({
    timestamp: Date.now(),
    chosenRouteIndex: decision.chosenRouteIndex,
    signalsUsed: decision.signalsUsed,
    toolCalls: invocations.length,
    modelId: GEMINI_MODEL,
  });

  return {
    ...decision,
    toolInvocations: invocations,
    totalRounds: round,
    totalToolCalls: invocations.length,
    onchainTxCount,
    modelId: GEMINI_MODEL,
    elapsedMs: Date.now() - started,
    error: lastError,
  };
}
