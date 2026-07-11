"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Camera, HardDrive, Paperclip } from "lucide-react";

export interface AttachmentFlyoutProps {
  isOpen: boolean;
  onToggle: () => void;
  onUploadClick: () => void;
  onCameraClick: () => void;
  onGoogleDriveClick: () => void;
}

export function AttachmentFlyout({
  isOpen,
  onToggle,
  onUploadClick,
  onCameraClick,
  onGoogleDriveClick,
}: AttachmentFlyoutProps) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="flex items-center gap-1.5 bg-[var(--color-popover)] border border-[var(--color-border)] px-2 py-1 rounded-full shadow-lg"
          >
            <button
              type="button"
              onClick={onUploadClick}
              className="text-muted-foreground hover:text-primary p-1.5 hover:bg-card rounded-full transition-colors"
              title="Upload File"
            >
              <UploadCloud className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCameraClick}
              className="text-muted-foreground hover:text-primary p-1.5 hover:bg-card rounded-full transition-colors"
              title="Use Camera"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onGoogleDriveClick}
              className="text-muted-foreground hover:text-primary p-1.5 hover:bg-card rounded-full transition-colors"
              title="Google Drive"
            >
              <HardDrive className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={onToggle}
        className={`p-2 rounded-full transition-colors flex-shrink-0 ${
          isOpen
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:text-primary hover:bg-card"
        }`}
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </div>
  );
}
