import React from "react";
import { use } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { config } from "@soustools/config";

interface Params {
  deckId: string;
}

interface DeckData {
  id: string;
  name: string;
  slug: string;
  config?: { slides?: unknown[] };
}

async function fetchDeck(deckId: string): Promise<DeckData | null> {
  try {
    const base = config.APP_BASE_URL;
    const res = await fetch(`${base}/api/signage/layouts/${deckId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

/** Full-page fallback shown when navigating directly to /signage/[deckId]/preview (not intercepted). */
export default async function DeckPreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { deckId } = await use(params);
  const deck = await fetchDeck(deckId);

  const liveBase = config.TV_BASE_URL;
  const liveUrl = deck
    ? `${liveBase}/s/dtown-cafe/${deck.slug}`
    : null;

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
        <p>Deck not found.</p>
        <Link href="/signage" className="mt-4 text-xs text-primary hover:underline">
          ← Back to Decks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{deck.name}</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {deck.config?.slides?.length ?? 0} slides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/signage"
            className="px-3 py-1.5 text-xs border border-white/10 hover:border-white/20 text-zinc-300 rounded-lg transition"
          >
            ← Decks
          </Link>
          <Link
            href={`/signage/${deckId}`}
            className="px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg transition font-semibold"
          >
            Open Editor
          </Link>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/10 hover:border-white/20 text-zinc-300 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live View
            </a>
          )}
        </div>
      </div>

      {liveUrl && (
        <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={liveUrl}
            title={deck.name}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
    </div>
  );
}
