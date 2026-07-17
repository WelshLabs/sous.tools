"use client";

import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useOmniFileUpload } from "./use-omni-file-upload.hook";
import { useOmnibarContext } from "./OmniBarContext";
import { OmnibarPerimeterView } from "./OmnibarPerimeterView";
import { PillActions } from "./PillActions";
import { Lettermark } from "../logos/Logo";
import type { StagedFile } from "./OmniBarContext";

export interface OmniInputPillProps {
  inputText: string;
  isListening: boolean;
  isProcessing: boolean;
  errorMessage?: string | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMicClick: () => void;
  onSubmit: () => void;
  onToggle?: () => void;
  showClose?: boolean;
  isDragging?: boolean;
  stagedFiles?: StagedFile[];
}

export function OmniInputPill({
  inputText,
  isListening,
  isProcessing,
  errorMessage,
  onChange,
  onKeyDown,
  onMicClick,
  onSubmit,
  onToggle,
  showClose = true,
  isDragging = false,
  stagedFiles = [],
}: OmniInputPillProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const { onFileSelect, handleDrop, handleFileUpload } = useOmniFileUpload();
  const { setShowGoogleDriveBrowser } = useOmnibarContext();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/") || item.type === "application/pdf") {
        const file = item.getAsFile();
        if (file) { e.preventDefault(); handleFileUpload(file); }
      }
    }
  };

  const canSend = inputText.trim().length > 0 || stagedFiles.length > 0;

  return (
    <motion.div
      layoutId="omnibar-input-pill"
      variants={{
        idle:    { width: "100%",  minHeight: "64px",  borderRadius: "32px", backgroundColor: "var(--color-card)",    borderStyle: "solid"  },
        dragging:{ width: "300px", minHeight: "300px", borderRadius: "16px", backgroundColor: "var(--color-popover)", borderStyle: "dashed" },
        droplet: { width: "380px", minHeight: "300px", borderRadius: "24px", backgroundColor: "var(--color-card)",    borderStyle: "solid"  },
      }}
      initial="idle"
      animate={isDragging ? "dragging" : "idle"}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onDrop={handleDrop}
      className="border border-border p-2 pointer-events-auto flex flex-col justify-center overflow-hidden relative mx-auto max-w-[92vw] sm:max-w-full backdrop-blur-xl"
      style={{
        borderColor: isDragging || isProcessing ? "var(--color-primary)" : "var(--color-border)",
      }}
    >
      <OmnibarPerimeterView busy={isProcessing} />
      <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*,application/pdf" />

      {/* Drop-zone overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-accent pointer-events-none"
          >
            <UploadCloud className="w-12 h-12 mb-4 animate-bounce" />
            <span className="font-semibold text-lg tracking-wide">Drop file to analyze</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full flex flex-col gap-4 px-2 z-10 ${isDragging ? "opacity-0" : "opacity-100"}`}>
        {/* ── Main row ── */}
        <div className="flex items-center gap-2">
          {/* Lettermark — pulses while processing */}
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Lettermark gradient className={`w-7 h-7 transition-opacity ${isProcessing ? "animate-pulse opacity-60" : "opacity-100"}`} />
          </span>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={handlePaste}
            disabled={isProcessing}
            placeholder={isProcessing ? "Chef is thinking..." : "Ask your sous chef"}
            className={`w-full bg-transparent border-none text-foreground text-lg outline-none resize-none overflow-hidden placeholder:text-muted-foreground/50 font-light flex-1 py-3 leading-snug ${isProcessing ? "opacity-50" : ""}`}
            rows={1}
            autoFocus
          />

          {/* Button cluster (mic | attach | submit | close) */}
          <PillActions
            isListening={isListening}
            isProcessing={isProcessing}
            canSend={canSend}
            showClose={showClose}
            hasToggle={!!onToggle}
            isAttachmentOpen={isAttachmentOpen}
            onMicClick={onMicClick}
            onSubmit={onSubmit}
            onToggle={onToggle}
            onAttachmentToggle={() => setIsAttachmentOpen(!isAttachmentOpen)}
            onUploadClick={() => {
              setIsAttachmentOpen(false);
              if (fileInputRef.current) fileInputRef.current.removeAttribute("capture");
              fileInputRef.current?.click();
            }}
            onCameraClick={() => {
              setIsAttachmentOpen(false);
              if (fileInputRef.current) fileInputRef.current.setAttribute("capture", "environment");
              fileInputRef.current?.click();
            }}
            onGoogleDriveClick={() => {
              setIsAttachmentOpen(false);
              setShowGoogleDriveBrowser(true);
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="text-destructive text-sm font-medium px-4 pb-2"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
