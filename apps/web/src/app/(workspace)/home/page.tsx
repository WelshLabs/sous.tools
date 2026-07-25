import React from "react";
import { SearchReviewLayout } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string; reviewId?: string };
}) {
  return (
    <SearchReviewLayout
      initialQuery={searchParams?.q}
      initialReviewId={searchParams?.reviewId}
    />
  );
}
