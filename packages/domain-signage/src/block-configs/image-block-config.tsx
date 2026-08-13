"use client";

import type { SignageBlock } from "@soustools/api-types";

export function ImageBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
}) {
  return (
    <>
      {selectedBlock.type === "ImageBlock" && (
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Image Source
          </label>
          <input
            type="text"
            value={(selectedBlock as any).imageUrl || ""}
            placeholder="https://..."
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                imageUrl: e.target.value,
              } as any)
            }
            className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
          />

          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mt-3">
            Object Fit
          </label>
          <select
            value={(selectedBlock as any).objectFit || "contain"}
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                objectFit: e.target.value,
              } as any)
            }
            className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
          >
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="fill">Fill</option>
          </select>
        </div>
      )}

      {/* Video Block */}
    </>
  );
}
