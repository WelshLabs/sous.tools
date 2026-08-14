"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Edit, Monitor, Copy, Check } from "lucide-react";
import { ModalShell } from "@soustools/domain-signage";

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
            className="dark:text-muted-foreground cursor-pointer rounded-lg border border-black/10 px-4 py-1.5 text-xs text-zinc-500 transition hover:border-white/20 hover:text-zinc-800 dark:border-white/10 dark:text-zinc-200"
          >
            Close
          </button>
          <button
            onClick={() => router.push(`/signage/${deckId}`)}
            className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition"
          >
            <Edit className="h-3.5 w-3.5" /> Open Editor
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      ) : !deck ? (
        <div className="text-muted-foreground flex h-64 items-center justify-center dark:text-zinc-500">
          Deck not found.
        </div>
      ) : (
        <div className="flex flex-col">
          {/* 16:9 live preview iframe */}
          <div
            className="relative w-full bg-white dark:bg-black"
            style={{ paddingTop: "56.25%" }}
          >
            <iframe
              src={getLiveUrl()}
              title={deck.name}
              className="absolute inset-0 h-full w-full border-none"
              allow="autoplay; encrypted-media"
            />
          </div>
          {/* Action strip */}
          <div className="dark:bg-card flex items-center gap-3 border-t border-black/5 bg-zinc-50 px-5 py-4 dark:border-white/5">
            <Monitor className="text-muted-foreground h-4 w-4 shrink-0 dark:text-zinc-500" />
            <p className="dark:text-muted-foreground flex-1 truncate font-mono text-xs text-zinc-500">
              {getLiveUrl()}
            </p>
            <button
              onClick={handleCopy}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs text-zinc-700 transition hover:border-white/20 hover:text-white dark:border-white/10 dark:text-zinc-300"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <a
              href={getLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs text-zinc-700 transition hover:border-white/20 hover:text-white dark:border-white/10 dark:text-zinc-300"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in Tab
            </a>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
