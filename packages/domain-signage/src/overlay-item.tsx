"use client";

import { type SignageOverlay } from "@soustools/api-types";
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
    <div className="bg-background animate-fadeIn space-y-3 rounded-lg border border-zinc-900 p-3">
      <div className="flex items-center justify-between gap-2">
        <select
          value={overlay.type}
          onChange={(e) =>
            onUpdate({
              type: e.target.value as "TEXT" | "BADGE" | "IMAGE",
            })
          }
          className="bg-card border-border text-foreground rounded border px-2 py-1 text-xs"
        >
          <option value="TEXT">Text</option>
          <option value="BADGE">Badge</option>
          <option value="IMAGE">Image</option>
        </select>

        <button
          onClick={onRemove}
          className="cursor-pointer p-0.5 text-red-500 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <label className="text-muted-foreground mb-1 block text-[10px]">
            Content / URL
          </label>
          <input
            type="text"
            value={overlay.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-[10px]">
            CSS Class (Optional)
          </label>
          <input
            type="text"
            value={overlay.customCssClass || ""}
            onChange={(e) => onUpdate({ customCssClass: e.target.value })}
            className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-[10px]">
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
              className="bg-card border-border text-foreground rounded border px-1.5 py-1 text-center text-xs placeholder-zinc-600"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
