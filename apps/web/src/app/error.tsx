'use client'; // Error components must be Client Components
 
import { useEffect } from 'react';
 
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
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-xl font-bold text-rose-500 mb-2">Something went wrong!</h2>
      {error?.message && (
        <pre className="text-xs text-left bg-zinc-900 text-rose-300 p-4 rounded mb-4 max-w-xl overflow-auto font-mono">
          {error.message}
        </pre>
      )}
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
