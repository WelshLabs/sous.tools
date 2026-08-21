"use client";

import { BookOpen, ChevronLeft, Download, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";

export interface LibraryReaderViewProps {
  bookId: string;
  title: string;
  pdfUrl: string | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function LibraryReaderView({
  bookId,
  title,
  pdfUrl,
  zoom,
  onZoomIn,
  onZoomOut,
}: LibraryReaderViewProps) {
  return (
    <div
      className="flex h-full min-h-screen flex-col"
      style={{ background: "var(--color-background)" }}
    >
      <header
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)",
        }}
      >
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Library
        </Link>

        <div
          className="mx-2 h-4 w-px"
          style={{ background: "var(--color-border)" }}
        />

        <BookOpen
          className="h-4 w-4 shrink-0"
          style={{ color: "var(--color-primary)" }}
        />
        <span className="flex-1 truncate text-sm font-semibold">{title}</span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onZoomOut}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span
            className="w-10 text-center font-mono text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {zoom}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        )}
      </header>

      <main className="flex flex-1 items-start justify-center overflow-auto p-4">
        {pdfUrl ? (
          <div
            className="overflow-hidden rounded-xl shadow-2xl"
            style={{
              width: `${zoom}%`,
              maxWidth: "960px",
              minWidth: "320px",
              border: "1px solid var(--color-border)",
            }}
          >
            <iframe
              src={pdfUrl}
              title={title}
              className="w-full"
              style={{ height: "calc(100vh - 120px)", border: "none" }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: "var(--color-muted)" }}
            >
              <BookOpen
                className="h-9 w-9"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--color-foreground)" }}
            >
              No PDF available
            </p>
            <p
              className="max-w-xs text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              The scraped content for book{" "}
              <code className="font-mono">{bookId}</code> has not yet been
              processed.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
