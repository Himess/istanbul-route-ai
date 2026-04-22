"use client";

import { Wordmark } from "./Wordmark";
import { WalletPill } from "./WalletPill";
import type { WalletDelta } from "./WalletPill";

interface Props {
  balance: number;
  delta?: WalletDelta | null;
  tone?: "normal" | "low";
}

export function TopBar({ balance, delta, tone }: Props) {
  return (
    <div className="absolute top-[54px] left-0 right-0 z-30 px-4">
      <div className="flex items-center justify-between">
        <div className="bg-paper/85 backdrop-blur-md border border-line-2 rounded-full pl-2.5 pr-3.5 h-9 flex items-center shadow-2">
          <Wordmark />
        </div>
        <WalletPill balance={balance} delta={delta} tone={tone} />
      </div>
    </div>
  );
}
