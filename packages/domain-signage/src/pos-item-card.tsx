"use client";

import { type PosItem } from "@soustools/api-types";
import { RotateCw, CheckSquare, Square } from "lucide-react";

/**
 * Props for the PosItemCard component.
 */
export interface PosItemCardProps {
  /** The POS menu item data. */
  item: PosItem;
  /** Whether the item status is currently updating. */
  isUpdating: boolean;
  /** Callback to trigger when the item's sold-out state is toggled. */
  onToggle: () => void;
}

/**
 * PosItemCard renders a single POS menu item card with a toggle for sold out state.
 *
 * @tenant-docs-export
 * Click on a menu item card in the POS simulator to toggle its availability (In Stock or Sold Out).
 * Toggling to In Stock will prompt for stock quantities/unlimited tracking options.
 * Updates are broadcast immediately to active signage screens.
 */
export const PosItemCard: React.FC<PosItemCardProps> = ({
  item,
  isUpdating,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all select-none ${
        item.isSoldOut
          ? "border-red-900/40 bg-red-950/10 opacity-60 hover:opacity-80"
          : "border-[oklch(0.26_0.03_180)] bg-[oklch(0.16_0.02_180)] hover:border-zinc-600"
      }`}
    >
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground truncate text-sm font-bold">
            {item.name}
          </span>
          <span className="font-mono text-xs font-medium text-emerald-400">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 truncate text-xs">
          {item.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isUpdating ? (
          <RotateCw className="text-muted-foreground h-5 w-5 animate-spin" />
        ) : item.isSoldOut ? (
          <div className="flex items-center gap-1.5 rounded-full border border-red-900/50 bg-red-950/40 px-2.5 py-1 text-xs font-bold text-red-400">
            <CheckSquare className="h-4 w-4" /> SOLD OUT
          </div>
        ) : (
          <div className="text-muted-foreground bg-card border-border flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
            <Square className="h-4 w-4" /> IN STOCK
          </div>
        )}
      </div>
    </div>
  );
};
