"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Camera, Paperclip } from "lucide-react";
import { useOmnibarContext } from "./OmniBarContext";

export interface AttachmentFlyoutProps {
  isOpen: boolean;
  onToggle: () => void;
  onUploadClick: () => void;
  onCameraClick: () => void;
  onGoogleDriveClick: () => void;
}

const GoogleDriveIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 1443 1250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M481 0h481l481 833H962L481 0z" fill="#0066da" />
    <path d="M241 1250L0 833l481-833 240 417-480 833z" fill="#00a852" />
    <path d="M962 1250l241-417H481l-240 417h721z" fill="#ffcc00" />
  </svg>
);

const iconButtonClass =
  "text-muted-foreground hover:text-primary p-1.5 hover:bg-muted rounded-full transition-colors";

export function AttachmentFlyout({
  isOpen,
  onToggle,
  onUploadClick,
  onCameraClick,
  onGoogleDriveClick,
}: AttachmentFlyoutProps) {
  // ── Capability checks (preserved — DO NOT REMOVE) ──────────────────────
  const { isGoogleDriveConnected } = useOmnibarContext();
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      navigator.mediaDevices?.enumerateDevices
    ) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === "videoinput");
          setHasCamera(videoDevices.length > 0);
        })
        .catch(() => {
          setHasCamera(false);
        });
    }
  }, []);
  // ──────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-shrink-0 items-center gap-1.5">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="ds-glass shadow-glow-accent flex items-center gap-1.5 rounded-full px-2 py-1"
          >
            <motion.button
              type="button"
              onClick={onUploadClick}
              className={iconButtonClass}
              title="Upload File"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <UploadCloud className="h-4 w-4" />
            </motion.button>

            {/* Only rendered when device has a camera */}
            {hasCamera && (
              <motion.button
                type="button"
                onClick={onCameraClick}
                className={iconButtonClass}
                title="Use Camera"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-4 w-4" />
              </motion.button>
            )}

            {/* Only rendered when Google Drive integration is connected */}
            {isGoogleDriveConnected && (
              <motion.button
                type="button"
                onClick={onGoogleDriveClick}
                className={`${iconButtonClass} flex items-center justify-center`}
                title="Google Drive"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <GoogleDriveIcon className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onToggle}
        className={`flex-shrink-0 rounded-full p-2 transition-colors ${
          isOpen
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-primary hover:bg-muted"
        }`}
      >
        <Paperclip className="h-5 w-5" />
      </button>
    </div>
  );
}
