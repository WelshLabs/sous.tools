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
    <div className="flex w-full flex-col items-center p-4 md:p-6">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        {query && (
          <div className="flex w-full items-start gap-3 rounded-xl border border-emerald-500/20 bg-zinc-900/70 p-4 text-sm text-zinc-200 shadow-lg">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div className="flex-1">
              <span className="mb-1 block text-xs font-bold tracking-wider text-emerald-400 uppercase">
                AI Intelligence Summary
              </span>
              <p>
                Heard, Chef. Displaying results for query &ldquo;{query}&rdquo;.
              </p>
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
