"use client";

import React from "react";
import {
  SignageLayoutConfig,
  ColumnLayoutSlide,
  SignageBlock,
} from "@soustools/api-types";
import { insertBlockIntoTree } from "./block-tree-utils";
import {
  LayoutGrid,
  AlignLeft,
  Image,
  List,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Image as ImageIcon,
  Video,
  GitCommit,
  ListTree,
} from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

export interface AddBlocksPaletteProps {
  selectedBlockId?: string | null;
  selectedBlock?: SignageBlock | null;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  activeSlideIndex: number;
  config: SignageLayoutConfig;
}

const BLOCKS = [
  {
    id: "ColumnBlock",
    label: "Column Container",
    type: "Layout Container",
    icon: AlignLeft,
  },
  {
    id: "RowBlock",
    label: "Row Container",
    type: "Layout Container",
    icon: AlignLeft,
  },
  {
    id: "GridBlock",
    label: "Grid Container",
    type: "Layout Container",
    icon: LayoutGrid,
  },
  {
    id: "CategoryHeaderBlock",
    label: "Category Header",
    type: "Content Block",
    icon: List,
  },
  {
    id: "MenuListBlock",
    label: "Menu List",
    type: "Content Block",
    icon: List,
  },
  {
    id: "ExplodedItemBlock",
    label: "Exploded Item",
    type: "Content Block",
    icon: Image,
  },
  {
    id: "CalloutBlock",
    label: "Callout Panel",
    type: "Content Block",
    icon: AlertTriangle,
  },
  {
    id: "MediaCarouselBlock",
    label: "Media Carousel",
    type: "Content Block",
    icon: Image,
  },
  {
    id: "ModifierGroupBlock",
    label: "Contextual Modifiers",
    type: "Content Block",
    icon: Settings2,
  },
  {
    id: "ImageBlock",
    label: "Static Image",
    type: "Content Block",
    icon: ImageIcon,
  },
  {
    id: "VideoBlock",
    label: "Looping Video",
    type: "Content Block",
    icon: Video,
  },
  {
    id: "TimelineBlock",
    label: "Step Timeline",
    type: "Content Block",
    icon: GitCommit,
  },
  {
    id: "NestedItemBlock",
    label: "Nested Menu Item",
    type: "Content Block",
    icon: ListTree,
  },
];

export const AddBlocksPalette: React.FC<AddBlocksPaletteProps> = ({
  selectedBlockId,
  selectedBlock,
  onUpdateSlide,
  activeSlideIndex,
  config,
}) => {
  const [successId, setSuccessId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleAddBlock = (blockType: string) => {
    setErrorMsg(null);
    if (!selectedBlockId || !selectedBlock)
      return setErrorMsg("Select a container first.");
    if (
      !["ColumnBlock", "RowBlock", "GridBlock", "ExplodedItemBlock"].includes(
        selectedBlock.type,
      )
    ) {
      return setErrorMsg("You can only add blocks inside a Layout Container.");
    }

    const newBlock: SignageBlock = blockType.endsWith("Block")
      ? ({
          id: `block-${Date.now()}`,
          type: blockType as any,
          blocks: [],
          cells: blockType === "GridBlock" ? [] : undefined,
        } as any)
      : ({ id: `block-${Date.now()}`, type: blockType as any } as any);

    const activeSlide = config.slides[activeSlideIndex];
    if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return;

    const newCols = activeSlide.columns.map((col) => ({
      ...col,
      blocks: col.blocks?.map((b) =>
        insertBlockIntoTree(b, selectedBlockId, newBlock),
      ),
    }));

    onUpdateSlide(activeSlideIndex, { columns: newCols });

    setSuccessId(blockType);
    setTimeout(() => setSuccessId(null), 800);
  };

  return (
    <Droppable droppableId="sidebar-blocks" isDropDisabled={true}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex flex-col gap-6 p-4"
        >
          {errorMsg && (
            <div className="p-2 text-xs text-red-400 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> {errorMsg}
            </div>
          )}
          {["Layout Container", "Content Block"].map((group) => (
            <div key={group}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                {group}s
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {BLOCKS.filter((b) => b.type === group).map((block) => {
                  const globalIdx = BLOCKS.findIndex((b) => b.id === block.id);
                  const isSuccess = successId === block.id;
                  return (
                    <Draggable
                      key={block.id}
                      draggableId={`sidebar-add-${block.id}`}
                      index={globalIdx}
                    >
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => handleAddBlock(block.id)}
                          className={`flex flex-col items-center justify-center p-3 gap-2 bg-zinc-100 dark:bg-card border rounded-xl transition-all cursor-grab active:cursor-grabbing group ${
                            isSuccess
                              ? "border-green-500 bg-green-500/10"
                              : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 hover:border-cyan-400/50"
                          } ${snapshot.isDragging ? "shadow-2xl ring-2 ring-cyan-500 scale-105 z-50 bg-zinc-800" : ""}`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="relative">
                              <block.icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-400" />
                            </div>
                          )}
                          <span
                            className={`text-[10px] font-medium text-center leading-tight ${isSuccess ? "text-green-400" : "text-zinc-700 dark:text-zinc-300"}`}
                          >
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
