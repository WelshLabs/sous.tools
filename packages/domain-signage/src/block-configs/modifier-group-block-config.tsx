"use client";
import React from "react";
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
      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
        Contextual Modifiers
      </label>
      {(!parentExplodedItem ||
        parentExplodedItem.type !== "ExplodedItemBlock" ||
        !(parentExplodedItem as any).menuItemId) ? (
        <div className="text-xs text-muted-foreground p-2 italic bg-card rounded border border-border">
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
