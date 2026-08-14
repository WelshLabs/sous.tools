"use client";

import { useEffect } from "react";

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("POS Simulator global layout error caught", {
      err: error,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-card flex min-h-screen items-center justify-center p-4 font-sans text-zinc-50 antialiased">
        <div className="glass-panel max-w-md rounded-lg border border-zinc-900 p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold text-rose-500">
            Critical POS Simulator Error
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            A critical system error occurred. The technical team has been
            notified.
          </p>
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
