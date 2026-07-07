import React from "react";
import TVSignageEditorClient from "./tv-signage-editor-client";
import { config } from "@soustools/config";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default async function TVSignageEditorPage({ params }: PageProps) {
  const { deckId } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  let deck = null;
  let items = [];

  try {
    const [deckRes, itemsRes, orgRes] = await Promise.all([
      fetch(`${baseUrl}/signage/layouts/${deckId}`, { cache: "no-store" }),
      fetch(`${baseUrl}/pos-simulator/items`, { cache: "no-store" }),
//       supabase.from("organizations").select("design_tokens").limit(1).single()
    ]);

    if (deckRes.ok) {
      const data = await deckRes.json();
      deck = data.data;
    }

    if (itemsRes.ok) {
      const data = await itemsRes.json();
      items = data.data || [];
    }

    if (deck && deck.config && orgRes.data?.design_tokens) {
      deck.config.designTokens = orgRes.data.design_tokens;
    }

  } catch (err) {
    console.error("Failed to fetch signage deck editor data:", err);
  }

  return <TVSignageEditorClient deckId={deckId} initialDeck={deck} initialItems={items} />;
}
