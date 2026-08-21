import React from "react";
import { clientConfig as config } from "@soustools/config/client";
import { DeckPreviewContainer } from "@soustools/domain-signage";

export const dynamic = "force-dynamic";

interface Params {
  deckId: string;
}

async function fetchDeck(deckId: string) {
  try {
    const base = config.NEXT_PUBLIC_APP_URL;
    const res = await fetch(`${base}/api/signage/layouts/${deckId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function DeckPreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { deckId } = await params;
  const deck = await fetchDeck(deckId);

  const liveBase = config.NEXT_PUBLIC_APP_URL;
  const liveUrl = deck ? `${liveBase}/s/dtown-cafe/${deck.slug}` : null;

  return <DeckPreviewContainer deck={deck} liveUrl={liveUrl} />;
}
