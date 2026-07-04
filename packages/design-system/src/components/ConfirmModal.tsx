"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

/**
 * Props for the ConfirmModal component.
 */
export interface ConfirmModalProps {
  /** Controls visibility. When false the modal is unmounted from the DOM. */
  isOpen: boolean;
  /** Heading displayed in the modal. */
  title: string;
  /** Body text providing context for the confirmation action. */
  message: string;
  /** Label for the primary confirm button. @default "Confirm" */
  confirmText?: string;
  /** Label for the cancel button. @default "Cancel" */
  cancelText?: string;
  /**
   * Async-safe confirm handler. The button enters a loading state until the
   * promise resolves or rejects.
   */
  onConfirm: () => void | Promise<void>;
  /** Called when the user cancels via the button, close icon, or backdrop. */
  onCancel: () => void;
  /**
   * When true the confirm button uses the `--color-destructive` (rose-500)
   * palette and the warning icon changes to a red tint.
   * @default false
   */
  isDestructive?: boolean;
}

/**
 * ConfirmModal — a portal-style confirmation dialog for the Neon-Glass design system.
 *
 * Renders above all content at `--z-modal: 100`. The semi-transparent backdrop
 * uses `bg-background/60 backdrop-blur-sm` to preserve the glass-panel
 * aesthetic. Body scroll is locked while the modal is open.
 *
 * The component is self-contained: it manages its own loading state and
 * delegates all business logic to `onConfirm` / `onCancel` callbacks.
 *
 * @tenant-docs-export
 * # ConfirmModal
 * ```tsx
 * import { ConfirmModal } from "@soustools/design-system";
 *
 * <ConfirmModal
 *   isOpen={showDelete}
 *   title="Delete Recipe"
 *   message="This action cannot be undone."
 *   confirmText="Delete"
 *   isDestructive
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 * />
 * ```
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  // Lock body scroll while the modal is mounted and open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer: covers viewport, uses --z-modal (100)
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: "var(--z-modal)" }}
    >
      {/* Backdrop — glass tinted background */}
      <div
        className="absolute inset-0 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        style={{ backgroundColor: "rgb(15 23 42 / 0.60)" }} // --color-background @ 60%
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog panel — glass-card surface above backdrop */}
      <div
        className="relative rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 fade-in duration-200"
        style={{
          zIndex: "calc(var(--z-modal) + 1)",
          backgroundColor: "var(--color-popover)",
          border: "1px solid var(--color-border)",
          color: "var(--color-popover-foreground)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 transition-colors disabled:opacity-50 focus-visible:outline-none"
          aria-label="Close dialog"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon + heading + message */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className="p-3 rounded-full"
            style={{
              backgroundColor: isDestructive
                ? "rgb(244 63 94 / 0.15)" // --color-destructive @ 15%
                : "rgb(245 158 11 / 0.15)", // amber warning @ 15%
              color: isDestructive
                ? "var(--color-destructive)"
                : "#f59e0b", // amber-500 from sous-theme.kdl `yellow`
            }}
          >
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2
            className="text-xl font-bold"
            style={{ color: "var(--color-foreground)" }}
          >
            {title}
          </h2>

          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={isDestructive ? "default" : "default"}
            className="flex-1"
            onClick={handleConfirm}
            disabled={loading}
            style={
              isDestructive
                ? {
                    backgroundColor: "var(--color-destructive)",
                    color: "var(--color-destructive-foreground)",
                  }
                : undefined
            }
          >
            {loading ? "Working…" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
