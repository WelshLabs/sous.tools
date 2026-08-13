"use client";

import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export interface LibraryReaderViewProps {
  bookId: string;
  title: string;
  pdfUrl: string | null;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

/**
 * LibraryReaderView — scaffold for the "Private Google Books" PDF reader.
 *
 * Current renderer: native <iframe> (zero-dependency fallback).
 * TODO: Replace with react-pdf <Document>/<Page> once `react-pdf` is installed
 *       and the pdfjs worker is configured in next.config.mjs.
 */
export function LibraryReaderView({
  bookId,
  title,
  pdfUrl,
}: LibraryReaderViewProps) {
  const [zoom, setZoom] = useState(100);

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="flex flex-col h-full min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
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
          <ChevronLeft className="w-4 h-4" />
          Library
        </Link>

        <div
          className="mx-2 h-4 w-px"
          style={{ background: "var(--color-border)" }}
        />

        <BookOpen
          className="w-4 h-4 shrink-0"
          style={{ color: "var(--color-primary)" }}
        />
        <span className="text-sm font-semibold truncate flex-1">{title}</span>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={zoomOut}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span
            className="text-xs font-mono w-10 text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            {zoom}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        )}
      </header>

      {/* ── PDF viewport ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto flex items-start justify-center p-4">
        {pdfUrl ? (
          /*
           * iframe fallback — works for any publicly accessible URL.
           * Replace this block with <Document file={pdfUrl}> from react-pdf
           * once the dependency and worker configuration are in place.
           */
          <motion.div
            layout
            className="shadow-2xl rounded-xl overflow-hidden"
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
          </motion.div>
        ) : (
          /* Empty-state placeholder */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
            className="flex flex-col items-center justify-center gap-4 py-24 text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--color-muted)" }}
            >
              <BookOpen
                className="w-9 h-9"
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
              className="text-sm max-w-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              The scraped content for book{" "}
              <code className="font-mono">{bookId}</code> has not yet been
              processed.
            </p>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
