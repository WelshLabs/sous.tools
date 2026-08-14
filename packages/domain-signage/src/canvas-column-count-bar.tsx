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
      className="bg-card/90 border-border absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full border px-2 py-1 backdrop-blur"
      role="group"
      aria-label="Column count control"
    >
      <span className="text-foreground/50 px-1 text-[10px] font-semibold tracking-wider uppercase select-none">
        Columns
      </span>

      <button
        onClick={() => onChangeCount(count - 1)}
        disabled={count <= 1}
        className="text-foreground/70 hover:bg-background/10 dark:bg-background/10 hover:text-foreground flex h-5 w-5 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Remove column"
      >
        <Minus className="h-3 w-3" />
      </button>

      <span className="text-foreground w-4 text-center text-sm font-bold tabular-nums select-none">
        {count}
      </span>

      <button
        onClick={() => onChangeCount(count + 1)}
        disabled={count >= 4}
        className="text-foreground/70 hover:bg-background/10 dark:bg-background/10 hover:text-foreground flex h-5 w-5 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Add column"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
};
