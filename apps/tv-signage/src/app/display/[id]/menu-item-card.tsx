"use client";

import React from "react";
import { PosItem, HighlightItemConfig } from "@soustools/api-types";

export interface MenuItemCardProps {
  item: PosItem;
  highlightItems?: (string | HighlightItemConfig)[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
  customClassOverrides?: Record<string, string>;
}

export function MenuItemCard({
  item,
  highlightItems,
  soldOutBehavior,
  customClassOverrides,
}: MenuItemCardProps) {
  const isHighlighted = highlightItems?.some((h) => {
    if (!h) return false;
    if (typeof h === "string") {
      return (
        h === item.id ||
        h === item.squareId ||
        h.toLowerCase() === item.name.toLowerCase()
      );
    }
    return h.itemId === item.id || h.itemId === item.squareId;
  });

  let itemClasses =
    "p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between border ";
  if (isHighlighted) {
    itemClasses +=
      "bg-white/10 border-[oklch(0.60_0.25_250)]/40 shadow-[0_0_20px_-3px_oklch(0.60_0.25_250)] scale-[1.02] ";
  } else {
    itemClasses += "bg-white/5 border-white/5 ";
  }

  if (item.isSoldOut) {
    if (soldOutBehavior === "STRIKE") {
      itemClasses += "line-through opacity-40 ";
    } else if (soldOutBehavior === "GRAY_OUT") {
      itemClasses += "grayscale opacity-50 ";
    }
  }

  if (customClassOverrides) {
    const override =
      customClassOverrides[item.id] ||
      customClassOverrides[item.squareId];
    if (override) {
      itemClasses += ` ${override}`;
    }
  }

  return (
    <div className={itemClasses}>
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3
            className="text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--menu-title-font)", color: "var(--menu-title-color)" }}
          >
            {item.name}
          </h3>
          <span
            className="text-lg font-extrabold text-[oklch(0.70_0.25_150)] whitespace-nowrap"
            style={{ fontFamily: "var(--menu-price-font)", color: "var(--menu-price-color)" }}
          >
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p
            className="text-sm text-zinc-400 line-clamp-2"
            style={{ fontFamily: "var(--menu-description-font)", color: "var(--menu-desc-color)" }}
          >
            {item.description}
          </p>
        )}
      </div>
      {item.isSoldOut && soldOutBehavior === "LABEL" && (
        <div className="mt-4 flex">
          <span className="bg-[oklch(0.60_0.25_25)] text-white text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider">
            Sold Out
          </span>
        </div>
      )}
    </div>
  );
}
