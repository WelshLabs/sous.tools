"use client";
import * as React from "react";

import {
  type SignageBlock,
  type PosItem,
  type MenuItemStyles,
} from "@soustools/api-types";
import { Rows, Columns, LayoutGrid, GripVertical } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { getSizingStyles, getLayoutClass } from "./block-node-utils";
import { PreviewContentBlocks } from "./preview-content-blocks";
import { BlockChildren, renderEmptyState } from "./block-children";

interface BlockEditorNodeProps {
  block: SignageBlock;
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
  onUpdate: (blockId: string, updates: Partial<SignageBlock>) => void;
  onAddBlock?: (parentId: string) => void;
  onSelectBlock: (blockId: string) => void;
  selectedBlockId?: string;
  isRoot?: boolean;
  config?: any;
  parentType?: "RowBlock" | "ColumnBlock" | "GridBlock" | "ExplodedItemBlock";
  index?: number;
}

export const MenuItemContext = React.createContext<string | null>(null);

export function BlockEditorNode({
  block,
  items,
  menuItemStyles,
  onUpdate,
  onAddBlock,
  onSelectBlock,
  selectedBlockId,
  isRoot = false,
  config,
  parentType,
  index,
}: BlockEditorNodeProps) {
  const isSelected = selectedBlockId === block.id;
  const sizingStyles = getSizingStyles(block.sizing);

  let childLayoutClasses = "flex-1 min-h-[60px] min-w-[60px]";
  if (parentType === "RowBlock")
    childLayoutClasses = "flex-1 h-full min-w-[60px]";
  else if (parentType === "ColumnBlock" || parentType === "ExplodedItemBlock")
    childLayoutClasses = "flex-1 w-full min-h-[60px]";
  else if (parentType === "GridBlock")
    childLayoutClasses = "w-full h-full min-h-[60px] min-w-[60px]";

  const baseClasses = `relative transition-all border-2 rounded-lg ${
    isSelected
      ? "border-[oklch(0.7_0.15_200)] shadow-[0_0_15px_oklch(0.7_0.15_200/0.5)] z-20"
      : "border-dashed border-border hover:border-white/30 z-10"
  } ${isRoot ? "w-full h-full border-solid border-transparent" : childLayoutClasses}`;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (block.id) onSelectBlock(block.id);
  };

  const renderDraggable = (
    nodeContent: (dragProps?: any) => React.ReactNode,
  ) => {
    if (isRoot || index === undefined) return nodeContent();
    return (
      <Draggable draggableId={block.id!} index={index}>
        {(provided) => nodeContent(provided)}
      </Draggable>
    );
  };

  switch (block.type) {
    case "ColumnBlock":
      return renderDraggable((dragProps) => (
        <div
          ref={dragProps?.innerRef}
          {...dragProps?.draggableProps}
          style={{ ...sizingStyles, ...dragProps?.draggableProps.style }}
          className={`${baseClasses} flex overflow-hidden`}
        >
          <Droppable droppableId={block.id!} type="BLOCK" direction="vertical">
            {(dropProps) => (
              <div
                ref={dropProps.innerRef}
                {...dropProps.droppableProps}
                className={`${getLayoutClass("column", block.panelStyle, block.className)} pt-8`}
                onClick={handleSelect}
              >
                <div className="bg-secondary border-border text-muted-foreground pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-1 rounded-tl-lg rounded-br-lg border-r border-b px-2 py-1 text-[9px] font-bold tracking-wider uppercase">
                  {dragProps && (
                    <div
                      {...dragProps.dragHandleProps}
                      className="hover:bg-background/10 dark:bg-background/10 pointer-events-auto flex cursor-grab items-center justify-center rounded p-0.5 active:cursor-grabbing"
                    >
                      <GripVertical className="h-3 w-3 text-cyan-400" />
                    </div>
                  )}
                  <Columns className="h-3 w-3" /> Column
                </div>
                <BlockChildren
                  childrenBlocks={block.blocks}
                  direction="column"
                  parentType={block.type}
                  items={items}
                  menuItemStyles={menuItemStyles}
                  onUpdate={onUpdate}
                  onAddBlock={onAddBlock}
                  onSelectBlock={onSelectBlock}
                  selectedBlockId={selectedBlockId}
                  config={config}
                  parentBlock={block}
                />
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    case "RowBlock":
      return renderDraggable((dragProps) => (
        <div
          ref={dragProps?.innerRef}
          {...dragProps?.draggableProps}
          style={{ ...sizingStyles, ...dragProps?.draggableProps.style }}
          className={`${baseClasses} flex overflow-hidden`}
        >
          <Droppable
            droppableId={block.id!}
            type="BLOCK"
            direction="horizontal"
          >
            {(dropProps) => (
              <div
                ref={dropProps.innerRef}
                {...dropProps.droppableProps}
                className={`${getLayoutClass("row", block.panelStyle, block.className)} pt-8`}
                onClick={handleSelect}
              >
                <div className="bg-secondary border-border text-muted-foreground pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-1 rounded-tl-lg rounded-br-lg border-r border-b px-2 py-1 text-[9px] font-bold tracking-wider uppercase">
                  {dragProps && (
                    <div
                      {...dragProps.dragHandleProps}
                      className="hover:bg-background/10 dark:bg-background/10 pointer-events-auto flex cursor-grab items-center justify-center rounded p-0.5 active:cursor-grabbing"
                    >
                      <GripVertical className="h-3 w-3 text-cyan-400" />
                    </div>
                  )}
                  <Rows className="h-3 w-3" /> Row
                </div>
                <BlockChildren
                  childrenBlocks={block.blocks}
                  direction="row"
                  parentType={block.type}
                  items={items}
                  menuItemStyles={menuItemStyles}
                  onUpdate={onUpdate}
                  onAddBlock={onAddBlock}
                  onSelectBlock={onSelectBlock}
                  selectedBlockId={selectedBlockId}
                  config={config}
                  parentBlock={block}
                />
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    case "GridBlock": {
      const cells = block.cells || [];
      return renderDraggable((dragProps) => (
        <div
          ref={dragProps?.innerRef}
          {...dragProps?.draggableProps}
          style={{ ...sizingStyles, ...dragProps?.draggableProps.style }}
          className={`${baseClasses} flex overflow-hidden`}
        >
          <Droppable
            droppableId={block.id!}
            type="BLOCK"
            direction="horizontal"
          >
            {(dropProps) => (
              <div
                ref={dropProps.innerRef}
                {...dropProps.droppableProps}
                className={`${getLayoutClass("grid", block.panelStyle, block.className)} pt-8`}
                style={{
                  gridTemplateColumns: `repeat(${block.columns ?? 1}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${block.rows ?? 1}, minmax(0, 1fr))`,
                }}
                onClick={handleSelect}
              >
                <div className="bg-secondary border-border text-muted-foreground pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-1 rounded-tl-lg rounded-br-lg border-r border-b px-2 py-1 text-[9px] font-bold tracking-wider uppercase">
                  {dragProps && (
                    <div
                      {...dragProps.dragHandleProps}
                      className="hover:bg-background/10 dark:bg-background/10 pointer-events-auto flex cursor-grab items-center justify-center rounded p-0.5 active:cursor-grabbing"
                    >
                      <GripVertical className="h-3 w-3 text-cyan-400" />
                    </div>
                  )}
                  <LayoutGrid className="h-3 w-3" /> Grid
                </div>
                {cells.length === 0
                  ? renderEmptyState("grid", block, onSelectBlock, onAddBlock)
                  : cells.map((child, idx) => (
                      <BlockEditorNode
                        key={child.id || idx}
                        block={child}
                        items={items}
                        menuItemStyles={menuItemStyles}
                        onUpdate={onUpdate}
                        onAddBlock={onAddBlock}
                        onSelectBlock={onSelectBlock}
                        selectedBlockId={selectedBlockId}
                        config={config}
                        parentType={block.type}
                        index={idx}
                      />
                    ))}
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    }
    case "ExplodedItemBlock": {
      const explodedItem = block.menuItemId
        ? items.find(
            (i) =>
              i.id === block.menuItemId || i.externalId === block.menuItemId,
          )
        : null;
      return renderDraggable((dragProps) => (
        <div
          ref={dragProps?.innerRef}
          {...dragProps?.draggableProps}
          style={{ ...sizingStyles, ...dragProps?.draggableProps.style }}
          className={`${baseClasses} flex flex-col overflow-hidden`}
        >
          <div
            className="bg-secondary border-border text-muted-foreground pointer-events-auto absolute top-0 left-0 z-30 flex cursor-pointer items-center gap-1 rounded-tl-lg rounded-br-lg border-r border-b px-2 py-1 text-[9px] font-bold tracking-wider uppercase transition-colors hover:bg-zinc-700"
            onClick={(e) => {
              e.stopPropagation();
              onSelectBlock(block.id!);
            }}
          >
            {dragProps && (
              <div
                {...dragProps.dragHandleProps}
                className="hover:bg-background/10 dark:bg-background/10 flex cursor-grab items-center justify-center rounded p-0.5 active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-3 w-3 text-cyan-400" />
              </div>
            )}
            <Columns className="h-3 w-3" /> Exploded Item
          </div>

          <div className="border-border flex flex-col gap-1 border-b px-4 pt-8 pb-2">
            {explodedItem ? (
              <>
                {(!(block as { hideTitle?: boolean }).hideTitle ||
                  !(block as { hidePrice?: boolean }).hidePrice) && (
                  <div className="flex items-start justify-between">
                    {!(block as { hideTitle?: boolean }).hideTitle && (
                      <span className="text-foreground text-lg font-bold tracking-wide uppercase">
                        {explodedItem.name}
                      </span>
                    )}
                    {!(block as { hidePrice?: boolean }).hidePrice && (
                      <span className="ml-auto font-mono font-bold text-cyan-400">
                        ${Number(explodedItem.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
                {!(block as { hideDescription?: boolean }).hideDescription &&
                  explodedItem.description && (
                    <span className="text-muted-foreground text-[10px]">
                      {explodedItem.description}
                    </span>
                  )}
              </>
            ) : (
              <span className="text-muted-foreground text-[10px] font-bold italic">
                Select a base POS item from Block Settings
              </span>
            )}
          </div>

          <MenuItemContext.Provider value={block.menuItemId || null}>
            <Droppable
              droppableId={block.id!}
              type="BLOCK"
              direction="vertical"
            >
              {(dropProps) => (
                <div
                  ref={dropProps.innerRef}
                  {...dropProps.droppableProps}
                  className="bg-background/20 flex h-full min-h-[100px] w-full min-w-[100px] flex-1 flex-col gap-3 p-3"
                  onClick={handleSelect}
                >
                  <BlockChildren
                    childrenBlocks={block.blocks}
                    direction="column"
                    parentType={block.type}
                    items={items}
                    menuItemStyles={menuItemStyles}
                    onUpdate={onUpdate}
                    onAddBlock={onAddBlock}
                    onSelectBlock={onSelectBlock}
                    selectedBlockId={selectedBlockId}
                    config={config}
                    parentBlock={block}
                  />
                  {dropProps.placeholder}
                </div>
              )}
            </Droppable>
          </MenuItemContext.Provider>
        </div>
      ));
    }
    default:
      return renderDraggable((dragProps) => (
        <div
          ref={dragProps?.innerRef}
          {...dragProps?.draggableProps}
          className={`${baseClasses} flex flex-col p-2 pt-8`}
          style={{ ...sizingStyles, ...dragProps?.draggableProps.style }}
          onClick={handleSelect}
        >
          {dragProps && (
            <div className="bg-secondary border-border text-muted-foreground pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-1 rounded-tl-lg rounded-br-lg border-r border-b px-2 py-1 text-[9px] font-bold tracking-wider uppercase">
              <div
                {...dragProps.dragHandleProps}
                className="hover:bg-background/10 dark:bg-background/10 pointer-events-auto flex cursor-grab items-center justify-center rounded p-0.5 active:cursor-grabbing"
              >
                <GripVertical className="h-3 w-3 text-cyan-400" />
              </div>
              <span>Content</span>
            </div>
          )}
          <div className="pointer-events-none relative z-10 flex w-full flex-1 items-center justify-center p-2">
            <PreviewContentBlocks
              block={block}
              items={items}
              styles={menuItemStyles}
              config={config}
            />
          </div>
        </div>
      ));
  }
}
