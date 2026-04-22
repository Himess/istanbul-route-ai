"use client";

export function HaloDot({ size = 8 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center halo-dot"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-full" style={{ background: "var(--iris)" }} />
      <span className="absolute inset-0 rounded-full halo-pulse" style={{ background: "var(--iris)" }} />
      <style jsx>{`
        @keyframes haloPulse {
          0%, 100% { transform: scale(1); opacity: .6; }
          50%      { transform: scale(2.4); opacity: 0; }
        }
        .halo-dot :global(.halo-pulse) {
          animation: haloPulse 2s ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}
