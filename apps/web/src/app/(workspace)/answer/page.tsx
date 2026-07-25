import React from "react";
import { SearchReviewLayout } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default function AnswerPage({
  searchParams,
}: {
  searchParams?: { q?: string; reviewId?: string };
}) {
  return (
    <div className="w-full min-h-screen pt-20 px-4 md:px-8">
      <SearchReviewLayout
        initialQuery={searchParams?.q}
        initialReviewId={searchParams?.reviewId}
      />
    </div>
  );
}
