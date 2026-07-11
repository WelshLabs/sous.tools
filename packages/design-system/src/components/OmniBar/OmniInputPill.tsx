"use client";

import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, UploadCloud, FileImage } from "lucide-react";
import { useOmniFileUpload } from "./use-omni-file-upload.hook";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";
import { AttachmentFlyout } from "./AttachmentFlyout";

export interface OmniInputPillProps {
  inputText: string;
  isListening: boolean;
  isProcessing: boolean;
  errorMessage?: string | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMicClick: () => void;
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
  onToggle,
  showClose = true,
  isDragging = false,
  stagedFiles = []
}: OmniInputPillProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);

  const { onFileSelect, handleDrop, handleActionChip, handleFileUpload } = useOmniFileUpload();
  const { setShowGoogleDriveBrowser } = useOmnibarContext();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [inputText]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/") || item.type === "application/pdf") {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleFileUpload(file);
        }
      }
    }
  };

  return (
    <motion.div
      layoutId="omnibar-input-pill"
      variants={{
        idle: { width: "100%", minHeight: "64px", borderRadius: "32px", backgroundColor: "var(--color-card)", borderStyle: "solid" },
        dragging: { width: "300px", minHeight: "300px", borderRadius: "16px", backgroundColor: "var(--color-popover)", borderStyle: "dashed" },
      }}
      initial="idle"
      animate={isDragging ? "dragging" : "idle"}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onDrop={handleDrop}
      className="border border-[var(--color-border)] p-2 pointer-events-auto flex flex-col justify-center overflow-hidden relative mx-auto"
      style={{
        boxShadow: isProcessing ? `0 0 20px var(--color-primary)` : '0 10px 40px -10px rgba(0,0,0,0.5)',
        borderColor: isDragging ? "var(--color-primary)" : (isProcessing ? "var(--color-primary)" : "var(--color-border)"),
      }}
    >
      <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*,application/pdf" />
      
      <AnimatePresence>
        {isDragging && stagedFiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-cyan-400 pointer-events-none"
          >
            <UploadCloud className="w-12 h-12 mb-4 animate-bounce" />
            <span className="font-semibold text-lg tracking-wide">Drop file to analyze</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full flex flex-col gap-4 px-2 z-10 ${isDragging && stagedFiles.length === 0 ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Staged Files Display */}
        {stagedFiles.length > 0 && (
          <div className="flex gap-4 p-2 overflow-x-auto">
            {stagedFiles.map((file) => (
              <motion.div key={file.id} layoutId={`file-${file.id}`} className="relative w-48 shrink-0 flex flex-col gap-2">
                <div className="relative overflow-hidden flex items-center justify-center w-full h-32 rounded-xl bg-card border border-border">
                  {file.status === 'uploading' && (
                    <>
                      <motion.div
                        className="absolute w-[200%] aspect-square"
                        style={{ background: "conic-gradient(from 0deg, transparent 70%, rgba(6,182,212,1) 100%)" }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      />
                      <div className="absolute inset-[2px] bg-background z-10 rounded-xl" />
                    </>
                  )}
                  {file.url ? (
                    <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={file.url} alt="Uploaded" className="w-full h-full object-cover relative z-20" />
                  ) : (
                    <FileImage className="w-8 h-8 text-muted-foreground relative z-20" />
                  )}
                </div>
                {file.status === 'complete' && (
                  <div className="flex flex-col gap-1 w-full text-xs">
                    <button onClick={() => handleActionChip("Ingest Invoice", file)} className="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 font-medium rounded-lg border border-cyan-500/30 transition-colors">
                      Ingest Invoice
                    </button>
                    <button onClick={() => handleActionChip("Attach to Recipe", file)} className="w-full py-1.5 bg-card hover:bg-popover text-muted-foreground rounded-lg border border-border transition-colors">
                      Attach to Recipe
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button onClick={onMicClick} type="button" className="focus:outline-none flex-shrink-0 transition-transform hover:scale-110 ml-2" disabled={isProcessing}>
            <Mic className={`w-5 h-5 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
          </button>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={handlePaste}
            disabled={isProcessing}
            placeholder={isProcessing ? "Chef is thinking..." : "Ask your sous chef"}
            className={`w-full bg-transparent border-none text-foreground text-lg outline-none resize-none overflow-hidden placeholder:text-muted-foreground/50 font-light flex-1 py-3 leading-snug ${isProcessing ? 'opacity-50' : ''}`}
            rows={1}
            autoFocus
          />
          
          <AttachmentFlyout
            isOpen={isAttachmentOpen}
            onToggle={() => setIsAttachmentOpen(!isAttachmentOpen)}
            onUploadClick={() => {
              setIsAttachmentOpen(false);
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
              }
              fileInputRef.current?.click();
            }}
            onCameraClick={() => {
              setIsAttachmentOpen(false);
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute("capture", "environment");
              }
              fileInputRef.current?.click();
            }}
            onGoogleDriveClick={() => {
              setIsAttachmentOpen(false);
              setShowGoogleDriveBrowser(true);
            }}
          />

          {showClose && onToggle && (
            <button 
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 p-2 hover:bg-card rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 text-sm font-medium px-4 pb-2"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
