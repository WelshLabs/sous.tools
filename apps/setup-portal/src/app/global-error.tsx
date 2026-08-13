"use client";

import { useEffect } from "react";

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Setup Portal global layout error caught", {
      err: error,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-card text-zinc-50 font-sans flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-lg max-w-md border border-zinc-900 text-center">
          <h2 className="text-xl font-semibold text-rose-500 mb-4">
            Critical Setup Portal Error
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            A critical system error occurred. The technical team has been
            notified.
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
