"use client";

import type { SignageBlock, PosItem } from "@soustools/api-types";

export function CalloutBlockConfig({
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
      {selectedBlock.type === "CalloutBlock" && (
        <div className="space-y-3">
          <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
            Callout Content
          </label>
          <input
            type="text"
            value={(selectedBlock as any).title || ""}
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
            value={(selectedBlock as any).message || ""}
            placeholder="Message"
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                message: e.target.value,
              } as any)
            }
            className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
          />
          <select
            value={(selectedBlock as any).iconName || "Info"}
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                iconName: e.target.value,
              } as any)
            }
            className="bg-card border-border text-foreground w-full rounded-lg border px-2 py-1.5 text-xs"
          >
            <option value="Info">Info</option>
            <option value="AlertTriangle">Alert Triangle</option>
            <option value="CheckCircle">Check Circle</option>
            <option value="ChefHat">Chef Hat</option>
            <option value="Star">Star</option>
            <option value="Flame">Flame</option>
            <option value="Utensils">Utensils</option>
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
          <div className="border-border space-y-3 border-t pt-2">
            <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
              Typography & Colors
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
                  Text Color
                </label>
                <input
                  type="color"
                  value={(selectedBlock as any).textColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlockId, {
                      textColor: e.target.value,
                    } as any)
                  }
                  className="bg-card border-border h-8 w-full cursor-pointer rounded border"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
                  Font Size
                </label>
                <select
                  value={(selectedBlock as any).fontSize || ""}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlockId, {
                      fontSize: e.target.value,
                    } as any)
                  }
                  className="bg-card border-border text-foreground w-full rounded-lg border px-2 py-1.5 text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Default</option>
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                  <option value="24px">24px</option>
                  <option value="32px">32px</option>
                  <option value="48px">48px</option>
                  <option value="64px">64px</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
                Background Opacity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={(selectedBlock as any).backgroundOpacity ?? 1}
                onChange={(e) =>
                  onUpdateBlock(selectedBlockId, {
                    backgroundOpacity: Number(e.target.value),
                  } as any)
                }
                className="w-full accent-cyan-500"
              />
              <div className="text-muted-foreground text-right text-[10px]">
                {Math.round(
                  ((selectedBlock as any).backgroundOpacity ?? 1) * 100,
                )}
                %
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
