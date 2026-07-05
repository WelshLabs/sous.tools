"use client";

import React from "react";
import { ColumnConfig, PosItem } from "@soustools/api-types";
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
    <div className="absolute inset-0 bg-zinc-950/95 border border-zinc-800 p-2.5 z-20 flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-2">
        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Configure Widget</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {column.type === "MENU" && (
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 font-semibold uppercase">Menu Items</label>
            <MenuItemSelector
              items={items}
              selectedItemIds={column.itemIds || []}
              highlightItems={column.highlightItems || []}
              onChange={(itemIds, highlightItems) => onUpdate({ itemIds, highlightItems })}
            />
          </div>
        )}

        {column.type === "IMAGE" && (
          <div className="space-y-2">
            <div className="space-y-0.5">
              <label className="text-[9px] text-zinc-400 font-semibold uppercase">Image URL</label>
              <input
                type="text"
                value={column.imageUrl || ""}
                onChange={e => onUpdate({ imageUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] text-zinc-400 font-semibold uppercase">Fit Mode</label>
              <select
                value={column.fit || "cover"}
                onChange={e => onUpdate({ fit: e.target.value as "cover" | "contain" })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
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
              <label className="text-[9px] text-zinc-400 font-semibold uppercase">Header Title</label>
              <input
                type="text"
                value={column.title || ""}
                onChange={e => onUpdate({ title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] text-zinc-400 font-semibold uppercase">Content Text</label>
              <textarea
                value={column.content || ""}
                onChange={e => onUpdate({ content: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white h-12 resize-none"
              />
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-full py-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded transition mt-1.5 cursor-pointer"
      >
        Apply Changes
      </button>
    </div>
  );
};
