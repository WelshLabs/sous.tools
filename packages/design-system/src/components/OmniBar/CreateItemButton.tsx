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
      className="flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-600 transition-all hover:bg-cyan-500/20 active:scale-95 disabled:opacity-50 dark:text-cyan-400"
    >
      {isCreating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
      <span>Create: {suggestedName}</span>
    </button>
  );
}
