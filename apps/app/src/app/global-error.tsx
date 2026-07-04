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
 * GlobalError catches errors at the very root level (including layout.tsx).
 * Renders fallback HTML and body tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, "Root kitchen app global layout error caught");
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-zinc-950 text-slate-50 font-sans flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-lg max-w-md border border-zinc-900 text-center">
          <h2 className="text-xl font-semibold text-rose-500 mb-4">Critical System Error</h2>
          <p className="text-sm text-zinc-400 mb-6">
            A critical system error occurred. The technical team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors cursor-pointer"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
