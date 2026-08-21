"use client";

import { Trash2 } from "lucide-react";
import {
  type SignageBlock,
  type PosItem,
  type MenuItemStyles,
  type ColumnLayoutSlide,
  type SignageLayoutConfig,
} from "@soustools/api-types";
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
          function findAncestorExploded(
            root: SignageBlock,
            targetId: string,
          ): SignageBlock | null {
            function traverse(
              current: SignageBlock,
              ancestors: SignageBlock[],
            ): SignageBlock | null {
              if (current.id === targetId) {
                for (let i = ancestors.length - 1; i >= 0; i--) {
                  if (ancestors[i].type === "ExplodedItemBlock") {
                    return ancestors[i];
                  }
                }
                return current.type === "ExplodedItemBlock" ? current : null;
              }
              const children =
                (current as any).blocks || (current as any).cells || [];
              for (const child of children) {
                const found = traverse(child, [...ancestors, current]);
                if (found) return found;
              }
              return null;
            }
            return traverse(root, []);
          }

          for (const col of (activeSlide as ColumnLayoutSlide).columns) {
            for (const b of col.blocks ?? []) {
              const found = findAncestorExploded(b, selectedBlockId);
              if (found) return found;
            }
          }
          return null;
        })()
      : null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-border bg-card/20 flex justify-end border-b px-4 py-3">
        <button
          onClick={handleDeleteBlock}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
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
