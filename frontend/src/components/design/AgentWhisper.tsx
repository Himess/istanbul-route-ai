"use client";

import { HaloDot } from "./HaloDot";
import { SignalBadge } from "./SignalBadge";

interface Props {
  children: React.ReactNode;
  label?: string;
  meta?: string;
  signals?: { e: string; l: string }[];
}

/**
 * Iris-tinted card used ONLY where the Gemini agent has actually reasoned.
 * Never on primary CTAs. Never for decorative purposes.
 */
export function AgentWhisper({ children, label = "Silent agent · Gemini", meta, signals }: Props) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ background: "var(--iris-tint)", borderColor: "oklch(88% 0.04 290)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <HaloDot />
        <div
          className="text-[10px] font-mono tracking-[.14em] uppercase"
          style={{ color: "var(--iris-ink)" }}
        >
          {label}
        </div>
        {meta && <div className="ml-auto text-[10px] font-mono ink-3">{meta}</div>}
      </div>
      <div className="text-[13px] ink leading-relaxed">{children}</div>
      {signals && signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {signals.map((s, i) => (
            <SignalBadge key={i} {...s} active />
          ))}
        </div>
      )}
    </div>
  );
}
