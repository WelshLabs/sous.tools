"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("POS Simulator client error caught", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-xl font-bold text-rose-500">
        Something went wrong in POS Simulator!
      </h2>
      <button
        onClick={() => reset()}
        className="cursor-pointer rounded bg-rose-600 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-500"
      >
        Try again
      </button>
    </div>
  );
}
