"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export interface Book {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
}

export interface LibraryViewProps {
  books: Book[];
}

export function LibraryView({ books }: LibraryViewProps) {
  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-6 duration-500 md:p-8">
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
          <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-2xl">
            <BookOpen className="text-primary h-9 w-9" />
          </div>
          <p className="text-lg font-semibold">No books yet</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            Books will appear here once the scraper pipeline has processed them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/library/${book.id}`}
              className="group hover:border-primary/50 flex flex-col gap-2 rounded-xl border p-3 transition-all hover:shadow-lg"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
              }}
            >
              <div
                className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg"
                style={{ background: "var(--color-muted)" }}
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="text-muted-foreground h-10 w-10" />
                )}
              </div>
              <p className="group-hover:text-primary line-clamp-2 text-xs leading-snug font-semibold transition-colors">
                {book.title}
              </p>
              {book.author && (
                <p className="text-muted-foreground truncate text-[10px]">
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
