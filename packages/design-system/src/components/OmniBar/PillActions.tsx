"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, ArrowUp } from "lucide-react";
import { AttachmentFlyout } from "./AttachmentFlyout";

interface PillActionsProps {
  isListening: boolean;
  isProcessing: boolean;
  canSend: boolean;
  showClose: boolean;
  hasToggle: boolean;
  isAttachmentOpen: boolean;
  onMicClick: () => void;
  onSubmit: () => void;
  onToggle: (() => void) | undefined;
  onAttachmentToggle: () => void;
  onUploadClick: () => void;
  onCameraClick: () => void;
  onGoogleDriveClick: () => void;
}

/**
 * PillActions — right-side button cluster for OmniInputPill.
 * Extracted to keep OmniInputPill under the 200-line max.
 * Pure presentational — no hooks or data fetching.
 */
export function PillActions({
  isListening,
  isProcessing,
  canSend,
  showClose,
  hasToggle,
  isAttachmentOpen,
  onMicClick,
  onSubmit,
  onToggle,
  onAttachmentToggle,
  onUploadClick,
  onCameraClick,
  onGoogleDriveClick,
}: PillActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {/* Mic */}
      <button
        onClick={onMicClick}
        type="button"
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none"
        disabled={isProcessing}
      >
        <Mic className={`h-5 w-5 ${isListening ? "text-primary" : ""}`} />
      </button>

      {/* Attachment flyout */}
      <AttachmentFlyout
        isOpen={isAttachmentOpen}
        onToggle={onAttachmentToggle}
        onUploadClick={onUploadClick}
        onCameraClick={onCameraClick}
        onGoogleDriveClick={onGoogleDriveClick}
      />

      {/* Submit — conditionally visible when there is content */}
      <AnimatePresence>
        {canSend && (
          <motion.button
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            type="submit"
            onClick={onSubmit}
            disabled={isProcessing}
            aria-label="Send message"
            className="bg-primary text-primary-foreground shadow-glow-sm flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Close */}
      {showClose && hasToggle && (
        <button
          onClick={onToggle}
          type="button"
          aria-label="Close"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
