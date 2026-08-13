"use client";

import { useEffect } from "react";

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
    console.error("Root kitchen app global layout error caught", {
      err: error,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-card text-zinc-50 font-sans flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-lg max-w-md border border-zinc-900 text-center">
          <h2 className="text-xl font-semibold text-rose-500 mb-4">
            Critical System Error
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            A critical system error occurred. The technical team has been
            notified.
          </p>
          {error?.message && (
            <pre className="text-xs text-left bg-zinc-950 p-3 rounded mb-6 overflow-auto max-h-40 text-rose-400 font-mono">
              {error.message}
            </pre>
          )}
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
