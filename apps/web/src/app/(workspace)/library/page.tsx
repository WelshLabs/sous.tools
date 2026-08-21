import React from "react";
import { LibraryContainer } from "@soustools/domain-recipes";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  let books = [];
  try {
    const { data, error } = await (api.GET as any)("/library/books", {
      cache: "no-store",
    });
    if (!error && data) books = (data as any).books ?? [];
  } catch (err) {
    console.error("Failed to fetch library:", err);
  }

  return <LibraryContainer books={books} />;
}
