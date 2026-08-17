import React from "react";
import { AnswerView } from "@soustools/domain-inventory";
import { ConversationHistoryContainer } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    chat?: string;
    prompt?: string;
    /** PWA share-target params */
    title?: string;
    text?: string;
    url?: string;
  }>;
}) {
  const resolvedParams = await searchParams;

  // PWA share-target: if title/text/url arrive without a chat ID, seed a new conversation
  const sharePrompt = [
    resolvedParams.title,
    resolvedParams.text,
    resolvedParams.url,
  ]
    .filter(Boolean)
    .join(" — ")
    .trim();

  const derivedPrompt = resolvedParams.prompt || sharePrompt || undefined;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Conversation history sidebar */}
      <ConversationHistoryContainer activeId={resolvedParams?.chat} />

      {/* Main chat column */}
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        <AnswerView
          initialQuery={derivedPrompt}
          initialReviewId={resolvedParams?.chat}
        />
      </main>
    </div>
  );
}
