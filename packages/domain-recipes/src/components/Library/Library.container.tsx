"use client";

import { LibraryView, type Book } from "./Library.view";

export interface LibraryProps {
  books?: Book[];
}

export function LibraryContainer({ books = [] }: LibraryProps) {
  return <LibraryView books={books} />;
}

export { LibraryContainer as Library };
