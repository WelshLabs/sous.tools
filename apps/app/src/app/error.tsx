"use client";

import { useEffect } from "react";
import { logger } from "@soustools/logger/browser";

/**
 * Props for the Root ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /**
   * The error object caught by Next.js.
   */
  error: Error & { digest?: string };
  /**
   * Function to reset/retry rendering the boundary.
   */
  reset: () => void;
}

/**
 * ErrorBoundary is caught at the dashboard layout level.
 * It logs errors to the browser logger (New Relic) and displays an error message with kitchen mode theme.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, "Global kitchen app layout error caught by boundary");
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-slate-50 p-4">
      <div className="glass-panel p-8 rounded-lg max-w-md border border-zinc-900 text-center">
        <h2 className="text-xl font-semibold text-rose-500 mb-4">Something went wrong!</h2>
        <p className="text-sm text-zinc-400 mb-6">
          An unexpected error has occurred. The system logs have been updated automatically.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
