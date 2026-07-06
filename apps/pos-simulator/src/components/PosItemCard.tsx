"use client";

import React from "react";
import { PosItem } from "@soustools/api-types";
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
      className={`p-4 flex items-center justify-between cursor-pointer select-none bg-white/90 dark:bg-card backdrop-blur-2xl rounded-3xl border border-black/5 dark:border-white/10 shadow-sm transition-transform active:scale-[0.98] ${
        item.isSoldOut ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground truncate">
            {item.name}
          </span>
          <span className="text-xs text-success font-mono font-medium">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {item.description}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isUpdating ? (
          <RotateCw className="w-5 h-5 text-muted-foreground animate-spin" />
        ) : item.isSoldOut ? (
          <div className="flex items-center gap-1.5 text-xs text-destructive font-bold bg-destructive/20 px-2.5 py-1 rounded-full border border-destructive/50">
            <CheckSquare className="w-4 h-4" /> SOLD OUT
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
            <Square className="w-4 h-4" /> IN STOCK
          </div>
        )}
      </div>
    </div>
  );
};
