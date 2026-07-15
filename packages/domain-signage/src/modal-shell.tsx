"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ModalShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Width class, default "max-w-4xl" */
  maxWidth?: string;
}

/**
 * Reusable modal chrome for @modal parallel route pages.
 * Closes by calling router.back() — which restores the previous URL,
 * hiding the modal slot content and preserving underlying page state.
 */
export function ModalShell({
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-4xl",
}: ModalShellProps) {
  const router = useRouter();

  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 shrink-0">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
            {subtitle && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:bg-white/5 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-black/5 dark:border-white/5 shrink-0 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
