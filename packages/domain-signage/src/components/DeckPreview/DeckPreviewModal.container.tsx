"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DeckPreviewModalView, type DeckPreviewData } from "./DeckPreview.view";

export interface DeckPreviewModalProps {
  deckId: string;
  initialDeck?: DeckPreviewData | null;
}

export function DeckPreviewModalContainer({
  deckId,
  initialDeck = null,
}: DeckPreviewModalProps) {
  const router = useRouter();
  const [deck, setDeck] = useState<DeckPreviewData | null>(initialDeck);
  const [loading, setLoading] = useState(!initialDeck);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!initialDeck) {
      fetch(`/api/signage/layouts/${deckId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setDeck(d.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [deckId, initialDeck]);

  const getLiveUrl = () => {
    if (!deck) return "";
    const base =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5003"
        : typeof window !== "undefined"
          ? window.location.origin
          : "";
    return `${base}/s/dtown-cafe/${deck.slug}`;
  };

  const handleCopy = async () => {
    if (typeof navigator !== "undefined") {
      await navigator.clipboard.writeText(getLiveUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DeckPreviewModalView
      deck={deck}
      loading={loading}
      copied={copied}
      liveUrl={getLiveUrl()}
      onCopy={handleCopy}
      onClose={() => router.back()}
      onOpenEditor={() => router.push(`/signage/${deckId}`)}
    />
  );
}

export { DeckPreviewModalContainer as DeckPreviewModal };
