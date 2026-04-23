"use client";

import { useState } from "react";
import { Wordmark } from "./Wordmark";
import { WalletPill } from "./WalletPill";
import type { WalletDelta } from "./WalletPill";
import { WalletMenu } from "./WalletMenu";

interface Props {
  balance: number;
  delta?: WalletDelta | null;
  tone?: "normal" | "low";
  address?: string | null;
  mode?: "metamask" | "circle" | null;
  onDisconnect?: () => void;
}

export function TopBar({ balance, delta, tone, address, mode, onDisconnect }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="absolute top-[54px] left-0 right-0 z-30 px-4">
        <div className="flex items-center justify-between">
          <div className="bg-paper/85 backdrop-blur-md border border-line-2 rounded-full pl-2.5 pr-3.5 h-9 flex items-center shadow-2">
            <Wordmark />
          </div>
          {address && onDisconnect ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="cursor-pointer"
              aria-label="Wallet menu"
            >
              <WalletPill balance={balance} delta={delta} tone={tone} />
            </button>
          ) : (
            <WalletPill balance={balance} delta={delta} tone={tone} />
          )}
        </div>
      </div>
      {menuOpen && address && onDisconnect && (
        <WalletMenu
          address={address}
          mode={mode ?? null}
          onDisconnect={onDisconnect}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
