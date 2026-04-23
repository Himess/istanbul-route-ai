/**
 * Rolling 24-hour store for agent behavior — feeds the Municipality dashboard
 * with real numbers instead of hardcoded placeholders.
 *
 * Records every `submit_decision` call the agent makes: which route index it
 * picked, which signals drove the decision, when it happened. From those we
 * compute:
 *   - total decisions in the last 24h
 *   - reroute count (agent chose something other than the shortest OSRM alt)
 *   - signal mix percentages (which tools drove decisions)
 */

export interface AgentRunRecord {
  timestamp: number;
  chosenRouteIndex: number;
  signalsUsed: string[];
  toolCalls: number;
  modelId: string;
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const records: AgentRunRecord[] = [];

function prune(): void {
  const cutoff = Date.now() - MAX_AGE_MS;
  while (records.length > 0 && records[0].timestamp < cutoff) {
    records.shift();
  }
  // Also cap total to avoid memory blow-up over days of uptime
  if (records.length > 5000) records.splice(0, records.length - 5000);
}

export function recordAgentDecision(run: AgentRunRecord): void {
  records.push(run);
  prune();
}

export function getDecisionMix24h(): { signal: string; count: number; pct: number }[] {
  prune();
  const counts = new Map<string, number>();
  let total = 0;
  for (const r of records) {
    for (const s of r.signalsUsed) {
      counts.set(s, (counts.get(s) || 0) + 1);
      total++;
    }
  }
  const mix = Array.from(counts.entries())
    .map(([signal, count]) => ({
      signal,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
  return mix;
}

export function getStats24h() {
  prune();
  // Agent picked alt != 0 (OSRM's default shortest) → counts as a reroute
  const reroutes = records.filter((r) => r.chosenRouteIndex !== 0).length;
  return {
    totalDecisions: records.length,
    rerouteCount: reroutes,
    avgToolCalls: records.length > 0
      ? +(records.reduce((s, r) => s + r.toolCalls, 0) / records.length).toFixed(1)
      : 0,
  };
}

/**
 * 7-day revenue series, bucketed by UTC day. Added to lazily via
 * `recordRevenueDelta`; any older gaps are filled with zeroes on read.
 */
const revenueByDay = new Map<string, number>();

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

export function recordRevenueDelta(amountUsdc: number, ts: number = Date.now()): void {
  const k = dayKey(ts);
  revenueByDay.set(k, (revenueByDay.get(k) || 0) + amountUsdc);
}

export function getRevenueSeries7d(): number[] {
  const out: number[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    out.push(+(revenueByDay.get(dayKey(d.getTime())) || 0).toFixed(6));
  }
  return out;
}
