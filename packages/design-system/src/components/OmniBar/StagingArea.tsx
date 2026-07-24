"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";

const springTransition = { type: "spring" as const, stiffness: 380, damping: 30, mass: 0.8 };

interface StagingAreaProps {
  files: StagedFile[];
}

function StagedFileThumbnail({ file, index }: { file: StagedFile; index: number }) {
  const { setStagedFiles } = useOmnibarContext();

  const handleRemove = () => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const isPdf = file.file?.type === "application/pdf";

  return (
    <motion.div
      layout
      key={file.id}
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.75, y: 6 }}
      transition={{ ...springTransition, delay: index * 0.04 }}
      className="relative shrink-0 group"
    >
      {/* Thumbnail card */}
      <div
        className="relative w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center border"
        style={{
          background: "var(--ds-glass-fill)",
          borderColor: "var(--color-border)",
        }}
      >
        {file.previewUrl ? (
          <img
            src={file.previewUrl}
            alt={file.file?.name ?? "Staged image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-1">
            <FileText
              className="w-6 h-6"
              style={{ color: isPdf ? "var(--destructive)" : "var(--color-primary)" }}
            />
            <span
              className="text-[9px] font-semibold uppercase tracking-wide leading-none text-center truncate w-full px-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {isPdf ? "PDF" : file.file?.name?.split(".").pop() ?? "FILE"}
            </span>
          </div>
        )}

        {/* Filename tooltip on hover */}
        <div
          className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none rounded-xl"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}
        >
          <span className="text-[8px] text-white font-medium px-1 pb-1 truncate w-full text-center leading-none">
            {file.file?.name}
          </span>
        </div>
      </div>

      {/* Dismiss button */}
      <motion.button
        type="button"
        aria-label={`Remove ${file.file?.name ?? "file"}`}
        onClick={handleRemove}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        transition={springTransition}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10 border cursor-pointer"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          color: "var(--muted-foreground)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        <X className="w-2.5 h-2.5" />
      </motion.button>
    </motion.div>
  );
}

/**
 * StagingArea — animated thumbnail strip rendered above the textarea.
 * Files accumulate here until the user hits Enter to dispatch the payload.
 */
export function StagingArea({ files }: StagingAreaProps) {
  return (
    <AnimatePresence mode="popLayout">
      {files.length > 0 && (
        <motion.div
          key="staging-area"
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={springTransition}
          className="overflow-hidden"
        >
          <motion.div
            layout
            className="flex flex-wrap gap-2 pt-1 pb-2 px-1"
          >
            <AnimatePresence mode="popLayout">
              {files.map((file, index) => (
                <StagedFileThumbnail key={file.id} file={file} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Divider */}
          <div
            className="mx-1 mb-2 h-px"
            style={{ background: "var(--color-border)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
