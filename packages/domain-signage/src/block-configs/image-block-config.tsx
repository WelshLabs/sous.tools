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
          <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
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
            className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
          />

          <label className="text-muted-foreground mt-3 block text-[10px] font-bold tracking-widest uppercase">
            Object Fit
          </label>
          <select
            value={(selectedBlock as any).objectFit || "contain"}
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                objectFit: e.target.value,
              } as any)
            }
            className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
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
