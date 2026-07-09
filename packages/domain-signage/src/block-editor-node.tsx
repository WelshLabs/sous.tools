"use client";

import React from "react";
import { type SignageBlock, type PosItem, type MenuItemStyles } from "@soustools/api-types";
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
  index
}: BlockEditorNodeProps) {
  const isSelected = selectedBlockId === block.id;
  const sizingStyles = getSizingStyles(block.sizing);

  let childLayoutClasses = "flex-1 min-h-[60px] min-w-[60px]";
  if (parentType === "RowBlock") childLayoutClasses = "flex-1 h-full min-w-[60px]";
  else if (parentType === "ColumnBlock" || parentType === "ExplodedItemBlock") childLayoutClasses = "flex-1 w-full min-h-[60px]";
  else if (parentType === "GridBlock") childLayoutClasses = "w-full h-full min-h-[60px] min-w-[60px]";

  const baseClasses = `relative transition-all border-2 rounded-lg ${
    isSelected ? "border-[oklch(0.7_0.15_200)] shadow-[0_0_15px_oklch(0.7_0.15_200/0.5)] z-20" : "border-dashed border-black/10 dark:border-white/10 hover:border-white/30 z-10"
  } ${isRoot ? "w-full h-full border-solid border-transparent" : childLayoutClasses}`;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (block.id) onSelectBlock(block.id);
  };

  const renderDraggable = (nodeContent: (dragProps?: any) => React.ReactNode) => {
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
        <div ref={dragProps?.innerRef} {...dragProps?.draggableProps} style={{ ...sizingStyles, ...dragProps?.draggableProps.style }} className={`${baseClasses} flex overflow-hidden`}>
          <Droppable droppableId={block.id!} type="BLOCK" direction="vertical">
            {(dropProps) => (
              <div ref={dropProps.innerRef} {...dropProps.droppableProps} className={`${getLayoutClass("column", block.panelStyle, block.className)} pt-8`} onClick={handleSelect}>
                <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-800 border-b border-r border-zinc-700 rounded-br-lg rounded-tl-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1 z-30 pointer-events-none">
                  {dragProps && (
                    <div {...dragProps.dragHandleProps} className="cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center p-0.5 hover:bg-black/10 dark:bg-white/10 rounded">
                      <GripVertical className="w-3 h-3 text-cyan-400" />
                    </div>
                  )}
                  <Columns className="w-3 h-3" /> Column
                </div>
                <BlockChildren childrenBlocks={block.blocks} direction="column" parentType={block.type} items={items} menuItemStyles={menuItemStyles} onUpdate={onUpdate} onAddBlock={onAddBlock} onSelectBlock={onSelectBlock} selectedBlockId={selectedBlockId} config={config} parentBlock={block} />
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    case "RowBlock":
      return renderDraggable((dragProps) => (
        <div ref={dragProps?.innerRef} {...dragProps?.draggableProps} style={{ ...sizingStyles, ...dragProps?.draggableProps.style }} className={`${baseClasses} flex overflow-hidden`}>
          <Droppable droppableId={block.id!} type="BLOCK" direction="horizontal">
            {(dropProps) => (
              <div ref={dropProps.innerRef} {...dropProps.droppableProps} className={`${getLayoutClass("row", block.panelStyle, block.className)} pt-8`} onClick={handleSelect}>
                <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-800 border-b border-r border-zinc-700 rounded-br-lg rounded-tl-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1 z-30 pointer-events-none">
                  {dragProps && (
                    <div {...dragProps.dragHandleProps} className="cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center p-0.5 hover:bg-black/10 dark:bg-white/10 rounded">
                      <GripVertical className="w-3 h-3 text-cyan-400" />
                    </div>
                  )}
                  <Rows className="w-3 h-3" /> Row
                </div>
                <BlockChildren childrenBlocks={block.blocks} direction="row" parentType={block.type} items={items} menuItemStyles={menuItemStyles} onUpdate={onUpdate} onAddBlock={onAddBlock} onSelectBlock={onSelectBlock} selectedBlockId={selectedBlockId} config={config} parentBlock={block} />
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    case "GridBlock": {
      const cells = block.cells || [];
      return renderDraggable((dragProps) => (
        <div ref={dragProps?.innerRef} {...dragProps?.draggableProps} style={{ ...sizingStyles, ...dragProps?.draggableProps.style }} className={`${baseClasses} flex overflow-hidden`}>
          <Droppable droppableId={block.id!} type="BLOCK" direction="horizontal">
            {(dropProps) => (
              <div 
                ref={dropProps.innerRef} 
                {...dropProps.droppableProps} 
                className={`${getLayoutClass("grid", block.panelStyle, block.className)} pt-8`} 
                style={{ gridTemplateColumns: `repeat(${block.columns ?? 1}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${block.rows ?? 1}, minmax(0, 1fr))` }}
                onClick={handleSelect}
              >
                <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-800 border-b border-r border-zinc-700 rounded-br-lg rounded-tl-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1 z-30 pointer-events-none">
                  {dragProps && (
                    <div {...dragProps.dragHandleProps} className="cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center p-0.5 hover:bg-black/10 dark:bg-white/10 rounded">
                      <GripVertical className="w-3 h-3 text-cyan-400" />
                    </div>
                  )}
                  <LayoutGrid className="w-3 h-3" /> Grid
                </div>
                {cells.length === 0 ? renderEmptyState("grid", block, onSelectBlock, onAddBlock) : cells.map((child, idx) => (
                  <BlockEditorNode key={child.id || idx} block={child} items={items} menuItemStyles={menuItemStyles} onUpdate={onUpdate} onAddBlock={onAddBlock} onSelectBlock={onSelectBlock} selectedBlockId={selectedBlockId} config={config} parentType={block.type} index={idx} />
                ))}
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    }
    case "ExplodedItemBlock": {
      const explodedItem = block.menuItemId ? items.find(i => i.id === block.menuItemId || i.externalId === block.menuItemId) : null;
      return renderDraggable((dragProps) => (
        <div ref={dragProps?.innerRef} {...dragProps?.draggableProps} style={{ ...sizingStyles, ...dragProps?.draggableProps.style }} className={`${baseClasses} flex flex-col overflow-hidden`}>
          <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-800 border-b border-r border-zinc-700 rounded-br-lg rounded-tl-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1 z-30 pointer-events-auto cursor-pointer hover:bg-zinc-700 transition-colors" onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id!); }}>
            {dragProps && (
              <div {...dragProps.dragHandleProps} className="cursor-grab active:cursor-grabbing flex items-center justify-center p-0.5 hover:bg-black/10 dark:bg-white/10 rounded" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="w-3 h-3 text-cyan-400" />
              </div>
            )}
            <Columns className="w-3 h-3" /> Exploded Item
          </div>
          
          <div className="pt-8 px-4 pb-2 border-b border-black/5 dark:border-white/5 flex flex-col gap-1">
            {explodedItem ? (
              <>
                {(!(block as { hideTitle?: boolean }).hideTitle || !(block as { hidePrice?: boolean }).hidePrice) && (
                  <div className="flex justify-between items-start">
                    {!(block as { hideTitle?: boolean }).hideTitle && <span className="font-bold text-lg text-white tracking-wide uppercase">{explodedItem.name}</span>}
                    {!(block as { hidePrice?: boolean }).hidePrice && <span className="font-mono text-cyan-400 font-bold ml-auto">${Number(explodedItem.price).toFixed(2)}</span>}
                  </div>
                )}
                {!(block as { hideDescription?: boolean }).hideDescription && explodedItem.description && <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{explodedItem.description}</span>}
              </>
            ) : (
              <span className="text-[10px] font-bold text-zinc-400 italic">Select a base POS item from Block Settings</span>
            )}
          </div>
          
          <MenuItemContext.Provider value={block.menuItemId || null}>
            <Droppable droppableId={block.id!} type="BLOCK" direction="vertical">
              {(dropProps) => (
                <div ref={dropProps.innerRef} {...dropProps.droppableProps} className="flex flex-col gap-3 flex-1 w-full h-full p-3 bg-zinc-950/20 min-h-[100px] min-w-[100px]" onClick={handleSelect}>
                  <BlockChildren childrenBlocks={block.blocks} direction="column" parentType={block.type} items={items} menuItemStyles={menuItemStyles} onUpdate={onUpdate} onAddBlock={onAddBlock} onSelectBlock={onSelectBlock} selectedBlockId={selectedBlockId} config={config} parentBlock={block} />
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
          className={`${baseClasses} p-2 flex flex-col pt-8`} 
          style={{ ...sizingStyles, ...dragProps?.draggableProps.style }} 
          onClick={handleSelect}
        >
          {dragProps && (
            <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-800 border-b border-r border-zinc-700 rounded-br-lg rounded-tl-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1 z-30 pointer-events-none">
               <div {...dragProps.dragHandleProps} className="cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center p-0.5 hover:bg-black/10 dark:bg-white/10 rounded">
                 <GripVertical className="w-3 h-3 text-cyan-400" />
               </div>
               <span>Content</span>
            </div>
          )}
          <div className="flex-1 w-full flex items-center justify-center p-2 relative z-10 pointer-events-none">
            <PreviewContentBlocks block={block} items={items} styles={menuItemStyles} config={config} />
          </div>
        </div>
      ));
  }
}
