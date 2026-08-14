import React from "react";
import { AnswerView } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string; prompt?: string }>;
}) {
  const resolvedParams = await searchParams;

  if (resolvedParams?.chat) {
    return (
      <div className="min-h-screen w-full px-4 pt-28 md:px-8">
        <AnswerView
          initialQuery={resolvedParams?.prompt}
          initialReviewId={resolvedParams?.chat}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none flex min-h-[calc(100vh-64px)] w-full items-center justify-center" />
  );
}
