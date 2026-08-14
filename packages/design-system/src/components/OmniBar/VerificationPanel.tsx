"use client";

import { motion } from "framer-motion";
import { X, FileImage } from "lucide-react";
import { type StagedFile } from "./OmniBarContext";

export interface VerificationPanelProps {
  stagedFiles: StagedFile[];
  onRemoveFile: (id: string) => void;
  onAction: (
    action: "Extract Invoice" | "Parse Recipe",
    file: StagedFile,
  ) => void;
}

export function VerificationPanel({
  stagedFiles,
  onRemoveFile,
  onAction,
}: VerificationPanelProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-xs font-semibold tracking-wide text-cyan-400 uppercase shadow-sm">
          CHEF?
        </span>
        <span className="text-muted-foreground text-xs leading-normal">
          {stagedFiles.length > 0 && stagedFiles[0].file
            ? `I see "${stagedFiles[0].file.name}". Should I process this as a Recipe or an Invoice?`
            : "Found a document. How should we process it?"}
        </span>
      </div>

      {/* Staged Files Thumbnails */}
      <div className="flex w-full max-w-full justify-center gap-4 overflow-x-auto py-2">
        {stagedFiles.map((file) => (
          <motion.div
            key={file.id}
            layoutId={`active-task-container-${file.id}`}
            className="relative w-40 shrink-0"
          >
            <div className="bg-card border-border relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border shadow-md">
              {file.status === "uploading" && (
                <>
                  <motion.div
                    className="absolute aspect-square w-[200%]"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 70%, rgba(6,182,212,1) 100%)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                  <div className="bg-background absolute inset-[2px] z-10 rounded-2xl" />
                </>
              )}
              {file.url || file.file ? (
                <img
                  src={
                    file.url ||
                    (file.file ? URL.createObjectURL(file.file) : undefined)
                  }
                  alt="Staged Upload"
                  className="animate-fadeIn relative z-20 h-full w-full rounded-2xl border border-cyan-500/30 object-cover shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                />
              ) : (
                <FileImage className="text-muted-foreground relative z-20 h-8 w-8" />
              )}

              {/* Remove/Cancel Button */}
              <button
                type="button"
                onClick={() => onRemoveFile(file.id)}
                className="absolute top-2 right-2 z-30 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Chips */}
      {stagedFiles.every((f) => f.status === "complete") &&
        stagedFiles.length > 0 && (
          <div className="mt-1 flex w-full max-w-[220px] flex-col gap-2">
            <button
              type="button"
              onClick={() => onAction("Extract Invoice", stagedFiles[0])}
              className="bg-glass-panel text-glass-accent animate-fadeIn w-full cursor-pointer rounded-xl border border-cyan-500/30 py-2 text-xs font-medium shadow-[0_0_12px_rgba(6,182,212,0.1)] transition-all hover:bg-cyan-500/20 active:scale-98"
            >
              Extract Invoice
            </button>
            <button
              type="button"
              onClick={() => onAction("Parse Recipe", stagedFiles[0])}
              className="bg-glass-panel text-glass-accent border-border hover:bg-muted animate-fadeIn w-full cursor-pointer rounded-xl border py-2 text-xs font-medium transition-all active:scale-98"
            >
              Parse Recipe
            </button>
          </div>
        )}
    </div>
  );
}
