"use client";

import { DeckPreviewPageView, type DeckPreviewData } from "./DeckPreview.view";

export interface DeckPreviewProps {
  deck: DeckPreviewData | null;
  liveUrl?: string | null;
}

export function DeckPreviewContainer({ deck, liveUrl }: DeckPreviewProps) {
  const computedLiveUrl =
    liveUrl !== undefined
      ? liveUrl
      : deck
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/dtown-cafe/${deck.slug}`
        : null;

  return <DeckPreviewPageView deck={deck} liveUrl={computedLiveUrl} />;
}

export { DeckPreviewContainer as DeckPreview };
