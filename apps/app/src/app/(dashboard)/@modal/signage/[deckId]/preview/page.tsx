"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ExternalLink, Edit, Monitor, Copy, Check } from "lucide-react";
import { ModalShell } from "../../../../../../components/signage/modal-shell";

interface Params {
  deckId: string;
}

interface DeckData {
  id: string;
  name: string;
  slug: string;
  config?: { slides?: unknown[] };
}

/**
 * Deck Preview Modal — rendered in the @modal parallel slot when
 * the user navigates to /signage/[deckId]/preview from the deck list.
 * The editor route /signage/[deckId] remains untouched.
 */
export default function DeckPreviewModal({
  params,
}: {
  params: Promise<Params>;
}) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/signage/layouts/${deckId}`)
      .then((r) => r.json())
      .then((d: { success: boolean; data: DeckData }) => {
        if (d.success) setDeck(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [deckId]);

  const getLiveUrl = () => {
    if (!deck) return "";
    const base =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5003"
        : window.location.origin;
    return `${base}/s/dtown-cafe/${deck.slug}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getLiveUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slideCount = deck?.config?.slides?.length ?? 0;

  return (
    <ModalShell
      title={loading ? "Loading…" : (deck?.name ?? "Deck Preview")}
      subtitle={
        deck
          ? `${slideCount} slide${slideCount !== 1 ? "s" : ""}  ·  /s/dtown-cafe/${deck.slug}`
          : undefined
      }
      maxWidth="max-w-5xl"
      footer={
        <>
          <button
            onClick={() => router.back()}
            className="px-4 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10 hover:border-white/20 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => router.push(`/signage/${deckId}`)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" /> Open Editor
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin" />
        </div>
      ) : !deck ? (
        <div className="flex items-center justify-center h-64 text-zinc-400 dark:text-zinc-500">
          Deck not found.
        </div>
      ) : (
        <div className="flex flex-col">
          {/* 16:9 live preview iframe */}
          <div className="relative w-full bg-white dark:bg-black" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={getLiveUrl()}
              title={deck.name}
              className="absolute inset-0 w-full h-full border-none"
              allow="autoplay; encrypted-media"
            />
          </div>
          {/* Action strip */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950">
            <Monitor className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 font-mono truncate">{getLiveUrl()}</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 hover:border-white/20 text-zinc-700 dark:text-zinc-300 hover:text-white rounded-lg transition cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <a
              href={getLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 hover:border-white/20 text-zinc-700 dark:text-zinc-300 hover:text-white rounded-lg transition cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in Tab
            </a>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
