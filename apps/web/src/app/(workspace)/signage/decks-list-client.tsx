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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-brand">
            My Slide Decks
          </h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Manage and assign layout decks for digital signage screens.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
        >
          {creating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Deck
        </button>
      </div>

      {initialDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl p-16 text-center">
          <p className="text-muted-foreground font-sans mb-4">
            No slide decks created yet.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
          >
            Create Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-card backdrop-blur-sm p-4">
          <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Deck</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this deck? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeckToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
