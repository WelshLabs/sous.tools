"use client";

export interface ReviewProseBlockProps {
  content: string;
  onChange: (newContent: string) => void;
}

export function ReviewProseBlock({ content, onChange }: ReviewProseBlockProps) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Prose Block
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[100px] p-3 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500/50 resize-y font-mono"
        placeholder="Edit prose content..."
      />
    </div>
  );
}
