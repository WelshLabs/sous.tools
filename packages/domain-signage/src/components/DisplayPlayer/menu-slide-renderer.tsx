"use client";

import {
  type ColumnConfig,
  type PosItem,
  type MenuItemStyles,
} from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";

interface MenuSlideRendererProps {
  column: ColumnConfig;
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
}

export function MenuSlideRenderer({
  column,
  items,
  menuItemStyles,
}: MenuSlideRendererProps) {
  let activeItems = items;
  if (column.itemIds && column.itemIds.length > 0) {
    activeItems = column.itemIds
      .map((id) =>
        items.find((item) => item.id === id || item.externalId === id),
      )
      .filter((item): item is PosItem => !!item);
  }
  activeItems = activeItems.filter(
    (item) => !item.isSoldOut || !menuItemStyles.soldOut.hidden,
  );

  return (
    <div className="flex h-full min-h-screen w-full flex-col justify-start bg-[oklch(0.08_0.01_260)] p-12">
      <h2 className="font-brand mb-10 text-center text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-200">
        Menu Highlights
      </h2>
      <div className="grid max-h-[80vh] grid-cols-1 gap-6 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            highlightItems={column.highlightItems}
            menuItemStyles={menuItemStyles}
          />
        ))}
      </div>
    </div>
  );
}
