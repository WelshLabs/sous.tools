"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import { DecksListView, type SignageDeck } from "./DecksList.view";

export interface DecksListProps {
  initialDecks?: SignageDeck[];
}

export function DecksListContainer({ initialDecks = [] }: DecksListProps) {
  const [decks, setDecks] = useState<SignageDeck[]>(initialDecks);
  const [creating, setCreating] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setCreating(true);
    try {
      const name = `Deck ${decks.length + 1}`;
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
        toast.error(errMsg);
      }
    } catch (err) {
      console.error("Failed to create deck:", err);
      toast.error("Network error: Failed to create deck");
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const { data, error } = await api.GET("/signage/layouts");
      if (!error && data) {
        setDecks((data as any).data || data);
        toast.success("Decks refreshed");
      }
    } catch (err) {
      console.error("Failed to refresh decks:", err);
    }
  };

  const handleDuplicate = async (deck: SignageDeck) => {
    try {
      const { data, error } = await api.POST("/signage/layouts", {
        body: {
          name: `${deck.name} (Copy)`,
          config: deck.config,
        } as any,
      });
      const responseData = data as any;
      if (!error && responseData?.data?.id) {
        setDecks((prev) => [...prev, responseData.data]);
        toast.success("Deck duplicated");
      } else {
        toast.error("Failed to duplicate deck");
      }
    } catch (err) {
      console.error("Duplicate failed", err);
      toast.error("Failed to duplicate deck");
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
        setDecks((prev) => prev.filter((d) => d.id !== deckToDelete));
        toast.success("Deck deleted");
        setDeckToDelete(null);
      } else {
        toast.error("Failed to delete deck");
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete deck");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DecksListView
      decks={decks}
      creating={creating}
      onCreate={handleCreate}
      onRefresh={handleRefresh}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      deckToDelete={deckToDelete}
      isDeleting={isDeleting}
      onConfirmDelete={confirmDelete}
      onCancelDelete={() => setDeckToDelete(null)}
    />
  );
}

export { DecksListContainer as DecksList };
