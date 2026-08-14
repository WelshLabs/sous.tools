"use client";
import * as React from "react";
import type {
  SignageBlock,
  MenuItemStyles,
  PosItem,
} from "@soustools/api-types";

import { Rows, Columns, LayoutGrid } from "lucide-react";

// In order to avoid circular dependency issues, we can import BlockEditorNode here.
import { BlockEditorNode } from "./block-editor-node";

export function renderEmptyState(
  layoutType?: "row" | "column" | "grid",
  block?: any,
  onSelectBlock?: any,
  onAddBlock?: any,
) {
  let Icon = Rows;
  let text = "Click to Add Component";
  if (layoutType === "row") {
    Icon = Rows;
    text = "Empty Row Container";
  } else if (layoutType === "column") {
    Icon = Columns;
    text = "Empty Column Container";
  } else if (layoutType === "grid") {
    Icon = LayoutGrid;
    text = "Empty Grid Cell";
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (block?.id) {
          onSelectBlock(block.id);
          if (onAddBlock) onAddBlock(block.id);
        }
      }}
      className="bg-muted/50 group flex h-full min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-4 transition-all hover:border-cyan-400 hover:bg-cyan-900/20"
    >
      <div className="rounded-full bg-cyan-500/20 p-3 transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>
      <span className="text-muted-foreground mt-3 text-center text-xs font-bold tracking-widest uppercase">
        {text}
      </span>
    </div>
  );
}

export function BlockChildren({
  childrenBlocks = [],
  direction,
  parentType,
  items,
  menuItemStyles,
  onUpdate,
  onAddBlock,
  onSelectBlock,
  selectedBlockId,
  config,
  parentBlock,
}: {
  childrenBlocks?: SignageBlock[];
  direction: "row" | "column" | "grid";
  parentType: "RowBlock" | "ColumnBlock" | "GridBlock" | "ExplodedItemBlock";
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
  onUpdate: (blockId: string, updates: Partial<SignageBlock>) => void;
  onAddBlock?: (parentId: string) => void;
  onSelectBlock: (blockId: string) => void;
  selectedBlockId?: string;
  config?: any;
  parentBlock: any;
}) {
  if (childrenBlocks.length === 0)
    return renderEmptyState(direction, parentBlock, onSelectBlock, onAddBlock);

  return childrenBlocks.map((child, idx) => (
    <React.Fragment key={child.id || idx}>
      <BlockEditorNode
        block={child}
        items={items}
        menuItemStyles={menuItemStyles}
        onUpdate={onUpdate}
        onAddBlock={onAddBlock}
        onSelectBlock={onSelectBlock}
        selectedBlockId={selectedBlockId}
        config={config}
        parentType={parentType}
        index={idx}
      />
      {idx < childrenBlocks.length - 1 && direction !== "grid" && (
        <div
          className={`z-30 flex items-center justify-center bg-transparent transition-colors hover:bg-cyan-500/50 cursor-${direction === "row" ? "col" : "row"}-resize group relative`}
          style={{
            [direction === "row" ? "width" : "height"]: "16px",
            margin: "-8px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startPos = direction === "row" ? e.clientX : e.clientY;
            const prevChild = childrenBlocks[idx];
            const nextChild = childrenBlocks[idx + 1];
            const prevStartGrow = prevChild.sizing?.flexGrow ?? 1;
            const nextStartGrow = nextChild.sizing?.flexGrow ?? 1;

            const handleMove = (moveEvent: PointerEvent) => {
              const currentPos =
                direction === "row" ? moveEvent.clientX : moveEvent.clientY;
              const delta = currentPos - startPos;
              const flexDelta = delta / 50;

              const newPrevGrow = Math.max(0.1, prevStartGrow + flexDelta);
              const newNextGrow = Math.max(0.1, nextStartGrow - flexDelta);

              if (prevChild.id)
                onUpdate(prevChild.id, {
                  sizing: {
                    ...prevChild.sizing,
                    flexGrow: Number(newPrevGrow.toFixed(2)),
                  },
                });
              if (nextChild.id)
                onUpdate(nextChild.id, {
                  sizing: {
                    ...nextChild.sizing,
                    flexGrow: Number(newNextGrow.toFixed(2)),
                  },
                });
            };

            const handleUp = () => {
              window.removeEventListener("pointermove", handleMove);
              window.removeEventListener("pointerup", handleUp);
              document.body.style.cursor = "";
            };

            document.body.style.cursor =
              direction === "row" ? "col-resize" : "row-resize";
            window.addEventListener("pointermove", handleMove);
            window.addEventListener("pointerup", handleUp);
          }}
        >
          <div
            className={`rounded-full bg-cyan-500/0 transition-colors group-hover:bg-cyan-500 ${direction === "row" ? "h-8 w-1" : "h-1 w-8"}`}
          />
        </div>
      )}
    </React.Fragment>
  ));
}
