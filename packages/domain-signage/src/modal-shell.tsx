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
      className="bg-background/75 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-background border-border relative w-full rounded-2xl border shadow-2xl ${maxWidth} flex max-h-[90vh] flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-foreground text-base font-bold">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
            )}
          </div>
          <button
            onClick={close}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg p-1.5 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-border flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
