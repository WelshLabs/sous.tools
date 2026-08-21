"use client";

import { useState, useEffect } from "react";
import { type SignageDeck } from "../DecksList";
import { SignageEditor as LayoutBuilder } from "../SignageEditor/SignageEditor.container";
import { MOCK_POS_ITEMS } from "../../mock-data";
import { type SignageLayoutConfig, type PosItem } from "@soustools/api-types";
import { mapDbItemToPosItem, type RawDbPosItem } from "../../display-utils";
import { api, createWebSocketClient } from "@soustools/api-client";
import { useRouter } from "next/navigation";

export interface TVSignageEditorProps {
  deckId: string;
  initialDeck?: SignageDeck | null;
  initialItems?: RawDbPosItem[];
}

export function TVSignageEditorContainer({
  deckId,
  initialDeck = null,
  initialItems = [],
}: TVSignageEditorProps) {
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
    const socket = createWebSocketClient({
      query: { deckId },
    });

    const handleConnect = () => {
      socket.emit("join", { deckId });
    };

    const handleItemsUpdated = (payload: {
      deckId: string;
      items: RawDbPosItem[];
    }) => {
      if (payload.deckId === deckId && payload.items) {
        const parsedItems = payload.items.map(mapDbItemToPosItem);
        setItems(parsedItems);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("items_updated", handleItemsUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("items_updated", handleItemsUpdated);
      socket.disconnect();
    };
  }, [deckId]);

  const handleSave = async (newConfig: SignageLayoutConfig) => {
    setSaving(true);
    try {
      const { data, error } = await api.PUT("/signage/layouts/{id}", {
        params: { path: { id: deckId } },
        body: { config: newConfig } as any,
      });
      const responseData = data as any;
      if (!error && responseData?.data) {
        setDeck(responseData.data);
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
      const { data, error } = await api.PUT("/signage/layouts/{id}", {
        params: { path: { id: deckId } },
        body: { name, slug } as any,
      });
      const responseData = data as any;
      if (!error && responseData?.data) {
        setDeck(responseData.data);
        router.refresh();
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  if (!deck) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-zinc-900 dark:text-zinc-100">
        <h2 className="text-xl font-bold text-red-400">Deck Not Found</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          The requested slide deck could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
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

export { TVSignageEditorContainer as TVSignageEditor };
