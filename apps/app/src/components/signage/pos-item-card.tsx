"use client";

import React from "react";
import { PosItem } from "@soustools/api-types";
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
      className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
        item.isSoldOut
          ? "bg-red-950/10 border-red-900/40 opacity-60 hover:opacity-80"
          : "bg-[oklch(0.16_0.02_180)] border-[oklch(0.26_0.03_180)] hover:border-slate-600"
      }`}
    >
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200 truncate">
            {item.name}
          </span>
          <span className="text-xs text-emerald-400 font-mono font-medium">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 truncate">
          {item.description}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isUpdating ? (
          <RotateCw className="w-5 h-5 text-slate-500 animate-spin" />
        ) : item.isSoldOut ? (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-950/40 px-2.5 py-1 rounded-full border border-red-900/50">
            <CheckSquare className="w-4 h-4" /> SOLD OUT
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            <Square className="w-4 h-4" /> IN STOCK
          </div>
        )}
      </div>
    </div>
  );
};
