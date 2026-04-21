"use client";

import { useState, useMemo } from "react";
import type { AgentDecision } from "@/types";

const SIGNAL_META: Record<string, { label: string; icon: string; color: string }> = {
  traffic_snapshot: { label: "IBB Traffic", icon: "📊", color: "#22D3EE" },
  iett_density: { label: "IETT Buses", icon: "🚌", color: "#22D3EE" },
  incidents_on_route: { label: "Incidents", icon: "🚧", color: "#EF4444" },
  weather: { label: "Weather", icon: "🌦️", color: "#60A5FA" },
  parking_near_destination: { label: "ISPARK", icon: "🅿️", color: "#A855F7" },
  time_context: { label: "Time", icon: "⏰", color: "#94A3B8" },
};

function badgeFor(name: string) {
  const meta = SIGNAL_META[name];
  if (meta) return meta;
  return { label: name, icon: "•", color: "#64748B" };
}

interface Props {
  agent: AgentDecision;
}

export function AgentRationaleCard({ agent }: Props) {
  const [open, setOpen] = useState(false);

  const uniqueSignals = useMemo(() => {
    // Prefer agent.signalsUsed if present (only signals that drove the decision),
    // otherwise fall back to all tool names invoked.
    if (agent.signalsUsed?.length) return Array.from(new Set(agent.signalsUsed));
    return Array.from(new Set(agent.toolCalls.map((t) => t.name)));
  }, [agent.signalsUsed, agent.toolCalls]);

  const paidTxCount = agent.toolCalls.filter((t) => t.txType === "onchain").length;

  return (
    <div className="rounded-[8px] bg-[#0F172A] border border-[#22D3EE]/15 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-[#22D3EE]/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[9px] font-bold text-[#22D3EE] tracking-[1.5px]">
            AGENT
          </span>
          <span className="text-[11px] text-[#CBD5E1] truncate">
            {agent.rationale || "Decision issued"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[9px] text-[#64748B]">
            {agent.totalToolCalls} tx
          </span>
          <span className={`text-[#64748B] text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#1E293B] px-3 py-3 space-y-3">
          {/* Signal badges */}
          <div>
            <div className="font-mono text-[8px] text-[#475569] tracking-[1.5px] mb-1.5">
              SIGNALS USED
            </div>
            <div className="flex flex-wrap gap-1.5">
              {uniqueSignals.length === 0 ? (
                <span className="text-[10px] text-[#64748B] italic">
                  No signals — agent fell back to shortest route
                </span>
              ) : (
                uniqueSignals.map((s) => {
                  const b = badgeFor(s);
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium"
                      style={{
                        backgroundColor: `${b.color}15`,
                        color: b.color,
                        border: `1px solid ${b.color}30`,
                      }}
                    >
                      <span>{b.icon}</span>
                      <span>{b.label}</span>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Tool call trace */}
          <div>
            <div className="font-mono text-[8px] text-[#475569] tracking-[1.5px] mb-1.5">
              TOOL CALLS ({agent.toolCalls.length})
            </div>
            <div className="space-y-1">
              {agent.toolCalls.map((tc, i) => {
                const b = badgeFor(tc.name);
                const txColor =
                  tc.txType === "onchain"
                    ? "#22D3EE"
                    : tc.txType === "simulated"
                    ? "#94A3B8"
                    : "#EF4444";
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[10px] font-mono"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[#64748B] w-4">r{tc.round}</span>
                      <span style={{ color: b.color }}>{b.icon}</span>
                      <span className="text-[#CBD5E1] truncate">{tc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#475569]">{tc.durationMs}ms</span>
                      <span style={{ color: txColor }}>
                        {tc.txType === "onchain"
                          ? tc.txHash?.slice(0, 10) + "…"
                          : tc.txType === "simulated"
                          ? "sim"
                          : "failed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-[9px] font-mono text-[#475569]">
            <span>{agent.modelId}</span>
            <span>
              {agent.totalRounds} rounds · {agent.elapsedMs}ms
              {paidTxCount > 0 && <> · {paidTxCount} on-chain</>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
