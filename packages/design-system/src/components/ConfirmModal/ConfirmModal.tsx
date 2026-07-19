"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../Button/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../Dialog/Dialog";

/**
 * Props for the ConfirmModal component.
 */
export interface ConfirmModalProps {
  /** Controls visibility. */
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
   * When true the confirm button uses destructive styles.
   * @default false
   */
  isDestructive?: boolean;
}

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

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="flex flex-col items-center text-center sm:text-center space-y-4">
          <div
            className="p-3 rounded-full flex items-center justify-center mx-auto"
            style={{
              backgroundColor: isDestructive
                ? "rgb(244 63 94 / 0.15)"
                : "rgb(245 158 11 / 0.15)",
              color: isDestructive ? "var(--color-destructive)" : "#f59e0b",
            }}
          >
            <AlertTriangle className="w-8 h-8" />
          </div>

          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-center gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={isDestructive ? "destructive" : "primary"}
            className="flex-1"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Working…" : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
