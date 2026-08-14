"use client";

import { type SignageBlock } from "@soustools/api-types";

interface BorderControlsProps {
  block: SignageBlock;
  onUpdate: (updates: Partial<SignageBlock>) => void;
}

export function BorderControls({ block, onUpdate }: BorderControlsProps) {
  const visuals = block.visuals || {};
  const border = visuals.border || {};
  const shadow = visuals.shadow || {};

  const updateBorder = (updates: Partial<typeof border>) => {
    onUpdate({ visuals: { ...visuals, border: { ...border, ...updates } } });
  };

  const updateShadow = (updates: Partial<typeof shadow>) => {
    onUpdate({ visuals: { ...visuals, shadow: { ...shadow, ...updates } } });
  };

  return (
    <div className="space-y-4">
      {/* Border Settings */}
      <div className="space-y-3">
        <label className="text-muted-foreground border-border block border-b pb-1 text-[10px] font-bold tracking-widest uppercase">
          Border
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  /^#[0-9A-Fa-f]{6}$/i.test(border.color || "")
                    ? border.color
                    : "#ffffff"
                }
                onChange={(e) => updateBorder({ color: e.target.value })}
                className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <input
                type="text"
                placeholder="None"
                value={border.color || ""}
                onChange={(e) => updateBorder({ color: e.target.value })}
                className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Style
            </label>
            <select
              value={border.style || ""}
              onChange={(e) => updateBorder({ style: e.target.value as any })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs"
            >
              <option value="">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Width
            </label>
            <input
              type="text"
              placeholder="e.g. 1px"
              value={border.width || ""}
              onChange={(e) => updateBorder({ width: e.target.value })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Radius
            </label>
            <input
              type="text"
              placeholder="e.g. 8px"
              value={border.radius || ""}
              onChange={(e) => updateBorder({ radius: e.target.value })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Shadow Settings */}
      <div className="space-y-3">
        <label className="text-muted-foreground border-border block border-b pb-1 text-[10px] font-bold tracking-widest uppercase">
          Shadow
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              X Offset
            </label>
            <input
              type="text"
              placeholder="0px"
              value={shadow.x || ""}
              onChange={(e) => updateShadow({ x: e.target.value })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Y Offset
            </label>
            <input
              type="text"
              placeholder="4px"
              value={shadow.y || ""}
              onChange={(e) => updateShadow({ y: e.target.value })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Blur
            </label>
            <input
              type="text"
              placeholder="10px"
              value={shadow.blur || ""}
              onChange={(e) => updateShadow({ blur: e.target.value })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
              Color
            </label>
            <input
              type="text"
              placeholder="rgba(0,0,0,0.5)"
              value={shadow.color || ""}
              onChange={(e) => updateShadow({ color: e.target.value })}
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
