"use client";

import React from "react";
import {
  type ColumnLayoutSlide,
  type SignageBlock,
} from "@soustools/api-types";
import { ChevronRight, ChevronDown, LayoutGrid, Type } from "lucide-react";

export interface LayersTreeProps {
  activeSlide: ColumnLayoutSlide;
  selectedBlockId?: string | null;
  onSelectBlock: (id: string | null) => void;
}

const TreeNode = ({
  block,
  depth,
  selectedBlockId,
  onSelectBlock,
}: {
  block: SignageBlock;
  depth: number;
  selectedBlockId?: string | null;
  onSelectBlock: (id: string | null) => void;
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const isSelected = selectedBlockId === block.id;
  const isContainer = [
    "ColumnBlock",
    "RowBlock",
    "GridBlock",
    "ExplodedItemBlock",
  ].includes(block.type);
  const children =
    isContainer && block.type !== "GridBlock"
      ? (block as { blocks?: SignageBlock[] }).blocks || []
      : block.type === "GridBlock"
        ? (block as { cells?: SignageBlock[] }).cells || []
        : [];

  return (
    <div className="flex flex-col">
      <div
        className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors ${isSelected ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-muted/50 text-muted-foreground"}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelectBlock(block.id || null)}
      >
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="hover:bg-background/10 dark:bg-background/10 rounded p-0.5"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}
        {isContainer ? (
          <LayoutGrid className="h-3 w-3 opacity-50" />
        ) : (
          <Type className="h-3 w-3 opacity-50" />
        )}
        <span className="text-xs">{block.type}</span>
      </div>
      {expanded && isContainer && children.length > 0 && (
        <div className="flex flex-col">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              block={child}
              depth={depth + 1}
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LayersTree: React.FC<LayersTreeProps> = ({
  activeSlide,
  selectedBlockId,
  onSelectBlock,
}) => {
  if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return null;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-2">
      <div className="flex flex-col gap-1">
        <div className="text-muted-foreground mb-1 px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
          Root Layout
        </div>
        {activeSlide.columns[0]?.blocks?.map((block) => (
          <TreeNode
            key={block.id}
            block={block}
            depth={0}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
          />
        ))}
      </div>
    </div>
  );
};
