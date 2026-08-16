"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      <DialogContent className="max-w-sm overflow-visible bg-transparent p-0 shadow-none [perspective:1200px] [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, rotateX: -92, scale: 0.88 }}
          animate={{ opacity: 1, rotateX: 0, scale: 1 }}
          exit={{ opacity: 0, rotateX: 92, scale: 0.88 }}
          transition={{ duration: 0.64, ease: [0.23, 1, 0.32, 1] }}
          className="ds-glass-strong [transform-origin:center_bottom] rounded-[var(--radius-xl)] border border-[var(--ds-glass-border)] p-6 shadow-[0_30px_80px_-32px_var(--primary)] [transform-style:preserve-3d]"
        >
          <DialogHeader className="flex flex-col items-center gap-4 text-center sm:text-center">
            <motion.div
              initial={{ scale: 0.6, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 320,
                damping: 20,
              }}
              className={
                isDestructive
                  ? "bg-destructive/15 text-destructive flex rounded-full p-3"
                  : "bg-warning/15 text-warning flex rounded-full p-3"
              }
            >
              <AlertTriangle className="h-8 w-8" />
            </motion.div>

            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-8 flex gap-3 sm:justify-center">
            <Button
              variant="glass"
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
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
