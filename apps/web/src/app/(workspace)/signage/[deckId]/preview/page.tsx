import React from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { clientConfig as config } from "@soustools/config/client";

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
    const base = config.NEXT_PUBLIC_APP_URL;
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
  const { deckId } = await params;
  const deck = await fetchDeck(deckId);

  const liveBase = config.NEXT_PUBLIC_APP_URL;
  const liveUrl = deck ? `${liveBase}/s/dtown-cafe/${deck.slug}` : null;

  if (!deck) {
    return (
      <div className="text-muted-foreground flex min-h-[50vh] flex-col items-center justify-center dark:text-zinc-500">
        <p>Deck not found.</p>
        <Link
          href="/signage"
          className="text-primary mt-4 text-xs hover:underline"
        >
          ← Back to Decks
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{deck.name}</h1>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs dark:text-zinc-500">
            {deck.config?.slides?.length ?? 0} slides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/signage"
            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-zinc-700 transition hover:border-white/20 dark:border-white/10 dark:text-zinc-300"
          >
            ← Decks
          </Link>
          <Link
            href={`/signage/${deckId}`}
            className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
          >
            Open Editor
          </Link>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs text-zinc-700 transition hover:border-white/20 dark:border-white/10 dark:text-zinc-300"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Live View
            </a>
          )}
        </div>
      </div>

      {liveUrl && (
        <div
          className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black"
          style={{ paddingTop: "56.25%" }}
        >
          <iframe
            src={liveUrl}
            title={deck.name}
            className="absolute inset-0 h-full w-full border-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
    </div>
  );
}
