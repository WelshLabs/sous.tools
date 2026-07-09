"use client";

import React from "react";
import { type SignageBlock, type PosItem } from "@soustools/api-types";
import { PosItemPicker } from "./pos-item-picker";

interface ContentConfigFieldsProps {
  block: SignageBlock;
  items: PosItem[];
  onChange: (updates: Partial<SignageBlock>) => void;
}

export function ContentConfigFields({
  block,
  items,
  onChange,
}: ContentConfigFieldsProps): React.JSX.Element {
  const renderPosItemBinding = () => {
    const activeId =
      (block as any).posItemId || (block as any).basePosItemId || "";
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
          POS Item Selection
        </label>
        <PosItemPicker
          items={items}
          value={activeId}
          onChange={(id) =>
            onChange({
              [block.type === "PosItemBlock" ? "posItemId" : "basePosItemId"]:
                id,
            } as any)
          }
        />
      </div>
    );
  };

  const renderKenBurnsParams = () => {
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
          Ken Burns Settings
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold block mb-1">
              Zoom Speed (s)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              placeholder="10"
              className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
              onChange={(e) =>
                onChange({
                  carouselSettings: {
                    ...((block as any).carouselSettings || {}),
                    speed: Number(e.target.value),
                  },
                } as any)
              }
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold block mb-1">
              Max Zoom Scale
            </label>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="2.0"
              placeholder="1.2"
              className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
              onChange={(e) =>
                onChange({
                  carouselSettings: {
                    ...((block as any).carouselSettings || {}),
                    maxScale: Number(e.target.value),
                  },
                } as any)
              }
            />
          </div>
        </div>
      </div>
    );
  };

  const renderOosModifiers = () => {
    const oosBehavior = (block as any).oosBehavior || "GrayOut";
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
          Out-of-Stock Modifier Behavior
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["Hide", "GrayOut", "Badge"].map((mode) => (
            <button
              key={mode}
              onClick={() => onChange({ oosBehavior: mode } as any)}
              className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition border ${
                oosBehavior === mode
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-zinc-100 dark:bg-card text-zinc-500 dark:text-zinc-400 border-black/10 dark:border-white/10 hover:border-white/20"
              }`}
            >
              {mode === "GrayOut" ? "Gray Out" : mode}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 py-2">
      {(block.type === "PosItemBlock" || block.type === "NestedItemBlock") &&
        renderPosItemBinding()}
      {block.type === "MediaCarouselBlock" && renderKenBurnsParams()}
      {(block.type === "PosItemBlock" ||
        block.type === "NestedItemBlock" ||
        block.type === "ExplodedItemBlock") &&
        renderOosModifiers()}
    </div>
  );
}
