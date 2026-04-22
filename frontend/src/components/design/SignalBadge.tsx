"use client";

interface Props {
  e: string;
  l: string;
  active?: boolean;
  size?: "sm" | "md";
}

export function SignalBadge({ e, l, active = false, size = "md" }: Props) {
  const pad = size === "sm" ? "py-1 px-2 text-[10px]" : "py-1.5 px-2.5 text-[11px]";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${pad}`}
      style={{
        borderColor: active ? "oklch(88% 0.04 290)" : "var(--line)",
        background: active ? "var(--iris-tint)" : "var(--paper)",
        color: active ? "var(--iris-ink)" : "var(--ink-2)",
      }}
    >
      <span className="leading-none" style={{ fontSize: size === "sm" ? 11 : 12 }}>{e}</span>
      <span className="font-medium">{l}</span>
    </div>
  );
}

/** Map backend signal names to display metadata. */
export const SIGNAL_META: Record<string, { emoji: string; label: string }> = {
  traffic_snapshot:         { emoji: "📊", label: "IBB Traffic" },
  iett_density:             { emoji: "🚌", label: "IETT" },
  incidents_on_route:       { emoji: "🚧", label: "Incidents" },
  weather:                  { emoji: "🌧️", label: "Weather" },
  parking_near_destination: { emoji: "🅿️", label: "ISPARK" },
  time_context:             { emoji: "⏰", label: "Time" },
};

export function badgeForSignal(name: string) {
  return SIGNAL_META[name] ?? { emoji: "•", label: name };
}
