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
      <body className="bg-card flex min-h-screen items-center justify-center p-4 font-sans text-zinc-50 antialiased">
        <div className="glass-panel max-w-md rounded-lg border border-zinc-900 p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold text-rose-500">
            Critical System Error
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            A critical system error occurred. The technical team has been
            notified.
          </p>
          {error?.message && (
            <pre className="mb-6 max-h-40 overflow-auto rounded bg-zinc-950 p-3 text-left font-mono text-xs text-rose-400">
              {error.message}
            </pre>
          )}
          <button
            onClick={() => reset()}
            className="cursor-pointer rounded bg-rose-600 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-500"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
