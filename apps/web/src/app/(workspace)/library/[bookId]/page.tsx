import React from "react";
import { LibraryReaderView } from "./LibraryReaderView";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

interface LibraryReaderPageProps {
  params: Promise<{ bookId: string }>;
}

interface BookData {
  title: string;
  pdfUrl: string | null;
}

async function getBook(bookId: string): Promise<BookData> {
  try {
    const { data, error } = await (api.GET as any)(`/library/books/${bookId}`, {
      cache: "no-store",
    });
    if (!error && data) {
      return {
        title: data.title ?? `Book ${bookId}`,
        pdfUrl: data.pdfUrl ?? null,
      };
    }
  } catch (err) {
    // API not yet implemented — return scaffold placeholder
    console.error("Failed to fetch book:", err);
  }

  return { title: `Book ${bookId}`, pdfUrl: null };
}

export default async function LibraryReaderPage({ params }: LibraryReaderPageProps) {
  const { bookId } = await params;
  const book = await getBook(bookId);

  return (
    <LibraryReaderView
      bookId={bookId}
      title={book.title}
      pdfUrl={book.pdfUrl}
    />
  );
}
