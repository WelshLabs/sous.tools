"use client";

import React, { useState, useEffect } from "react";
import { LayoutBuilder } from "../../../../components/signage/layout-builder";
import { SignageLayoutConfig, PosItem } from "@soustools/api-types";
import { MOCK_POS_ITEMS } from "../../../../components/signage/mock-data";
import { RefreshCw } from "lucide-react";
import { io } from "socket.io-client";
import { mapDbItemToPosItem, RawDbPosItem } from "../../../display/[id]/helpers";
import { config as appConfig } from "@soustools/config";
import { createBrowserClient } from "@soustools/supabase";

interface SignageDeck {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  config: SignageLayoutConfig;
}

interface TVSignageEditorClientProps {
  deckId: string;
}

export default function TVSignageEditorClient({ deckId }: TVSignageEditorClientProps) {
  const [deck, setDeck] = useState<SignageDeck | null>(null);
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const [deckRes, itemsRes, orgRes] = await Promise.all([
        fetch(`/api/signage/layouts/${deckId}`).then((r) => r.json()),
        fetch("/api/pos/items").then((r) => r.json()),
        supabase.from("organizations").select("design_tokens").limit(1).single()
      ]);
      if (deckRes.success && deckRes.data) {
        const d = deckRes.data;
        if (orgRes.data?.design_tokens && d.config) {
          d.config.designTokens = orgRes.data.design_tokens;
        }
        setDeck(d);
      }
      if (itemsRes.success && itemsRes.data) {
        const parsedItems = (itemsRes.data as RawDbPosItem[]).map(mapDbItemToPosItem);
        setItems(parsedItems);
      } else {
        setItems(MOCK_POS_ITEMS);
      }
    } catch (err) {
      console.error("Failed to fetch editor data:", err);
      setItems(MOCK_POS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deckId]);

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
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-100">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-sm font-mono">Loading editor...</span>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-100">
        <h2 className="text-xl font-bold text-red-400">Deck Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">The requested slide deck could not be loaded.</p>
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
