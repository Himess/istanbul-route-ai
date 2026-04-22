"use client";

import { ReactNode } from "react";

/**
 * Constrains mobile-first screens to a phone-width frame on desktop,
 * and fills the viewport on actual mobile devices. Keeps a soft ivory
 * backdrop around the phone frame on wide screens so the design never
 * looks "empty" on a 1920px monitor.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 w-screen h-[100dvh] overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% -10%, oklch(96% 0.022 290), transparent 60%)," +
          "radial-gradient(900px 700px at 50% 120%, oklch(96% 0.025 75), transparent 55%)," +
          "var(--ivory-2)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="relative bg-ivory overflow-hidden shadow-4"
          style={{
            width: "min(100vw, 440px)",
            height: "min(100dvh, 900px)",
            borderRadius: "clamp(0px, calc((100vw - 440px) * 999), 36px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
