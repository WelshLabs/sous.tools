"use client";

import React from "react";
import { type ColumnConfig, type SignageBlock, type PosItem, type MenuItemStyles } from "@soustools/api-types";
import { ColumnEmptyView } from "./column-empty-view";
import { ColumnContentView } from "./column-content-view";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";
import { BlockEditorNode } from "./block-editor-node";

interface PreviewColumnEditorProps {
  column: ColumnConfig;
  items: PosItem[];
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  menuItemStyles?: MenuItemStyles;
  isPreviewing?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onAddBlock?: (parentId: string) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
}

export const PreviewColumnEditor: React.FC<PreviewColumnEditorProps> = ({
  column, items, onUpdate, menuItemStyles, isPreviewing = false,
  selectedBlockId, onSelectBlock, onAddBlock, onUpdateBlock
}) => {
  const styles = menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES;

  const renderContent = () => {
    if (column.blocks && column.blocks.length > 0) {
      if (!isPreviewing && onSelectBlock && onAddBlock && onUpdateBlock) {
        return (
          <div className="w-full h-full flex flex-col gap-2 py-1">
            {column.blocks.map((block) => (
              <BlockEditorNode
                key={block.id || Math.random().toString()}
                block={block}
                items={items}
                menuItemStyles={styles}
                onSelectBlock={onSelectBlock}
                onAddBlock={onAddBlock}
                onUpdate={onUpdateBlock}
                selectedBlockId={selectedBlockId ?? undefined}
                isRoot
              />
            ))}
          </div>
        );
      }
      return <ColumnContentView column={column} items={items} menuItemStyles={styles} />;
    }

    if (column.type === "EMPTY") {
      return <ColumnEmptyView onUpdate={onUpdate} onOpenEditor={() => {}} />;
    }

    return <ColumnContentView column={column} items={items} menuItemStyles={styles} />;
  };

  return (
    <div className={`relative group flex flex-col h-full overflow-hidden ${
      isPreviewing ? "bg-transparent border-none" : "bg-transparent border border-dashed border-black/10 dark:border-white/10 hover:border-white/20 min-h-[200px] rounded-xl"
    }`}>
      <div className={`flex-1 flex flex-col justify-center ${isPreviewing ? "p-0" : "p-3"}`}>
        {renderContent()}
      </div>
    </div>
  );
};
