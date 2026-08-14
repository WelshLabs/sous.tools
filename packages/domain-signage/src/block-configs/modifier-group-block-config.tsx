"use client";

import type { SignageBlock } from "@soustools/api-types";
import { ModifierGroupSettings } from "../modifier-group-settings";

export function ModifierGroupBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
  onFetchModifierGroups,
  parentExplodedItem,
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
  onFetchModifierGroups?: any;
  parentExplodedItem: SignageBlock | null;
}) {
  if (selectedBlock.type !== "ModifierGroupBlock") return null;

  return (
    <div className="space-y-3">
      <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
        Contextual Modifiers
      </label>
      {!parentExplodedItem ||
      parentExplodedItem.type !== "ExplodedItemBlock" ||
      !(parentExplodedItem as any).menuItemId ? (
        <div className="text-muted-foreground bg-card border-border rounded border p-2 text-xs italic">
          This block must be placed inside an Exploded Item container with a
          Base POS Item selected.
        </div>
      ) : (
        <ModifierGroupSettings
          posItemId={(parentExplodedItem as any).menuItemId}
          selectedBlock={selectedBlock}
          selectedBlockId={selectedBlockId}
          onUpdateBlock={onUpdateBlock}
          onFetchModifierGroups={onFetchModifierGroups}
        />
      )}
    </div>
  );
}
