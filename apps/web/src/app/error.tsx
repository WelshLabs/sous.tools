"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Client Error Caught]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <h2 className="mb-2 text-xl font-bold text-rose-500">
        Something went wrong!
      </h2>
      {error?.message && (
        <pre className="mb-4 max-w-xl overflow-auto rounded bg-zinc-900 p-4 text-left font-mono text-xs text-rose-300">
          {error.message}
        </pre>
      )}
      <button
        onClick={() => reset()}
        className="rounded bg-sky-600 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-500"
      >
        Try again
      </button>
    </div>
  );
}
