import React from "react";
import { LibraryReaderContainer } from "@soustools/domain-recipes";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

interface LibraryReaderPageProps {
  params: Promise<{ bookId: string }>;
}

export default async function LibraryReaderPage({
  params,
}: LibraryReaderPageProps) {
  const { bookId } = await params;
  let title = `Book ${bookId}`;
  let pdfUrl: string | null = null;

  try {
    const { data, error } = await (api.GET as any)(`/library/books/${bookId}`, {
      cache: "no-store",
    });
    if (!error && data) {
      title = (data as any).title ?? title;
      pdfUrl = (data as any).pdfUrl ?? null;
    }
  } catch (err) {
    console.error("Failed to fetch book:", err);
  }

  return (
    <LibraryReaderContainer bookId={bookId} title={title} pdfUrl={pdfUrl} />
  );
}
