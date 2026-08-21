"use client";

import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Layers,
  Edit,
  Trash2,
  Copy,
  Monitor,
} from "lucide-react";
import { Button } from "@soustools/design-system";
import { type SignageLayoutConfig } from "@soustools/api-types";

export interface SignageDeck {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  config: SignageLayoutConfig;
}

export interface DecksListViewProps {
  decks: SignageDeck[];
  creating: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onDuplicate: (deck: SignageDeck) => void;
  onDelete: (id: string) => void;
  deckToDelete: string | null;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function DecksListView({
  decks,
  creating,
  onCreate,
  onRefresh,
  onDuplicate,
  onDelete,
  deckToDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}: DecksListViewProps) {
  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Signage Decks
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage TV signage layout decks for your displays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={onCreate}
            disabled={creating}
            className="flex items-center gap-2 bg-sky-500 text-white hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Creating..." : "New Deck"}
          </Button>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <Layers className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-lg font-bold text-white">No Decks Found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Get started by creating your first TV signage presentation deck.
          </p>
          <Button
            onClick={onCreate}
            disabled={creating}
            className="mt-6 bg-sky-500 text-white hover:bg-sky-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="glass-panel group relative flex flex-col justify-between rounded-2xl border border-white/10 p-6 transition-all hover:border-white/20"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onDuplicate(deck)}
                      className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(deck.id)}
                      className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{deck.name}</h3>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  /{deck.slug || deck.id.slice(0, 8)}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-muted-foreground text-xs">
                  {(deck.config as any)?.columns
                    ? `${(deck.config as any).columns.length} columns`
                    : "Default Layout"}
                </span>

                <Link
                  href={`/signage/${deck.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 transition-colors hover:text-sky-300"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Layout
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {deckToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Deck?</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Are you sure you want to delete this deck? Displays assigned to
              this deck will no longer render it.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 text-white hover:bg-rose-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
