"use client";

import React, { useState, useCallback } from "react";
import { ColumnConfig } from "@soustools/api-types";
import { Plus } from "lucide-react";

interface ColumnEmptyViewProps {
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  onOpenEditor?: () => void;
}

export const ColumnEmptyView: React.FC<ColumnEmptyViewProps> = ({ onUpdate, onOpenEditor }) => {
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
      className={`flex flex-col items-center justify-center w-full h-full min-h-[160px] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-xl cursor-pointer transition-all group p-4 ${isFlashing ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950" : ""}`}
    >
      <div className="p-3 bg-cyan-500/10 rounded-full group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all">
        <Plus className="w-6 h-6 text-cyan-400" />
      </div>
      <span className="mt-4 text-xs font-bold text-slate-400 group-hover:text-cyan-400 uppercase tracking-widest text-center transition-colors">
        Click to Add Component
      </span>
    </div>
  );
};
