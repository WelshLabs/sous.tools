"use client";

import React from "react";
import { ColumnConfig, PosItem } from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";

interface MenuSlideRendererProps {
  column: ColumnConfig;
  items: PosItem[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
}

export function MenuSlideRenderer({
  column,
  items,
  soldOutBehavior,
}: MenuSlideRendererProps) {
  let activeItems = items;
  if (column.itemIds && column.itemIds.length > 0) {
    activeItems = column.itemIds
      .map((id) => items.find((item) => item.id === id || item.squareId === id))
      .filter((item): item is PosItem => !!item);
  }
  activeItems = activeItems.filter(
    (item) => !(item.isSoldOut && soldOutBehavior === "HIDE"),
  );

  return (
    <div className="w-full h-full min-h-screen p-12 bg-[oklch(0.08_0.01_260)] flex flex-col justify-start">
      <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10 font-brand text-zinc-200">
        Menu Highlights
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto pr-2">
        {activeItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            highlightItems={column.highlightItems}
            soldOutBehavior={soldOutBehavior}
          />
        ))}
      </div>
    </div>
  );
}
