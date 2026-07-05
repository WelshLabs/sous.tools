"use client";

import React from "react";
import { SignageOverlay } from "@soustools/api-types";
import { Trash2 } from "lucide-react";

/**
 * Props for the OverlayItem component.
 */
export interface OverlayItemProps {
  /** The specific overlay configuration to edit. */
  overlay: SignageOverlay;
  /** Callback triggered when any field of the overlay is updated. */
  onUpdate: (updates: Partial<SignageOverlay>) => void;
  /** Callback triggered when a coordinate position changes. */
  onUpdatePosition: (
    key: "top" | "bottom" | "left" | "right",
    value: string,
  ) => void;
  /** Callback triggered to delete this overlay. */
  onRemove: () => void;
}

/**
 * OverlayItem component renders a panel to edit a single overlay's settings.
 *
 * @tenant-docs-export
 * Use the overlay item form to customize the overlay type, text content, CSS styling class, and position coordinates.
 */
export const OverlayItem: React.FC<OverlayItemProps> = ({
  overlay,
  onUpdate,
  onUpdatePosition,
  onRemove,
}) => {
  return (
    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3 animate-fadeIn">
      <div className="flex justify-between items-center gap-2">
        <select
          value={overlay.type}
          onChange={(e) =>
            onUpdate({
              type: e.target.value as "TEXT" | "BADGE" | "IMAGE",
            })
          }
          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200"
        >
          <option value="TEXT">Text</option>
          <option value="BADGE">Badge</option>
          <option value="IMAGE">Image</option>
        </select>

        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-400 cursor-pointer p-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-zinc-400 mb-1">
            Content / URL
          </label>
          <input
            type="text"
            value={overlay.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-400 mb-1">
            CSS Class (Optional)
          </label>
          <input
            type="text"
            value={overlay.customCssClass || ""}
            onChange={(e) => onUpdate({ customCssClass: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-zinc-400 mb-1">
          Positions (e.g. 10%, 20px)
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["top", "bottom", "left", "right"] as const).map((posKey) => (
            <input
              key={posKey}
              type="text"
              placeholder={posKey}
              value={overlay.position[posKey] || ""}
              onChange={(e) => onUpdatePosition(posKey, e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-center text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-600"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
