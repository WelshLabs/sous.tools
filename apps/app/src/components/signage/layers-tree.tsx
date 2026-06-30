"use client";

import React from "react";
import { ColumnLayoutSlide, SignageBlock } from "@soustools/api-types";
import { ChevronRight, ChevronDown, LayoutGrid, Type } from "lucide-react";

export interface LayersTreeProps {
  activeSlide: ColumnLayoutSlide;
  selectedBlockId?: string | null;
  onSelectBlock: (id: string | null) => void;
}

const TreeNode = ({ block, depth, selectedBlockId, onSelectBlock }: { block: SignageBlock, depth: number, selectedBlockId?: string | null, onSelectBlock: (id: string | null) => void }) => {
  const [expanded, setExpanded] = React.useState(true);
  const isSelected = selectedBlockId === block.id;
  const isContainer = ["ColumnBlock", "RowBlock", "GridBlock", "ExplodedItemBlock"].includes(block.type);
  const children = isContainer && block.type !== "GridBlock" 
    ? (block as { blocks?: SignageBlock[] }).blocks || [] 
    : block.type === "GridBlock" 
      ? (block as { cells?: SignageBlock[] }).cells || [] 
      : [];
  
  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300"}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelectBlock(block.id || null)}
      >
        {isContainer ? (
           <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="p-0.5 hover:bg-black/10 dark:bg-white/10 rounded">
             {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
           </button>
        ) : <div className="w-4" />}
        {isContainer ? <LayoutGrid className="w-3 h-3 opacity-50" /> : <Type className="w-3 h-3 opacity-50" />}
        <span className="text-xs">{block.type}</span>
      </div>
      {expanded && isContainer && children.length > 0 && (
        <div className="flex flex-col">
          {children.map(child => (
            <TreeNode key={child.id} block={child} depth={depth + 1} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LayersTree: React.FC<LayersTreeProps> = ({
  activeSlide, selectedBlockId, onSelectBlock
}) => {
  if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return null;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-2">
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2 py-1 mb-1">Root Layout</div>
        {activeSlide.columns[0]?.blocks?.map(block => (
          <TreeNode key={block.id} block={block} depth={0} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} />
        ))}
      </div>
    </div>
  );
};
