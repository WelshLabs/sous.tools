"use client";

import { Minus, Plus } from "lucide-react";

export interface CanvasColumnCountBarProps {
  count: number;
  onChangeCount: (count: number) => void;
}

/**
 * Small pill overlay shown in the top-left of the canvas when editing
 * a COLUMN_LAYOUT slide. Lets the user adjust the column count (1–4).
 *
 * @tenant-docs-export
 * Use the − / + buttons to add or remove columns in the active slide.
 * The control is only visible while the editor is open on a column-layout slide.
 */
export const CanvasColumnCountBar: React.FC<CanvasColumnCountBarProps> = ({
  count,
  onChangeCount,
}) => {
  if (count < 1) return null;

  return (
    <div
      className="absolute top-3 left-3 z-20
                 bg-card/90 backdrop-blur border border-black/10 dark:border-white/10
                 rounded-full flex items-center gap-1 px-2 py-1"
      role="group"
      aria-label="Column count control"
    >
      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider select-none px-1">
        Columns
      </span>

      <button
        onClick={() => onChangeCount(count - 1)}
        disabled={count <= 1}
        className="w-5 h-5 rounded-full flex items-center justify-center
                   text-white/70 hover:bg-black/10 dark:bg-white/10 hover:text-white
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors"
        aria-label="Remove column"
      >
        <Minus className="w-3 h-3" />
      </button>

      <span className="text-sm font-bold text-white tabular-nums w-4 text-center select-none">
        {count}
      </span>

      <button
        onClick={() => onChangeCount(count + 1)}
        disabled={count >= 4}
        className="w-5 h-5 rounded-full flex items-center justify-center
                   text-white/70 hover:bg-black/10 dark:bg-white/10 hover:text-white
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors"
        aria-label="Add column"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};
