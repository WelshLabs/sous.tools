"use client";

import React, { useState } from "react";
import { SignageBlock, PosItem } from "@soustools/api-types";
import { X, LayoutGrid, Sparkles } from "lucide-react";
import { ContentConfigFields } from "./content-config-fields";

interface BlockConfigModalProps {
  block: SignageBlock | null;
  parentId?: string;
  items: PosItem[];
  onClose: () => void;
  onSave: (block: SignageBlock) => void;
}

const GokujoKnifeIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-5 h-5 text-cyan-400">
    <rect x="15" y="70" width="8" height="20" rx="2" transform="rotate(-45 15 70)" fill="currentColor" opacity="0.8" />
    <path d="M25 60 C 38 45, 55 38, 85 43 C 75 32, 55 28, 35 50 Z" fill="currentColor" />
  </svg>
);

const BLOCK_TYPES = [
  { type: "ColumnBlock", label: "Column Layout", category: "Layout", icon: <LayoutGrid className="w-4 h-4 text-sky-400" /> },
  { type: "RowBlock", label: "Row Layout", category: "Layout", icon: <LayoutGrid className="w-4 h-4 text-indigo-400" /> },
  { type: "GridBlock", label: "Grid Layout", category: "Layout", icon: <LayoutGrid className="w-4 h-4 text-violet-400" /> },
  { type: "CategoryHeaderBlock", label: "Category Header", category: "Content", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
  { type: "PosItemBlock", label: "POS Item", category: "Content", icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
  { type: "NestedItemBlock", label: "Nested Item", category: "Content", icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
  { type: "ExplodedItemBlock", label: "Exploded Item", category: "Content", icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
  { type: "CalloutBlock", label: "Callout Panel", category: "Content", icon: <Sparkles className="w-4 h-4 text-pink-400" /> },
  { type: "MediaCarouselBlock", label: "Media Carousel", category: "Content", icon: <Sparkles className="w-4 h-4 text-fuchsia-400" /> },
];

export function BlockConfigModal({
  block: initialBlock,
  items,
  onClose,
  onSave,
}: BlockConfigModalProps): React.JSX.Element {
  const [activeBlock, setActiveBlock] = useState<SignageBlock>(
    initialBlock || { id: "block-" + Math.random().toString() } as any
  );

  const handleTypeSelect = (type: string) => {
    const defaultData: any = { id: activeBlock.id, type };
    if (type === "GridBlock") { defaultData.columns = 2; defaultData.rows = 2; defaultData.cells = []; }
    else if (type === "ColumnBlock" || type === "RowBlock") { defaultData.blocks = []; }
    else if (type === "MediaCarouselBlock") { defaultData.slides = []; defaultData.style = "ken-burns"; }
    setActiveBlock(defaultData);
  };

  const isNew = !initialBlock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <GokujoKnifeIcon />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              {isNew ? "Assemble Component" : "Inspect Component"}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:text-zinc-200 transition-colors p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isNew && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Select Component Type</span>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_TYPES.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => handleTypeSelect(bt.type)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition ${
                      activeBlock.type === bt.type
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                        : "bg-zinc-900/50 border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-white/15"
                    }`}
                  >
                    {bt.icon}
                    <span className="text-[10px] font-semibold">{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Config fields depending on selected content block */}
          {activeBlock.type && (
            <div className="space-y-4 pt-2 border-t border-black/5 dark:border-white/5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Configure Settings</span>
              <ContentConfigFields
                block={activeBlock}
                items={items}
                onChange={(updates) => setActiveBlock((prev) => ({ ...prev, ...updates } as any))}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/5 bg-zinc-900/30">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { if (activeBlock.type) { onSave(activeBlock); onClose(); } }}
            disabled={!activeBlock.type}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition shadow-[0_4px_12px_rgba(34,211,238,0.2)] ${
              activeBlock.type
                ? "text-zinc-950 bg-cyan-400 hover:bg-cyan-300 cursor-pointer"
                : "text-zinc-400 dark:text-zinc-500 bg-zinc-800 cursor-not-allowed shadow-none"
            }`}
          >
            Apply Component
          </button>
        </div>
      </div>
    </div>
  );
}
