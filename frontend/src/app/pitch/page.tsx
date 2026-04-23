"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SLIDES } from "./slides";

export default function PitchDeck() {
  const [index, setIndex] = useState(0);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    setIndex(clamped);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${clamped + 1}`);
    }
  }, []);

  useEffect(() => {
    const hash = Number(window.location.hash.replace("#", ""));
    if (hash > 0 && hash <= SLIDES.length) setIndex(hash - 1);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") go(index + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(index - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(SLIDES.length - 1);
      else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const Slide = SLIDES[index].render;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(1400px 900px at 50% -10%, oklch(96% 0.022 290), transparent 60%)," +
          "radial-gradient(1100px 800px at 50% 120%, oklch(96% 0.025 75), transparent 55%)," +
          "var(--ivory)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div
          className="relative bg-paper rounded-[28px] shadow-4 border border-line-2 overflow-hidden"
          style={{
            width: "min(100vw - 48px, 1280px)",
            aspectRatio: "16 / 9",
            maxHeight: "calc(100vh - 120px)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="absolute inset-0"
            >
              <Slide />
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-4 right-6 text-[11px] font-mono ink-3 tracking-[.14em] uppercase pointer-events-none">
            {String(index + 1).padStart(2, "0")} / {SLIDES.length} · {SLIDES[index].label}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 z-10">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="h-10 px-4 rounded-full bg-paper border border-line-2 text-[13px] font-mono ink-2 shadow-2 disabled:opacity-40"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-1 mx-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: i === index ? "var(--teal)" : "var(--line-2)",
                transform: i === index ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(index + 1)}
          disabled={index === SLIDES.length - 1}
          className="h-10 px-4 rounded-full bg-paper border border-line-2 text-[13px] font-mono ink-2 shadow-2 disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <div className="absolute bottom-5 right-6 text-[10px] font-mono ink-3 tracking-[.12em] uppercase pointer-events-none">
        ← → navigate · F fullscreen
      </div>
    </div>
  );
}
