"use client";

import React, { useState, useEffect } from "react";
import { LayoutBuilder, MOCK_POS_ITEMS } from "@soustools/domain-signage";
import { type SignageLayoutConfig, type PosItem } from "@soustools/api-types";
import { io } from "socket.io-client";
import { mapDbItemToPosItem, type RawDbPosItem } from "@/app/display/[id]/helpers";
import { config as appConfig } from "@soustools/config";
import { useRouter } from "next/navigation";

interface SignageDeck {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  config: SignageLayoutConfig;
}

interface TVSignageEditorClientProps {
  deckId: string;
  initialDeck: SignageDeck | null;
  initialItems: RawDbPosItem[];
}

export default function TVSignageEditorClient({ deckId, initialDeck, initialItems }: TVSignageEditorClientProps) {
  const [deck, setDeck] = useState<SignageDeck | null>(initialDeck);
  const [items, setItems] = useState<PosItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map(mapDbItemToPosItem);
    }
    return MOCK_POS_ITEMS;
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDeck(initialDeck);
  }, [initialDeck]);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems.map(mapDbItemToPosItem));
    } else {
      setItems(MOCK_POS_ITEMS);
    }
  }, [initialItems]);

  useEffect(() => {
    const socketUrl = appConfig.API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      query: { deckId },
    });

    socket.on("connect", () => {
      socket.emit("join", { deckId });
    });

    socket.on("items_updated", (payload: { deckId: string; items: RawDbPosItem[] }) => {
      if (payload.deckId === deckId && payload.items) {
        const parsedItems = payload.items.map(mapDbItemToPosItem);
        setItems(parsedItems);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [deckId]);

  const handleSave = async (newConfig: SignageLayoutConfig) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/signage/layouts/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeck(data.data);
        router.refresh();
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRenameDeck = async (name: string, slug: string) => {
    try {
      const res = await fetch(`/api/signage/layouts/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeck(data.data);
        router.refresh();
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-900 dark:text-zinc-100">
        <h2 className="text-xl font-bold text-red-400">Deck Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">The requested slide deck could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] overflow-hidden">
      <LayoutBuilder
        deckId={deckId}
        deckSlug={deck.slug}
        layoutName={deck.name}
        initialConfig={deck.config}
        items={items}
        onSave={handleSave}
        onRenameDeck={handleRenameDeck}
        saving={saving}
      />
    </div>
  );
}
