"use client";

import React from "react";
import { SignageBlock, PosItem, MenuItemStyles, BlockSizing } from "@soustools/api-types";
import { Plus, Rows, Columns, LayoutGrid, GripVertical } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { PreviewContentBlocks } from "./preview-content-blocks";

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

export function getSizingStyles(sizing?: BlockSizing): React.CSSProperties {
  if (!sizing) return {};
  const { width, height, flexBasis, flexGrow, flexShrink, gap, padding, margin } = sizing;
  return {
    ...(width && { width }),
    ...(height && { height }),
    ...(flexBasis && { flexBasis }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(gap && { gap }),
    ...(padding && { padding }),
    ...(margin && { margin }),
  };
}

export function getLayoutClass(direction: "column" | "row" | "grid", panelStyle?: string, className?: string) {
  return [
    direction === "grid"
      ? "grid gap-3 w-full h-full min-h-[100px] min-w-[250px] st-layout-grid p-3 bg-zinc-950/20"
      : `flex flex-${direction === "column" ? "col" : "row"} flex-wrap gap-3 w-full h-full min-h-[100px] min-w-[250px] st-layout-${direction} p-3 bg-zinc-950/20`,
    panelStyle === "glass" ? "st-glass-panel p-4 rounded-2xl" : "",
    className
  ].filter(Boolean).join(" ");
}

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

  const renderEmptyState = (layoutType?: "row" | "column" | "grid") => {
    let Icon = Plus;
    let text = "Click to Add Component";
    if (layoutType === "row") { Icon = Rows; text = "Empty Row Container"; }
    else if (layoutType === "column") { Icon = Columns; text = "Empty Column Container"; }
    else if (layoutType === "grid") { Icon = LayoutGrid; text = "Empty Grid Cell"; }

    return (
      <div
        onClick={(e) => { e.stopPropagation(); if (block.id) { onSelectBlock(block.id); if (onAddBlock) onAddBlock(block.id); } }}
        className="flex flex-col items-center justify-center w-full h-full min-h-[120px] border-2 border-dashed border-white/20 hover:border-cyan-400 bg-black/5 dark:bg-white/5 hover:bg-cyan-900/20 rounded-xl cursor-pointer transition-all group p-4"
      >
        <div className="p-3 bg-cyan-500/20 rounded-full group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <span className="mt-3 text-xs font-bold text-slate-300 uppercase tracking-widest text-center">
          {text}
        </span>
      </div>
    );
  };

  const renderChildren = (children: SignageBlock[] = [], direction: "row" | "column" | "grid", pt: "RowBlock" | "ColumnBlock" | "GridBlock" | "ExplodedItemBlock") => {
    if (children.length === 0) return renderEmptyState(direction);

    return children.map((child, idx) => (
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
          parentType={pt}
          index={idx}
        />
        {idx < children.length - 1 && direction !== "grid" && (
          <div
            className={`flex items-center justify-center bg-transparent hover:bg-cyan-500/50 transition-colors z-30 cursor-${direction === "row" ? "col" : "row"}-resize group relative`}
            style={{
              [direction === "row" ? "width" : "height"]: "16px",
              margin: "-8px",
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const startPos = direction === "row" ? e.clientX : e.clientY;
              const prevChild = children[idx];
              const nextChild = children[idx + 1];
              const prevStartGrow = prevChild.sizing?.flexGrow ?? 1;
              const nextStartGrow = nextChild.sizing?.flexGrow ?? 1;
              
              const handleMove = (moveEvent: PointerEvent) => {
                const currentPos = direction === "row" ? moveEvent.clientX : moveEvent.clientY;
                const delta = currentPos - startPos;
                const flexDelta = delta / 50; // Simple heuristic: 50px = 1 flex unit change
                
                const newPrevGrow = Math.max(0.1, prevStartGrow + flexDelta);
                const newNextGrow = Math.max(0.1, nextStartGrow - flexDelta);
                
                if (prevChild.id) onUpdate(prevChild.id, { sizing: { ...prevChild.sizing, flexGrow: Number(newPrevGrow.toFixed(2)) } });
                if (nextChild.id) onUpdate(nextChild.id, { sizing: { ...nextChild.sizing, flexGrow: Number(newNextGrow.toFixed(2)) } });
              };
              
              const handleUp = () => {
                window.removeEventListener("pointermove", handleMove);
                window.removeEventListener("pointerup", handleUp);
                document.body.style.cursor = "";
              };
              
              document.body.style.cursor = direction === "row" ? "col-resize" : "row-resize";
              window.addEventListener("pointermove", handleMove);
              window.addEventListener("pointerup", handleUp);
            }}
          >
            <div className={`bg-cyan-500/0 group-hover:bg-cyan-500 rounded-full transition-colors ${direction === "row" ? "w-1 h-8" : "h-1 w-8"}`} />
          </div>
        )}
      </React.Fragment>
    ));
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
                {renderChildren(block.blocks || [], "column", block.type)}
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
                {renderChildren(block.blocks || [], "row", block.type)}
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    case "GridBlock":
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
                {cells.length === 0 ? renderEmptyState("grid") : cells.map((child, idx) => (
                  <BlockEditorNode key={child.id || idx} block={child} items={items} menuItemStyles={menuItemStyles} onUpdate={onUpdate} onAddBlock={onAddBlock} onSelectBlock={onSelectBlock} selectedBlockId={selectedBlockId} config={config} parentType={block.type} index={idx} />
                ))}
                {dropProps.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ));
    case "ExplodedItemBlock":
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
                {(!(block as any).hideTitle || !(block as any).hidePrice) && (
                  <div className="flex justify-between items-start">
                    {!(block as any).hideTitle && <span className="font-bold text-lg text-white tracking-wide uppercase">{explodedItem.name}</span>}
                    {!(block as any).hidePrice && <span className="font-mono text-cyan-400 font-bold ml-auto">${Number(explodedItem.price).toFixed(2)}</span>}
                  </div>
                )}
                {!(block as any).hideDescription && explodedItem.description && <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{explodedItem.description}</span>}
              </>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 italic">Select a base POS item from Block Settings</span>
            )}
          </div>
          
          <MenuItemContext.Provider value={block.menuItemId || null}>
            <Droppable droppableId={block.id!} type="BLOCK" direction="vertical">
              {(dropProps) => (
                <div ref={dropProps.innerRef} {...dropProps.droppableProps} className="flex flex-col gap-3 flex-1 w-full h-full p-3 bg-zinc-950/20 min-h-[100px] min-w-[100px]" onClick={handleSelect}>
                  {renderChildren(block.blocks || [], "column", block.type)}
                  {dropProps.placeholder}
                </div>
              )}
            </Droppable>
          </MenuItemContext.Provider>
        </div>
      ));
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
