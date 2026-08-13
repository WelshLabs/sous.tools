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
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1">
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
              className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
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
              className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
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
              className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(selectedBlock as any).animateBadge || false}
                onChange={(e) =>
                  onUpdateBlock(selectedBlockId, {
                    animateBadge: e.target.checked,
                  } as any)
                }
                className="w-4 h-4 rounded border-border bg-background dark:bg-background text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
              className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
            >
              <option value="none">No Icon</option>
              <option value="CheckCircle">Check Circle</option>
              <option value="ChefHat">Chef Hat</option>
              <option value="Star">Star</option>
              <option value="Bell">Bell</option>
              <option value="Flame">Flame</option>
            </select>
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={(selectedBlock as any).accentBorder || false}
                onChange={(e) =>
                  onUpdateBlock(selectedBlockId, {
                    accentBorder: e.target.checked,
                  } as any)
                }
                className="w-4 h-4 rounded border-border bg-background dark:bg-background text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
