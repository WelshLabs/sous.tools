import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

interface Book {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
}

async function getBooks(): Promise<Book[]> {
  try {
    const { data, error } = await (api.GET as any)("/library/books", {
      cache: "no-store",
    });
    if (!error && data) return data.books ?? [];
  } catch (err) {
    console.error("Failed to fetch library:", err);
  }
  return [];
}

export default async function LibraryPage() {
  const books = await getBooks();

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Private Library
        </h1>
        <p className="text-muted-foreground text-sm">
          Scraped textbooks and culinary references, available for offline
          reading.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-muted">
            <BookOpen className="w-9 h-9 text-primary" />
          </div>
          <p className="text-lg font-semibold">No books yet</p>
          <p className="text-sm max-w-xs text-muted-foreground">
            Books will appear here once the scraper pipeline has processed them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/library/${book.id}`}
              className="group flex flex-col gap-2 rounded-xl border p-3 transition-all hover:border-primary/50 hover:shadow-lg"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
              }}
            >
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: "var(--color-muted)" }}
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {book.title}
              </p>
              {book.author && (
                <p className="text-[10px] text-muted-foreground truncate">
                  {book.author}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
