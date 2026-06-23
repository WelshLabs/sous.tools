"use client";

import { useEffect } from "react";
import { logger } from "@soustools/logger/browser";

/**
 * Props for the Root GlobalError component.
 */
export interface GlobalErrorProps {
  /**
   * The error object caught by Next.js at root level.
   */
  error: Error & { digest?: string };
  /**
   * Function to reset/retry rendering the root layout.
   */
  reset: () => void;
}

/**
 * GlobalError catches errors at the very root level (including layout.tsx) for signage.
 * Renders fallback HTML and body tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, "Root signage global layout error caught");
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 font-sans flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-lg max-w-md border border-slate-800 text-center">
          <h2 className="text-xl font-semibold text-rose-500 mb-4">Critical Signage Error</h2>
          <p className="text-sm text-slate-400 mb-6">
            A critical menu display error occurred. Please check signage logs.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors cursor-pointer"
          >
            Force Restart Board
          </button>
        </div>
      </body>
    </html>
  );
}
