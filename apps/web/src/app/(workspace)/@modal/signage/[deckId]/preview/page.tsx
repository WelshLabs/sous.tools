import React from "react";
import { DeckPreviewModalContainer } from "@soustools/domain-signage";

export const dynamic = "force-dynamic";

interface Params {
  deckId: string;
}

export default async function DeckPreviewModal({
  params,
}: {
  params: Promise<Params>;
}) {
  const { deckId } = await params;
  return <DeckPreviewModalContainer deckId={deckId} />;
}
