"use client";

import type { SignageBlock, PosItem } from "@soustools/api-types";
import { ModifierGroupSettings } from "../modifier-group-settings";
import { PosItemPicker } from "../pos-item-picker";

export function ModifierGroupBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
  onFetchModifierGroups,
  parentExplodedItem,
  items = [],
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
  onFetchModifierGroups?: any;
  parentExplodedItem: SignageBlock | null;
  items?: PosItem[];
}) {
  if (selectedBlock.type !== "ModifierGroupBlock") return null;

  const b = selectedBlock as any;
  const targetPosItemId =
    b.posItemId ||
    (parentExplodedItem && (parentExplodedItem as any).menuItemId) ||
    "";

  return (
    <div className="space-y-3">
      <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
        Contextual Modifiers
      </label>

      {parentExplodedItem && (parentExplodedItem as any).menuItemId ? (
        <div className="rounded border border-cyan-500/20 bg-cyan-950/30 p-2 text-[10px] font-medium text-cyan-400">
          Linked to Parent Exploded Item
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-muted-foreground text-[9px] tracking-wider uppercase">
            Target POS Item
          </label>
          <PosItemPicker
            items={items}
            value={targetPosItemId}
            onChange={(itemId) => {
              onUpdateBlock(selectedBlockId, { posItemId: itemId });
            }}
            placeholder="Select POS item to load modifier groups..."
          />
        </div>
      )}

      {targetPosItemId ? (
        <ModifierGroupSettings
          posItemId={targetPosItemId}
          selectedBlock={selectedBlock}
          selectedBlockId={selectedBlockId}
          onUpdateBlock={onUpdateBlock}
          onFetchModifierGroups={onFetchModifierGroups}
        />
      ) : (
        <div className="text-muted-foreground bg-card border-border rounded border p-2 text-xs italic">
          Select a POS Item above or place this block inside an Exploded Item
          container with a Base POS Item selected.
        </div>
      )}
    </div>
  );
}
