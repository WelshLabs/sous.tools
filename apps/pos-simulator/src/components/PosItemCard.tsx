"use client";

import React from "react";
import { type PosItem } from "@soustools/api-types";
import { RotateCw, CheckSquare, Square } from "lucide-react";

export interface PosItemCardProps {
  item: PosItem;
  isUpdating: boolean;
  onToggle: () => void;
}

export const PosItemCard: React.FC<PosItemCardProps> = ({
  item,
  isUpdating,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className={`dark:bg-card flex cursor-pointer items-center justify-between rounded-3xl border border-black/5 bg-white/90 p-4 shadow-sm backdrop-blur-2xl transition-transform select-none active:scale-[0.98] dark:border-white/10 ${
        item.isSoldOut ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground truncate text-sm font-bold">
            {item.name}
          </span>
          <span className="text-success font-mono text-xs font-medium">
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
          <div className="text-destructive bg-destructive/20 border-destructive/50 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold">
            <CheckSquare className="h-4 w-4" /> SOLD OUT
          </div>
        ) : (
          <div className="text-muted-foreground bg-secondary border-border flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
            <Square className="h-4 w-4" /> IN STOCK
          </div>
        )}
      </div>
    </div>
  );
};
