"use client";

import { type SignageBlock, type PosItem } from "@soustools/api-types";
import { PosItemMultiPicker } from "../pos-item-picker";
import { MenuListModifierSettings } from "../menu-list-modifier-settings";

export function MenuListBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
  items = [],
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
  items?: PosItem[];
}) {
  return (
    <>
      {/* MenuList Data Source */}
      {selectedBlock.type === "MenuListBlock" && (
        <div>
          <label className="mb-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={(selectedBlock as any).hideDescriptions || false}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  hideDescriptions: e.target.checked,
                } as any)
              }
              className="border-border bg-background dark:bg-background h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Hide Item Descriptions
            </span>
          </label>
          <label className="text-muted-foreground mb-3 block text-[10px] font-bold tracking-widest uppercase">
            Data Source (POS Items)
          </label>
          <PosItemMultiPicker
            items={items}
            selectedIds={selectedBlock.itemIds || []}
            onChange={(ids) => onUpdateBlock(selectedBlockId, { itemIds: ids })}
            placeholder="Search items..."
          />
          <MenuListModifierSettings
            items={items}
            selectedItemIds={selectedBlock.itemIds || []}
            itemModifiers={(selectedBlock as any).itemModifiers || {}}
            modifierLayout={(selectedBlock as any).modifierLayout || "stacked"}
            onChangeLayout={(layout) =>
              onUpdateBlock(selectedBlockId, {
                modifierLayout: layout,
              } as any)
            }
            onChangeModifiers={(modifiers) =>
              onUpdateBlock(selectedBlockId, {
                itemModifiers: modifiers,
              } as any)
            }
          />
        </div>
      )}

      {/* Category Header */}
    </>
  );
}
