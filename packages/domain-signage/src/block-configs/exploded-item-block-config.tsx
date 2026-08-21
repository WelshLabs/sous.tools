"use client";

import { type SignageBlock, type PosItem } from "@soustools/api-types";
import { PosItemPicker } from "../pos-item-picker";
import { Plus, Sparkles, Layers } from "lucide-react";

export function ExplodedItemBlockConfig({
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
  if (selectedBlock.type !== "ExplodedItemBlock") return null;

  const b = selectedBlock as any;
  const currentItem = items.find(
    (i) => i.id === b.menuItemId || i.externalId === b.menuItemId,
  );

  const handleAddChildBlock = (
    type: "ModifierGroupBlock" | "ColumnBlock" | "RowBlock" | "MenuListBlock",
  ) => {
    const newChild: SignageBlock = {
      id: "block-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      type: type as any,
      blocks: [],
    } as any;
    const currentBlocks = b.blocks || [];
    onUpdateBlock(selectedBlockId, {
      blocks: [...currentBlocks, newChild],
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-muted-foreground block flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Base POS Item
          (Exploded Target)
        </label>
        <PosItemPicker
          items={items}
          value={b.menuItemId}
          onChange={(itemId) => {
            onUpdateBlock(selectedBlockId, {
              menuItemId: itemId,
            });
          }}
          placeholder="Select base item (e.g. Build Your Own Burger)..."
        />
        {currentItem && (
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-cyan-400">
              <span>{currentItem.name}</span>
              <span className="font-mono">
                ${Number(currentItem.price).toFixed(2)}
              </span>
            </div>
            {currentItem.description && (
              <p className="mt-1 line-clamp-2 text-[10px] text-zinc-400">
                {currentItem.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-border space-y-2 border-t pt-3">
        <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
          Display Overrides & Badge
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
              Badge / Pill
            </label>
            <input
              type="text"
              placeholder="e.g. Build Your Own"
              value={b.badge || ""}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { badge: e.target.value })
              }
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
              Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Includes 1 Side"
              value={b.subtitle || ""}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { subtitle: e.target.value })
              }
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={b.hideTitle || false}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { hideTitle: e.target.checked })
              }
              className="border-border bg-background h-3.5 w-3.5 rounded text-cyan-500"
            />
            <span className="text-muted-foreground text-xs">
              Hide Base Item Title
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={b.hidePrice || false}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { hidePrice: e.target.checked })
              }
              className="border-border bg-background h-3.5 w-3.5 rounded text-cyan-500"
            />
            <span className="text-muted-foreground text-xs">
              Hide Base Item Price
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={b.hideDescription || false}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  hideDescription: e.target.checked,
                })
              }
              className="border-border bg-background h-3.5 w-3.5 rounded text-cyan-500"
            />
            <span className="text-muted-foreground text-xs">
              Hide Base Item Description
            </span>
          </label>
        </div>
      </div>

      <div className="border-border space-y-2 border-t pt-3">
        <label className="text-muted-foreground block flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5 text-cyan-400" /> Child Modifiers &
          Sections ({(b.blocks || []).length})
        </label>
        <p className="text-muted-foreground text-[10px]">
          Add modifier groups, step-by-step choices, or column sections inside
          this exploded card:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAddChildBlock("ModifierGroupBlock")}
            className="flex items-center justify-center gap-1 rounded border border-cyan-500/30 bg-cyan-950/30 p-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-900/40"
          >
            <Plus className="h-3.5 w-3.5" /> Modifier Group
          </button>
          <button
            type="button"
            onClick={() => handleAddChildBlock("ColumnBlock")}
            className="border-border bg-card text-foreground hover:bg-muted/50 flex items-center justify-center gap-1 rounded border p-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Inner Column
          </button>
        </div>
      </div>
    </div>
  );
}
