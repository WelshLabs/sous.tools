"use client";

export interface ReviewProseBlockProps {
  content: string;
  onChange: (newContent: string) => void;
}

export function ReviewProseBlock({ content, onChange }: ReviewProseBlockProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
          Prose Block
        </span>
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
