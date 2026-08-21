import React from "react";
import { TVSignageEditorContainer } from "@soustools/domain-signage";
import { clientConfig as config } from "@soustools/config/client";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default async function TVSignageEditorPage({ params }: PageProps) {
  const { deckId } = await params;
  const baseUrl = config.NEXT_PUBLIC_API_URL;

  let deck = null;
  let items = [];

  try {
    const [deckRes, itemsRes] = await Promise.all([
      fetch(`${baseUrl}/signage/layouts/${deckId}`, { cache: "no-store" }),
      fetch(`${baseUrl}/pos-simulator/items`, { cache: "no-store" }),
    ]);

    if (deckRes.ok) {
      const data = await deckRes.json();
      deck = data.data;
    }

    if (itemsRes.ok) {
      const data = await itemsRes.json();
      items = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch signage deck editor data:", err);
  }

  return (
    <TVSignageEditorContainer
      deckId={deckId}
      initialDeck={deck}
      initialItems={items}
    />
  );
}
