"use client";

import { motion } from "framer-motion";
import { X, FileImage } from "lucide-react";
import { type StagedFile } from "./OmniBarContext";

export interface VerificationPanelProps {
  stagedFiles: StagedFile[];
  onRemoveFile: (id: string) => void;
  onAction: (action: "Extract Invoice" | "Parse Recipe", file: StagedFile) => void;
}

export function VerificationPanel({
  stagedFiles,
  onRemoveFile,
  onAction
}: VerificationPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 gap-4 w-full h-full">
      <div className="flex flex-col items-center gap-1">
        <span className="text-cyan-400 font-semibold tracking-wide text-xs font-mono uppercase shadow-sm">
          CHEF?
        </span>
        <span className="text-muted-foreground text-xs leading-normal">
          {stagedFiles.length > 0 && stagedFiles[0].file 
            ? `I see "${stagedFiles[0].file.name}". Should I process this as a Recipe or an Invoice?`
            : "Found a document. How should we process it?"}
        </span>
      </div>

      {/* Staged Files Thumbnails */}
      <div className="flex gap-4 overflow-x-auto py-2 justify-center w-full max-w-full">
        {stagedFiles.map((file) => (
          <motion.div
            key={file.id}
            layoutId={`active-task-container-${file.id}`}
            className="relative w-40 shrink-0"
          >
            <div className="relative overflow-hidden flex items-center justify-center w-full h-28 rounded-2xl bg-card border border-border shadow-md">
              {file.status === "uploading" && (
                <>
                  <motion.div
                    className="absolute w-[200%] aspect-square"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 70%, rgba(6,182,212,1) 100%)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                  <div className="absolute inset-[2px] bg-background z-10 rounded-2xl" />
                </>
              )}
              {file.url || file.file ? (
                <img
                  src={file.url || (file.file ? URL.createObjectURL(file.file) : undefined)}
                  alt="Staged Upload"
                  className="w-full h-full object-cover relative z-20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-2xl animate-fadeIn"
                />
              ) : (
                <FileImage className="w-8 h-8 text-muted-foreground relative z-20" />
              )}

              {/* Remove/Cancel Button */}
              <button
                type="button"
                onClick={() => onRemoveFile(file.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 z-30 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Chips */}
      {stagedFiles.every((f) => f.status === "complete") && stagedFiles.length > 0 && (
        <div className="flex flex-col gap-2 w-full max-w-[220px] mt-1">
          <button
            type="button"
            onClick={() => onAction("Extract Invoice", stagedFiles[0])}
            className="w-full py-2 bg-glass-panel text-glass-accent font-medium text-xs rounded-xl border border-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:bg-cyan-500/20 active:scale-98 cursor-pointer animate-fadeIn"
          >
            Extract Invoice
          </button>
          <button
            type="button"
            onClick={() => onAction("Parse Recipe", stagedFiles[0])}
            className="w-full py-2 bg-glass-panel text-glass-accent font-medium text-xs rounded-xl border border-border transition-all hover:bg-muted active:scale-98 cursor-pointer animate-fadeIn"
          >
            Parse Recipe
          </button>
        </div>
      )}
    </div>
  );
}
