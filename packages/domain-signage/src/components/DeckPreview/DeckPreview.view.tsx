"use client";

import { ExternalLink, Edit, Monitor, Copy, Check } from "lucide-react";
import Link from "next/link";
import { ModalShell } from "../../modal-shell";

export interface DeckPreviewData {
  id: string;
  name: string;
  slug: string;
  config?: { slides?: unknown[] };
}

export interface DeckPreviewModalViewProps {
  deck: DeckPreviewData | null;
  loading: boolean;
  copied: boolean;
  liveUrl: string;
  onCopy: () => void;
  onClose: () => void;
  onOpenEditor: () => void;
}

export function DeckPreviewModalView({
  deck,
  loading,
  copied,
  liveUrl,
  onCopy,
  onClose,
  onOpenEditor,
}: DeckPreviewModalViewProps) {
  const slideCount = deck?.config?.slides?.length ?? 0;

  return (
    <ModalShell
      title={loading ? "Loading…" : (deck?.name ?? "Deck Preview")}
      subtitle={
        deck
          ? `${slideCount} slide${slideCount !== 1 ? "s" : ""} · /s/dtown-cafe/${deck.slug}`
          : undefined
      }
      maxWidth="max-w-5xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="dark:text-muted-foreground cursor-pointer rounded-lg border border-black/10 px-4 py-1.5 text-xs text-zinc-500 transition hover:border-white/20 hover:text-zinc-800 dark:border-white/10 dark:text-zinc-200"
          >
            Close
          </button>
          <button
            onClick={onOpenEditor}
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
          <div
            className="relative w-full bg-white dark:bg-black"
            style={{ paddingTop: "56.25%" }}
          >
            <iframe
              src={liveUrl}
              title={deck.name}
              className="absolute inset-0 h-full w-full border-none"
              allow="autoplay; encrypted-media"
            />
          </div>
          <div className="dark:bg-card flex items-center gap-3 border-t border-black/5 bg-zinc-50 px-5 py-4 dark:border-white/5">
            <Monitor className="text-muted-foreground h-4 w-4 shrink-0 dark:text-zinc-500" />
            <p className="dark:text-muted-foreground flex-1 truncate font-mono text-xs text-zinc-500">
              {liveUrl}
            </p>
            <button
              onClick={onCopy}
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
              href={liveUrl}
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

export function DeckPreviewPageView({
  deck,
  liveUrl,
}: {
  deck: DeckPreviewData | null;
  liveUrl: string | null;
}) {
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
            href={`/signage/${deck.id}`}
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
