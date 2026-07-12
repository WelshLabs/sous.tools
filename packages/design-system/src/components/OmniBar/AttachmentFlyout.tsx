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
  <svg className={className} viewBox="0 0 1443 1250" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M481 0h481l481 833H962L481 0z" fill="#0066da" />
    <path d="M241 1250L0 833l481-833 240 417-480 833z" fill="#00a852" />
    <path d="M962 1250l241-417H481l-240 417h721z" fill="#ffcc00" />
  </svg>
);

export function AttachmentFlyout({
  isOpen,
  onToggle,
  onUploadClick,
  onCameraClick,
  onGoogleDriveClick,
}: AttachmentFlyoutProps) {
  const { isGoogleDriveConnected } = useOmnibarContext();
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
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
            
            {hasCamera && (
              <button
                type="button"
                onClick={onCameraClick}
                className="text-muted-foreground hover:text-primary p-1.5 hover:bg-card rounded-full transition-colors"
                title="Use Camera"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {isGoogleDriveConnected && (
              <button
                type="button"
                onClick={onGoogleDriveClick}
                className="text-muted-foreground hover:text-primary p-1.5 hover:bg-card rounded-full transition-colors flex items-center justify-center"
                title="Google Drive"
              >
                <GoogleDriveIcon className="w-4 h-4" />
              </button>
            )}
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

