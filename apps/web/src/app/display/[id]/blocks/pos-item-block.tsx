import React from "react";
import { PosItem, MenuItemStyles } from "@soustools/api-types";
import { MenuItemCard } from "../menu-item-card";

interface PosItemBlockProps {
  posItemId: string;
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
}

export function PosItemBlock({
  posItemId,
  items,
  menuItemStyles,
}: PosItemBlockProps) {
  const item = items.find((i) => i.id === posItemId || i.externalId === posItemId);
  if (!item) {
    return (
      <div className="p-4 border border-dashed border-zinc-800 text-zinc-600 text-xs rounded-xl italic font-mono">
        POS Item not found ({posItemId})
      </div>
    );
  }
  return (
    <MenuItemCard
      item={item}
      menuItemStyles={menuItemStyles}
    />
  );
}
