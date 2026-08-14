"use client";

import { useState, useCallback } from "react";
import { type ColumnConfig } from "@soustools/api-types";
import { Plus } from "lucide-react";

interface ColumnEmptyViewProps {
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  onOpenEditor?: () => void;
}

export const ColumnEmptyView: React.FC<ColumnEmptyViewProps> = ({
  onUpdate,
  onOpenEditor,
}) => {
  const [isFlashing, setIsFlashing] = useState(false);

  const handleSelect = useCallback(() => {
    onUpdate({
      type: "MENU",
      blocks: [
        {
          id: "block-root-" + Math.random().toString(),
          type: "ColumnBlock",
          blocks: [],
        },
      ],
    });
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      onOpenEditor?.();
    }, 300);
  }, [onUpdate, onOpenEditor]);

  return (
    <div
      onClick={handleSelect}
      className={`border-border group flex h-full min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5 ${isFlashing ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-zinc-950" : ""}`}
    >
      <div className="rounded-full bg-cyan-500/10 p-3 transition-all group-hover:scale-110 group-hover:bg-cyan-500/20">
        <Plus className="h-6 w-6 text-cyan-400" />
      </div>
      <span className="text-muted-foreground mt-4 text-center text-xs font-bold tracking-widest uppercase transition-colors group-hover:text-cyan-400">
        Click to Add Component
      </span>
    </div>
  );
};
