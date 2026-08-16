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

  if (resolvedParams?.chat) {
    return (
      <div className="flex min-h-screen w-full">
        {/* Conversation history sidebar */}
        <ConversationHistoryContainer activeId={resolvedParams.chat} />

        {/* Main chat column */}
        <main className="flex min-h-screen flex-1 flex-col overflow-y-auto">
          <AnswerView
            initialQuery={derivedPrompt}
            initialReviewId={resolvedParams.chat}
          />
        </main>
      </div>
    );
  }

  // If share-target arrives without a chat ID, render the omnibar empty page
  // The OmniBarProvider will auto-seed the input from the prompt via context
  return (
    <div className="pointer-events-none flex min-h-[calc(100vh-64px)] w-full items-center justify-center" />
  );
}
