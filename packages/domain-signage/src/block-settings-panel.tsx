"use client";

import { Trash2 } from "lucide-react";
import {
  type SignageBlock,
  type PosItem,
  type MenuItemStyles,
  type ColumnLayoutSlide,
} from "@soustools/api-types";
import { type SignageLayoutConfig } from "@soustools/api-types";
import { BlockTypeConfigFields } from "./block-type-config-fields";

export interface BlockSettingsPanelProps {
  selectedBlockId: string;
  selectedBlock: SignageBlock;
  onUpdateBlock: (blockId: string, updates: Partial<SignageBlock>) => void;
  onDeleteBlock: () => void;
  items?: PosItem[];
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onFetchModifierGroups?: (
    posItemId: string,
  ) => Promise<Array<{ id: string; name: string }>>;
}

/** Container: Block settings inspector panel for the right sidebar. */
export function BlockSettingsPanel({
  selectedBlockId,
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock: handleDeleteBlock,
  items = [],
  onFetchModifierGroups,
  config,
  activeSlideIndex,
}: BlockSettingsPanelProps) {
  const handleUpdateBlockStyles = (s: MenuItemStyles): void => {
    onUpdateBlock(selectedBlockId, { styles: s } as Partial<SignageBlock>);
  };

  const activeSlide = config?.slides?.[activeSlideIndex];
  const parentExplodedItem =
    activeSlide?.type === "COLUMN_LAYOUT"
      ? (() => {
          function find(
            block: SignageBlock,
            childId: string,
          ): SignageBlock | null {
            if (!("blocks" in block)) return null;
            for (const b of (block as { blocks?: SignageBlock[] }).blocks ??
              []) {
              if (b.id === childId) return block;
              const found = find(b, childId);
              if (found) return found;
            }
            return null;
          }
          for (const col of (activeSlide as ColumnLayoutSlide).columns) {
            for (const b of col.blocks ?? []) {
              if (b.id === selectedBlockId)
                return b.type === "ExplodedItemBlock" ? b : null;
              const found = find(b, selectedBlockId);
              if (found?.type === "ExplodedItemBlock") return found;
            }
          }
          return null;
        })()
      : null;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0 relative">
      <div className="px-4 py-3 flex justify-end border-b border-border bg-card/20">
        <button
          onClick={handleDeleteBlock}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Block
        </button>
      </div>
      <BlockTypeConfigFields
        selectedBlockId={selectedBlockId}
        selectedBlock={selectedBlock}
        onUpdateBlock={onUpdateBlock}
        items={items}
        onFetchModifierGroups={onFetchModifierGroups}
        handleUpdateBlockStyles={handleUpdateBlockStyles}
        parentExplodedItem={parentExplodedItem}
        config={config}
      />
    </div>
  );
}
