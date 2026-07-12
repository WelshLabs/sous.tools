"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface DocumentViewerProps {
  sourceUrl?: string;
}

export function DocumentViewer({ sourceUrl }: DocumentViewerProps) {
  const [scale, setScale] = useState(1);
  return (
    <div className="flex flex-col gap-3 h-[450px] lg:h-[620px] relative">
      <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">Document Viewer</div>
      <div className="flex-1 relative rounded-2xl border border-white/10 dark:border-zinc-800/80 overflow-hidden bg-slate-950/80 flex items-center justify-center">
        {sourceUrl ? (
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden">
            <motion.img
              src={sourceUrl}
              alt="Uploaded source document"
              drag
              dragElastic={0.15}
              dragMomentum={false}
              animate={{ scale }}
              transition={{ duration: 0.1 }}
              className="max-w-none max-h-none absolute object-contain select-none"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic text-center p-6">No source document visual available.</div>
        )}

        {sourceUrl && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur border border-white/10 p-1.5 rounded-xl z-10 shadow-lg">
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s + 0.25, 4))}
              className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
              className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setScale(1)} className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400" title="Reset Zoom">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
