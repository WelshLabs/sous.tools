"use client";

import React from "react";
import { PosItem, ColumnConfig } from "@soustools/api-types";

interface PreviewMenuRendererProps {
  column: ColumnConfig;
  items: PosItem[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
}

export const PreviewMenuRenderer: React.FC<PreviewMenuRendererProps> = ({
  column,
  items,
  soldOutBehavior,
}) => {
  const renderPreviewItem = (item: PosItem) => {
    const isHighlighted = column.highlightItems?.some((h) => {
      if (!h) return false;
      if (typeof h === "string") {
        return h === item.id || h === item.squareId || h.toLowerCase() === item.name.toLowerCase();
      }
      return h.itemId === item.id || h.itemId === item.squareId;
    });

    const isSoldOut = item.isSoldOut;
    let itemClasses =
      "p-2 rounded-lg text-left text-[10px] transition-all flex flex-col justify-between h-full min-h-[50px] ";
    if (isHighlighted) {
      itemClasses += "bg-white/10 border border-primary/40 shadow-[0_0_10px_-2px_oklch(0.60_0.25_250)] ";
    } else {
      itemClasses += "bg-white/5 border border-white/5 ";
    }
    if (isSoldOut) {
      if (soldOutBehavior === "STRIKE") itemClasses += "line-through opacity-40 ";
      else if (soldOutBehavior === "GRAY_OUT") itemClasses += "grayscale opacity-50 ";
    }

    return (
      <div key={item.id} className={itemClasses}>
        <div className="space-y-0.5">
          <div className="flex justify-between items-start gap-1">
            <h5 className="font-bold text-white truncate max-w-[70%] text-[10px] leading-tight">
              {item.name}
            </h5>
            <span className="text-emerald-400 font-semibold text-[9px] whitespace-nowrap">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-[8px] text-slate-400 line-clamp-1 leading-normal">{item.description}</p>
          )}
        </div>
        {isSoldOut && soldOutBehavior === "LABEL" && (
          <div className="mt-1 flex">
            <span className="bg-red-600 text-white text-[7px] px-1 py-0.5 rounded font-black uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>
    );
  };

  let activeItems: PosItem[] = [];
  if (column.itemIds && column.itemIds.length > 0) {
    activeItems = column.itemIds
      .map((id) => items.find((item) => item.id === id || item.squareId === id))
      .filter((item): item is PosItem => !!item);
  }
  activeItems = activeItems.filter((item) => !(item.isSoldOut && soldOutBehavior === "HIDE"));

  if (activeItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-[10px] italic">
        No menu items selected
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2.5 bg-[oklch(0.08_0.01_260)] flex flex-col rounded-lg overflow-hidden">
      <h4 className="text-[10px] font-bold text-center mb-1.5 font-brand text-slate-300">Menu</h4>
      <div className="grid grid-cols-3 gap-1.5 overflow-y-auto max-h-[140px] pr-1">
        {activeItems.map(renderPreviewItem)}
      </div>
    </div>
  );
};
