"use client";

import React from "react";
import { SignageOverlay } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Plus } from "lucide-react";
import { OverlayItem } from "./overlay-item";

/**
 * Props for the OverlaysTab component.
 */
export interface OverlaysTabProps {
  /** Array of active signage overlays. */
  overlays: SignageOverlay[];
  /** Callback triggered when overlays list updates. */
  onChange: (overlays: SignageOverlay[]) => void;
}

/**
 * OverlaysTab manages floating badge, image, or text overlays on top of signage slides.
 *
 * @tenant-docs-export
 * Use the Overlays tab to overlay custom visual alerts, text labels, or sold out badges
 * over your digital signage playlist. Use CSS custom styling or positioning coordinates.
 */
export const OverlaysTab: React.FC<OverlaysTabProps> = ({
  overlays = [],
  onChange,
}) => {
  const addOverlay = (): void => {
    const newOverlay: SignageOverlay = {
      id: `overlay-${Date.now()}`,
      type: "TEXT",
      content: "New Overlay Text",
      position: { top: "10%", left: "10%" },
    };
    onChange([...overlays, newOverlay]);
  };

  const updateOverlay = (
    id: string,
    updates: Partial<SignageOverlay>,
  ): void => {
    onChange(
      overlays.map((o) => {
        if (o.id !== id) return o;
        return { ...o, ...updates } as SignageOverlay;
      }),
    );
  };

  const updatePosition = (
    id: string,
    key: "top" | "bottom" | "left" | "right",
    value: string,
  ): void => {
    onChange(
      overlays.map((o) => {
        if (o.id !== id) return o;
        const newPos = { ...o.position };
        if (value) {
          newPos[key] = value;
        } else {
          delete newPos[key];
        }
        return { ...o, position: newPos };
      }),
    );
  };

  const removeOverlay = (id: string): void => {
    onChange(overlays.filter((o) => o.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Overlay Layers
          </h3>
          <p className="text-xs text-slate-400">
            Position floating text, badges, or images on top of slides.
          </p>
        </div>
        <Button size="sm" onClick={addOverlay}>
          <Plus className="w-4 h-4 mr-1 inline" /> Add Overlay
        </Button>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {overlays.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500">
            No overlays configured.
          </div>
        ) : (
          overlays.map((overlay) => (
            <OverlayItem
              key={overlay.id}
              overlay={overlay}
              onUpdate={(updates) => updateOverlay(overlay.id, updates)}
              onUpdatePosition={(posKey, value) =>
                updatePosition(overlay.id, posKey, value)
              }
              onRemove={() => removeOverlay(overlay.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
