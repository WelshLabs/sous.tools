"use client";

import React from "react";
import { SignageBlock } from "@soustools/api-types";

interface BackgroundControlsProps {
  block: SignageBlock;
  onUpdate: (updates: Partial<SignageBlock>) => void;
}

export function BackgroundControls({
  block,
  onUpdate,
}: BackgroundControlsProps) {
  const visuals = block.visuals || {};
  const bg = visuals.background || {};

  const updateBg = (updates: Partial<typeof bg>) => {
    onUpdate({ visuals: { ...visuals, background: { ...bg, ...updates } } });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
          Background Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={
              /^#[0-9A-Fa-f]{6}$/i.test(bg.color || "") ? bg.color : "#ffffff"
            }
            onChange={(e) => updateBg({ color: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
          />
          <input
            type="text"
            placeholder="Transparent"
            value={bg.color || ""}
            onChange={(e) => updateBg({ color: e.target.value })}
            className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
          Backdrop Blur
        </label>
        <input
          type="text"
          placeholder="e.g. 10px (Glass effect)"
          value={bg.blur || ""}
          onChange={(e) => updateBg({ blur: e.target.value })}
          className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
          Image URL
        </label>
        <input
          type="text"
          placeholder="https://"
          value={bg.image || ""}
          onChange={(e) => updateBg({ image: e.target.value })}
          className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}
