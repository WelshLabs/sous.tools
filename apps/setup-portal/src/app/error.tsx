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
    console.error("Setup Portal client error caught", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-xl font-bold text-rose-500 mb-4">
        Something went wrong in Setup Portal!
      </h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
