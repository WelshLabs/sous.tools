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
      <div className="w-full min-h-screen pt-28 px-4 md:px-8">
        <AnswerView
          initialQuery={resolvedParams?.prompt}
          initialReviewId={resolvedParams?.chat}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center pointer-events-none" />
  );
}
