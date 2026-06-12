"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { SignageSlide } from "@soustools/api-types";
import { GripVertical, Trash2 } from "lucide-react";

/**
 * Props for the PlaylistSlideItem component.
 */
export interface PlaylistSlideItemProps {
  /** The slide configuration. */
  slide: SignageSlide;
  /** The index position of the slide in the playlist. */
  index: number;
  /** Callback triggered when the slide configuration is updated. */
  onUpdate: (updates: Partial<SignageSlide>) => void;
  /** Callback triggered to delete this slide. */
  onRemove: () => void;
}

/**
 * PlaylistSlideItem renders a single draggable item in the digital signage playlist.
 *
 * @tenant-docs-export
 * Use the playlist item configuration card to edit durations, templates, and asset URLs.
 * Drag items using the handle on the left to re-arrange the play sequence.
 */
export const PlaylistSlideItem: React.FC<PlaylistSlideItemProps> = ({
  slide,
  index,
  onUpdate,
  onRemove,
}) => {
  return (
    <Draggable draggableId={slide.id} index={index}>
      {(draggableProvided) => (
        <div
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)]"
        >
          <div
            {...draggableProvided.dragHandleProps}
            className="text-slate-500 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {slide.type}
              </span>
              <span className="text-xs text-slate-400">Duration:</span>
              <input
                type="number"
                value={slide.durationSeconds}
                onChange={(e) =>
                  onUpdate({
                    durationSeconds: Number(e.target.value),
                  })
                }
                className="w-16 bg-slate-800 border border-slate-700 rounded px-1 text-xs text-slate-100"
              />
              <span className="text-xs text-slate-400">s</span>
            </div>
            {slide.type === "IMAGE" && (
              <input
                type="text"
                placeholder="Image URL"
                value={slide.imageUrl}
                onChange={(e) =>
                  onUpdate({
                    imageUrl: e.target.value,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
            )}
            {slide.type === "VIDEO" && (
              <input
                type="text"
                placeholder="Video URL"
                value={slide.videoUrl}
                onChange={(e) =>
                  onUpdate({
                    videoUrl: e.target.value,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
            )}
            {slide.type === "IFRAME" && (
              <input
                type="text"
                placeholder="Iframe URL"
                value={slide.url}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
            )}
            {slide.type === "MENU" && (
              <select
                value={slide.layoutTemplate}
                onChange={(e) =>
                  onUpdate({
                    layoutTemplate: e.target.value as
                      | "GRID"
                      | "SPLIT"
                      | "COLUMNS",
                  })
                }
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="GRID">Grid Layout</option>
                <option value="SPLIT">Split Screen</option>
                <option value="COLUMNS">Columns Layout</option>
              </select>
            )}
          </div>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </Draggable>
  );
};
