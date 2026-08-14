"use client";

import { type SignageBlock } from "@soustools/api-types";

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
        <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
          Background Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={
              /^#[0-9A-Fa-f]{6}$/i.test(bg.color || "") ? bg.color : "#ffffff"
            }
            onChange={(e) => updateBg({ color: e.target.value })}
            className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <input
            type="text"
            placeholder="Transparent"
            value={bg.color || ""}
            onChange={(e) => updateBg({ color: e.target.value })}
            className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
          Backdrop Blur
        </label>
        <input
          type="text"
          placeholder="e.g. 10px (Glass effect)"
          value={bg.blur || ""}
          onChange={(e) => updateBg({ blur: e.target.value })}
          className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
          Image URL
        </label>
        <input
          type="text"
          placeholder="https://"
          value={bg.image || ""}
          onChange={(e) => updateBg({ image: e.target.value })}
          className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}
