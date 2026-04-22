"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const ITEMS = [
  { name: "Drive", href: "/drive" },
  { name: "Park",  href: "/park" },
  { name: "Card",  href: "/card" },
] as const;

function TabIcon({ name, active }: { name: "Drive" | "Park" | "Card"; active: boolean }) {
  const col = active ? "var(--ink)" : "var(--ink-3)";
  const s = 22;
  if (name === "Drive") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.8" fill={active ? col : "none"} />
      </svg>
    );
  }
  if (name === "Park") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <path d="M10 17V8h3.2a2.6 2.6 0 0 1 0 5.2H10" />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="13" rx="3" />
      <path d="M2.5 10.5h19" />
      <path d="M15 15.5h3" strokeWidth="2.2" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const activeIdx = Math.max(
    0,
    ITEMS.findIndex((i) => pathname === i.href || pathname.startsWith(i.href + "/")),
  );

  return (
    <div className="fixed bottom-[22px] left-0 right-0 z-30 px-4">
      <div className="bg-paper/90 backdrop-blur-xl border border-line-2 rounded-[28px] shadow-3 h-[68px] flex items-center px-2 relative max-w-[420px] mx-auto">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute top-2 bottom-2 rounded-[22px] bg-ivory-2 border border-line"
          style={{
            width: `calc(${100 / ITEMS.length}% - 8px)`,
            left: `calc(${(activeIdx * 100) / ITEMS.length}% + 4px)`,
          }}
        />
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 relative z-10"
            >
              <TabIcon name={item.name} active={active} />
              <div
                className="text-[11px] font-medium"
                style={{ color: active ? "var(--ink)" : "var(--ink-3)" }}
              >
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
