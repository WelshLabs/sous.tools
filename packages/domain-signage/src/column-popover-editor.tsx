"use client";

import { type ColumnConfig, type PosItem } from "@soustools/api-types";
import { X } from "lucide-react";
import { MenuItemSelector } from "./menu-item-selector";

interface ColumnPopoverEditorProps {
  column: ColumnConfig;
  items: PosItem[];
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  onClose: () => void;
}

export const ColumnPopoverEditor: React.FC<ColumnPopoverEditorProps> = ({
  column,
  items,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="bg-background/95 border-border absolute inset-0 z-20 flex flex-col border p-2.5">
      <div className="mb-2 flex items-center justify-between border-b border-zinc-900 pb-1.5">
        <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          Configure Widget
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {column.type === "MENU" && (
          <div className="space-y-1">
            <label className="text-muted-foreground text-[9px] font-semibold uppercase">
              Menu Items
            </label>
            <MenuItemSelector
              items={items}
              selectedItemIds={column.itemIds || []}
              highlightItems={column.highlightItems || []}
              onChange={(itemIds, highlightItems) =>
                onUpdate({ itemIds, highlightItems })
              }
            />
          </div>
        )}

        {column.type === "IMAGE" && (
          <div className="space-y-2">
            <div className="space-y-0.5">
              <label className="text-muted-foreground text-[9px] font-semibold uppercase">
                Image URL
              </label>
              <input
                type="text"
                value={column.imageUrl || ""}
                onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-muted-foreground text-[9px] font-semibold uppercase">
                Fit Mode
              </label>
              <select
                value={column.fit || "cover"}
                onChange={(e) =>
                  onUpdate({ fit: e.target.value as "cover" | "contain" })
                }
                className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs"
              >
                <option value="cover">Cover (Fill)</option>
                <option value="contain">Contain (Fit)</option>
              </select>
            </div>
          </div>
        )}

        {column.type === "TEXT" && (
          <div className="space-y-2">
            <div className="space-y-0.5">
              <label className="text-muted-foreground text-[9px] font-semibold uppercase">
                Header Title
              </label>
              <input
                type="text"
                value={column.title || ""}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-muted-foreground text-[9px] font-semibold uppercase">
                Content Text
              </label>
              <textarea
                value={column.content || ""}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="bg-background border-border text-foreground h-12 w-full resize-none rounded border px-2 py-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="bg-card hover:bg-secondary text-foreground mt-1.5 w-full cursor-pointer rounded py-1 text-[10px] font-bold transition"
      >
        Apply Changes
      </button>
    </div>
  );
};
