"use client";

import React, { useState } from "react";
import { DeckCard } from "@soustools/domain-signage";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { type SignageLayoutConfig } from "@soustools/api-types";

import { api } from "@soustools/api-client";

interface SignageDeck {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  config: SignageLayoutConfig;
}

interface DecksListClientProps {
  initialDecks: SignageDeck[];
}

export function DecksListClient({ initialDecks }: DecksListClientProps) {
  const [creating, setCreating] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setCreating(true);
    try {
      const name = `Deck ${initialDecks.length + 1}`;
      const { data, error } = await api.POST("/signage/layouts", {
        body: { name } as any,
      });
      const responseData = data as any;
      if (!error && responseData?.data?.id) {
        router.push(`/signage/${responseData.data.id}`);
      } else {
        const errMsg =
          typeof error === "string"
            ? error
            : (error as any)?.message ||
              responseData?.error ||
              "Failed to create deck";
        alert(errMsg);
      }
    } catch (err) {
      console.error("Failed to create deck:", err);
      alert("Network error: Failed to create deck");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeckToDelete(id);
  };

  const confirmDelete = async () => {
    if (!deckToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await api.DELETE("/signage/layouts/{id}", {
        params: { path: { id: deckToDelete } },
      });
      if (!error) {
        router.refresh();
      } else {
        alert("Failed to delete deck");
      }
    } catch (err) {
      console.error("Failed to delete deck:", err);
      alert("Network error: Failed to delete deck");
    } finally {
      setIsDeleting(false);
      setDeckToDelete(null);
    }
  };

  const handleRename = async (id: string, name: string, slug: string) => {
    try {
      const { error } = await api.PUT("/signage/layouts/{id}", {
        params: { path: { id } },
        body: { name, slug } as any,
      });
      if (!error) {
        router.refresh();
      } else {
        alert("Failed to rename deck");
      }
    } catch (err) {
      console.error("Failed to rename deck:", err);
      alert("Network error: Failed to rename deck");
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-brand text-2xl font-bold text-white">
            My Slide Decks
          </h1>
          <p className="text-muted-foreground mt-1 font-sans text-sm">
            Manage and assign layout decks for digital signage screens.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50"
        >
          {creating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Deck
        </button>
      </div>

      {initialDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/5 p-16 text-center dark:border-white/5">
          <p className="text-muted-foreground mb-4 font-sans">
            No slide decks created yet.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-700"
          >
            Create Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      )}

      {deckToDelete && (
        <div className="bg-card fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="dark:bg-card w-full max-w-sm rounded-2xl border border-black/10 bg-zinc-100 p-6 shadow-2xl dark:border-white/10">
            <h3 className="mb-2 text-lg font-bold text-white">Delete Deck</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Are you sure you want to delete this deck? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeckToDelete(null)}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
