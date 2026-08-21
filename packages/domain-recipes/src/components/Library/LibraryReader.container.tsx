"use client";

import { useState } from "react";
import { LibraryReaderView } from "./LibraryReader.view";

export interface LibraryReaderProps {
  bookId: string;
  title: string;
  pdfUrl: string | null;
}

export function LibraryReaderContainer({
  bookId,
  title,
  pdfUrl,
}: LibraryReaderProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  return (
    <LibraryReaderView
      bookId={bookId}
      title={title}
      pdfUrl={pdfUrl}
      zoom={zoom}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
    />
  );
}

export { LibraryReaderContainer as LibraryReader };
