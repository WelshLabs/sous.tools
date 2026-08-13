"use client";

import { Loader2, Plus } from "lucide-react";

interface CreateItemButtonProps {
  disabled: boolean;
  isCreating: boolean;
  onClick: () => void;
  suggestedName: string;
}

export function CreateItemButton({
  disabled,
  isCreating,
  onClick,
  suggestedName,
}: CreateItemButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isCreating}
      onClick={onClick}
      className="self-start flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 text-cyan-600 dark:text-cyan-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-cyan-500/25 cursor-pointer transition-all active:scale-95"
    >
      {isCreating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Plus className="w-3.5 h-3.5" />
      )}
      <span>Create: {suggestedName}</span>
    </button>
  );
}
