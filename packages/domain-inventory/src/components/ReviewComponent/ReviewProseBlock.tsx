"use client";

import { Trash2 } from "lucide-react";

export interface ReviewProseBlockProps {
  content: string;
  onChange: (newContent: string) => void;
  onExclude?: () => void;
}

export function ReviewProseBlock({
  content,
  onChange,
  onExclude,
}: ReviewProseBlockProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
          Prose Documentation Block
        </span>
        {onExclude && (
          <button
            type="button"
            onClick={onExclude}
            aria-label="Deny or exclude prose block"
            className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Exclude / Deny</span>
          </button>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none"
        placeholder="Edit prose content..."
      />
    </div>
  );
}
