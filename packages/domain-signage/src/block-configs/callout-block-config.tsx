"use client";

import type { SignageBlock, PosItem } from "@soustools/api-types";
import { Sparkles } from "lucide-react";

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
  if (selectedBlock.type !== "CalloutBlock") return null;

  const b = selectedBlock as any;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-muted-foreground block flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Callout & Card
          Content
        </label>

        <div>
          <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
            Title / Heading
          </label>
          <input
            type="text"
            value={b.title || b.text || ""}
            placeholder="e.g. Frozen Take Home Dinners"
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                title: e.target.value,
                text: e.target.value,
              })
            }
            className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
            Message / Description
          </label>
          <textarea
            rows={3}
            value={b.message || b.subtitle || ""}
            placeholder="e.g. Fully prepared meals ready to heat & serve at home. Available in our grab & go freezer."
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                message: e.target.value,
                subtitle: e.target.value,
              })
            }
            className="bg-card border-border text-foreground w-full resize-none rounded-lg border px-2.5 py-1.5 text-xs focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
              Badge / Pill
            </label>
            <input
              type="text"
              value={b.badge || ""}
              placeholder="e.g. Grab & Go"
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  badge: e.target.value,
                })
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
              Icon
            </label>
            <select
              value={b.iconName || "Info"}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  iconName: e.target.value,
                })
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs focus:border-cyan-500 focus:outline-none"
            >
              <option value="Info">Info</option>
              <option value="Sparkles">Sparkles</option>
              <option value="Snowflake">Snowflake (Frozen)</option>
              <option value="Flame">Flame (Hot / Spicy)</option>
              <option value="ChefHat">Chef Hat</option>
              <option value="Utensils">Utensils</option>
              <option value="Star">Star</option>
              <option value="Heart">Heart</option>
              <option value="Package">Package (Take Home)</option>
              <option value="AlertTriangle">Alert Triangle</option>
              <option value="CheckCircle">Check Circle</option>
              <option value="Clock">Clock</option>
              <option value="none">No Icon</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-border space-y-3 border-t pt-3">
        <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
          Accent Border & Card Styling
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={b.accentBorder ?? true}
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                accentBorder: e.target.checked,
              })
            }
            className="border-border bg-background h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-foreground text-xs font-semibold">
            Enable Neon Accent Border
          </span>
        </label>

        {(b.accentBorder ?? true) && (
          <div className="grid grid-cols-2 gap-2 pl-6">
            <div>
              <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                Accent Position
              </label>
              <select
                value={b.accentPosition || "left"}
                onChange={(e) =>
                  onUpdateBlock(selectedBlockId, {
                    accentPosition: e.target.value,
                  })
                }
                className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="left">Left Border (Card Accent)</option>
                <option value="top">Top Border (Banner Accent)</option>
                <option value="bottom">Bottom Border</option>
                <option value="right">Right Border</option>
                <option value="all">All Sides (Full Glow)</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                Accent Color
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={b.accentColor || "#22d3ee"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlockId, {
                      accentColor: e.target.value,
                    })
                  }
                  className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  placeholder="#22d3ee"
                  value={b.accentColor || ""}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlockId, {
                      accentColor: e.target.value,
                    })
                  }
                  className="bg-card border-border text-foreground w-full rounded border px-2 py-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
