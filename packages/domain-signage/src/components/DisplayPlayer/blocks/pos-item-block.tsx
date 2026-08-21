import { type PosItem, type MenuItemStyles } from "@soustools/api-types";
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
  const item = items.find(
    (i) => i.id === posItemId || i.externalId === posItemId,
  );
  if (!item) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-4 font-mono text-xs text-zinc-600 italic">
        POS Item not found ({posItemId})
      </div>
    );
  }
  return <MenuItemCard item={item} menuItemStyles={menuItemStyles} />;
}
