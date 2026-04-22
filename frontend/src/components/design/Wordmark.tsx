"use client";

export function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center relative"
        style={{
          background:
            "conic-gradient(from 210deg, oklch(60% 0.09 200), oklch(65% 0.1 290), oklch(60% 0.09 200))",
        }}
      >
        <div className="w-[18px] h-[18px] rounded-full bg-paper flex items-center justify-center">
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--teal)" }} />
        </div>
      </div>
      <div className="leading-none">
        <div className="text-[13px] font-semibold ink tracking-tight">Istanbul</div>
        <div className="text-[10px] font-mono ink-3 tracking-[.12em] -mt-[1px]">ROUTE · AI</div>
      </div>
    </div>
  );
}
