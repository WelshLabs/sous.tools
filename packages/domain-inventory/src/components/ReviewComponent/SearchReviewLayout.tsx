"use client";

import { useState } from "react";
import { UniversalReviewComponent } from "./UniversalReviewComponent";
import { Sparkles } from "lucide-react";

export interface SearchReviewLayoutProps {
  initialQuery?: string;
  initialReviewId?: string;
}

export function SearchReviewLayout({
  initialQuery = "",
  initialReviewId,
}: SearchReviewLayoutProps) {
  const [query] = useState(initialQuery);
  const [activeReviewId] = useState<string | undefined>(initialReviewId);

  return (
    <div className="w-full flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {query && (
          <div className="w-full p-4 rounded-xl bg-zinc-900/70 border border-emerald-500/20 flex items-start gap-3 text-sm text-zinc-200 shadow-lg">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                AI Intelligence Summary
              </span>
              <p>Heard, Chef. Displaying results for query &ldquo;{query}&rdquo;.</p>
            </div>
          </div>
        )}

        <div className="w-full">
          <UniversalReviewComponent reviewId={activeReviewId} />
        </div>
      </div>
    </div>
  );
}
