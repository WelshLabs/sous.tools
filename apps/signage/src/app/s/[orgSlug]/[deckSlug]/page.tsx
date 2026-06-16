"use client";

import React, { useState, useEffect, use } from "react";
import { io } from "socket.io-client";
import { PosItem, SignageLayoutConfig } from "@soustools/api-types";
import { SlideCarousel } from "../../../display/[id]/slide-carousel";
import { mapDbItemToPosItem, RawDbSquareItem } from "../../../display/[id]/helpers";
import { buildAllAnimationCss } from "../../../display/[id]/menu-item-style-utils";

interface FriendlyDeck {
  id: string;
  organization_id: string;
  config: SignageLayoutConfig;
}

interface FriendlyDeckPlayerProps {
  params: Promise<{ orgSlug: string; deckSlug: string }>;
}

export default function FriendlyDeckPlayerPage({ params }: FriendlyDeckPlayerProps) {
  const { orgSlug, deckSlug } = use(params);
  const [deck, setDeck] = useState<FriendlyDeck | null>(null);
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const fetchDeckAndItems = async () => {
    try {
      const res = await fetch(`/api/signage/layouts/slug/${orgSlug}/${deckSlug}`);
      const deckData = await res.json();
      if (!deckData.success || !deckData.data) throw new Error("Deck not found");
      setDeck(deckData.data as FriendlyDeck);

      const itemsRes = await fetch(`/api/pos/items?organizationId=${deckData.data.organization_id}`);
      const itemsData = await itemsRes.json();
      if (itemsData.success && itemsData.data) {
        setItems((itemsData.data as RawDbSquareItem[]).map(mapDbItemToPosItem));
      }
      setLoading(false);
    } catch (err) {
      setErrorState(err instanceof Error ? err.message : "Load failed");
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeckAndItems(); }, [orgSlug, deckSlug]);

  useEffect(() => {
    const config = deck?.config;
    if (!config) return;

    const fontsToLoad = new Set<string>();
    if (config.googleFont) fontsToLoad.add(config.googleFont);
    if (config.typography) {
      const { menuItemTitle, menuItemPrice, menuItemDescription, marketingText } = config.typography;
      if (menuItemTitle) fontsToLoad.add(menuItemTitle);
      if (menuItemPrice) fontsToLoad.add(menuItemPrice);
      if (menuItemDescription) fontsToLoad.add(menuItemDescription);
      if (marketingText) fontsToLoad.add(marketingText);
    }

    const fontIdPrefix = "signage-dynamic-font";
    document.querySelectorAll(`[id^='${fontIdPrefix}']`).forEach((el) => el.remove());
    Array.from(fontsToLoad).forEach((font, idx) => {
      const link = document.createElement("link");
      link.id = `${fontIdPrefix}-${idx}`;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`;
      document.head.appendChild(link);
    });

    const styleId = "signage-custom-css";
    document.getElementById(styleId)?.remove();
    if (config.customCss) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = config.customCss;
      document.head.appendChild(style);
    }

    const animStyleId = "signage-item-animations";
    document.getElementById(animStyleId)?.remove();
    if (config.menuItemStyles) {
      const animCss = buildAllAnimationCss(config.menuItemStyles);
      if (animCss) {
        const animStyle = document.createElement("style");
        animStyle.id = animStyleId;
        animStyle.textContent = animCss;
        document.head.appendChild(animStyle);
      }
    }
  }, [deck]);

  useEffect(() => {
    if (!deck?.id) return;
    const socket = io(window.location.origin, { query: { deckId: deck.id } });
    socket.on("connect", () => { socket.emit("join", { deckId: deck.id }); });
    socket.on("deck_updated", (payload: { deckId: string; config: SignageLayoutConfig }) => {
      if (payload.deckId === deck.id) {
        setDeck((prev) => prev ? { ...prev, config: payload.config } : null);
      }
    });
    socket.on("items_updated", (payload: { deckId: string; items: RawDbSquareItem[] }) => {
      if (payload.deckId === deck.id && payload.items) {
        setItems(payload.items.map(mapDbItemToPosItem));
      }
    });
    return () => { socket.disconnect(); };
  }, [deck?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white">
        <div className="w-8 h-8 border-4 border-t-transparent border-[oklch(0.60_0.25_250)] rounded-full animate-spin" />
      </div>
    );
  }

  if (errorState || !deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white p-6">
        <h2 className="text-2xl font-bold text-[oklch(0.60_0.25_25)] mb-2 font-brand">Load Failed</h2>
        <p className="text-zinc-400 font-sans">{errorState || "Deck could not be loaded."}</p>
      </div>
    );
  }

  const slides = deck.config?.slides || [];
  const menuItemStyles = deck.config?.menuItemStyles;

  return (
    <main
      className="min-h-screen bg-[oklch(0.08_0.01_260)] text-white"
      style={{ fontFamily: deck.config?.googleFont || "inherit" }}
    >
      <SlideCarousel slides={slides} items={items} menuItemStyles={menuItemStyles} />
    </main>
  );
}
