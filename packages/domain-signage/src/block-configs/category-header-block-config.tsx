"use client";

import type { SignageBlock, PosItem } from "@soustools/api-types";

export function CategoryHeaderBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
  items?: PosItem[];
}) {
  return (
    <>
      {selectedBlock.type === "CategoryHeaderBlock" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-muted-foreground border-border block border-b pb-1 text-[10px] font-bold tracking-widest uppercase">
              Header Details
            </label>
            <input
              type="text"
              value={selectedBlock.title || ""}
              placeholder="Title"
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  title: e.target.value,
                } as any)
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              value={selectedBlock.subtitle || ""}
              placeholder="Subtitle"
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  subtitle: e.target.value,
                })
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              value={selectedBlock.badge || ""}
              placeholder="Badge (Optional)"
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  badge: e.target.value,
                })
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
            />
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={(selectedBlock as any).animateBadge || false}
                onChange={(e) =>
                  onUpdateBlock(selectedBlockId, {
                    animateBadge: e.target.checked,
                  } as any)
                }
                className="border-border bg-background dark:bg-background h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Animate Badge Pulse
              </span>
            </label>
            <select
              value={(selectedBlock as any).icon || "none"}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  icon: e.target.value,
                } as any)
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
            >
              <option value="none">No Icon</option>
              <option value="CheckCircle">Check Circle</option>
              <option value="ChefHat">Chef Hat</option>
              <option value="Star">Star</option>
              <option value="Bell">Bell</option>
              <option value="Flame">Flame</option>
            </select>
            <label className="mt-2 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={(selectedBlock as any).accentBorder || false}
                onChange={(e) =>
                  onUpdateBlock(selectedBlockId, {
                    accentBorder: e.target.checked,
                  } as any)
                }
                className="border-border bg-background dark:bg-background h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Accent Border
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Modifier Group */}
    </>
  );
}
