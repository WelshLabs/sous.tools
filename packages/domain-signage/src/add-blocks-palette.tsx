"use client";

import React from "react";
import { type SignageLayoutConfig, type ColumnLayoutSlide, type SignageBlock } from "@soustools/api-types";
import { insertBlockIntoTree } from "./block-tree-utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BLOCKS } from "./block-palette-items";

export interface AddBlocksPaletteProps {
  selectedBlockId?: string | null;
  selectedBlock?: SignageBlock | null;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  activeSlideIndex: number;
  config: SignageLayoutConfig;
}

export const AddBlocksPalette: React.FC<AddBlocksPaletteProps> = ({
  selectedBlockId, selectedBlock, onUpdateSlide, activeSlideIndex, config,
}) => {
  const [successId, setSuccessId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleAddBlock = (blockType: string) => {
    setErrorMsg(null);
    if (!selectedBlockId || !selectedBlock)
      return setErrorMsg("Select a container first.");
    if (!["ColumnBlock", "RowBlock", "GridBlock", "ExplodedItemBlock"].includes(selectedBlock.type)) {
      return setErrorMsg("You can only add blocks inside a Layout Container.");
    }

    const newBlock: SignageBlock = blockType.endsWith("Block")
      ? ({ id: `block-${Date.now()}`, type: blockType as SignageBlock["type"], blocks: [], cells: blockType === "GridBlock" ? [] : undefined } as SignageBlock)
      : ({ id: `block-${Date.now()}`, type: blockType as SignageBlock["type"] } as SignageBlock);

    const activeSlide = config.slides[activeSlideIndex];
    if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return;

    const newCols = activeSlide.columns.map((col) => ({
      ...col,
      blocks: col.blocks?.map((b) => insertBlockIntoTree(b, selectedBlockId, newBlock)),
    }));

    onUpdateSlide(activeSlideIndex, { columns: newCols });
    setSuccessId(blockType);
    setTimeout(() => setSuccessId(null), 800);
  };

  return (
    <Droppable droppableId="sidebar-blocks" isDropDisabled={true}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-6 p-4">
          {errorMsg && (
            <div className="p-2 text-xs text-red-400 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> {errorMsg}
            </div>
          )}
          {["Layout Container", "Content Block"].map((group) => (
            <div key={group}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{group}s</h3>
              <div className="grid grid-cols-2 gap-2">
                {BLOCKS.filter((b) => b.type === group).map((block) => {
                  const globalIdx = BLOCKS.findIndex((b) => b.id === block.id);
                  const isSuccess = successId === block.id;
                  return (
                    <Draggable key={block.id} draggableId={`sidebar-add-${block.id}`} index={globalIdx}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => handleAddBlock(block.id)}
                          className={`flex flex-col items-center justify-center p-3 gap-2 bg-card border rounded-xl transition-all cursor-grab active:cursor-grabbing group ${isSuccess ? "border-green-500 bg-green-500/10" : "border-border hover:bg-muted/50 hover:border-primary/50"} ${snapshot.isDragging ? "shadow-2xl ring-2 ring-primary scale-105 z-50 bg-secondary" : ""}`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="relative">
                              <block.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                          )}
                          <span className={`text-[10px] font-medium text-center leading-tight ${isSuccess ? "text-green-400" : "text-foreground"}`}>
                            {block.label}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              </div>
            </div>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
