"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { type UnifiedLineItem } from "./UnifiedReviewPanel";

export interface DocumentViewerProps {
  sourceUrl?: string;
  lineItems?: UnifiedLineItem[];
  hoveredIndex?: number | null;
}

export function DocumentViewer({
  sourceUrl,
  lineItems = [],
  hoveredIndex = null,
}: DocumentViewerProps) {
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  // Measure the actual rendered image size so bounding boxes
  // are positioned relative to the image pixels, not the container.
  const measureImage = useCallback(() => {
    if (imgRef.current) {
      setImgSize({
        w: imgRef.current.offsetWidth,
        h: imgRef.current.offsetHeight,
      });
    }
  }, []);

  // Re-measure whenever zoom scale changes
  useEffect(() => {
    if (!imgRef.current) return;
    // Brief delay allows Framer's scale animation to settle
    const timer = setTimeout(measureImage, 120);
    return () => clearTimeout(timer);
  }, [scale, measureImage]);

  // Re-measure on window resize
  useEffect(() => {
    window.addEventListener("resize", measureImage);
    return () => window.removeEventListener("resize", measureImage);
  }, [measureImage]);

  return (
    <div className="relative flex h-[450px] flex-col gap-3 lg:h-[620px]">
      <div className="font-mono text-[10px] font-semibold tracking-widest text-cyan-400 uppercase">
        Document Viewer
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 dark:border-zinc-800/80">
        {sourceUrl ? (
          <div className="relative flex h-full w-full cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing">
            <motion.div
              drag
              dragElastic={0.15}
              dragMomentum={false}
              animate={{ scale }}
              transition={{ duration: 0.1 }}
              // inline-block so the div shrinks to the image's rendered size,
              // which lets absolute children (bounding boxes) be positioned
              // relative to the image, not the outer flex container.
              className="relative inline-block select-none"
            >
              <img
                ref={imgRef}
                src={sourceUrl}
                alt="Uploaded source document"
                onLoad={measureImage}
                className="pointer-events-none block max-h-[380px] w-auto rounded-lg object-contain select-none lg:max-h-[530px]"
              />

              {/* Bounding Boxes — positioned in image-pixel space */}
              {imgSize &&
                lineItems.map((item, idx) => {
                  if (!item.boundingBox || item.boundingBox.length !== 4)
                    return null;
                  // Coordinates are normalised [0,1] in [ymin, xmin, ymax, xmax] order
                  const [ymin, xmin, ymax, xmax] = item.boundingBox;
                  const isHoveredItem = hoveredIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`pointer-events-none absolute rounded border transition-all duration-150 ${
                        isHoveredItem
                          ? "z-30 scale-[1.01] border-cyan-400 bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                          : "z-20 border-cyan-500 bg-cyan-500/10"
                      }`}
                      style={{
                        top: `${ymin * imgSize.h}px`,
                        left: `${xmin * imgSize.w}px`,
                        height: `${(ymax - ymin) * imgSize.h}px`,
                        width: `${(xmax - xmin) * imgSize.w}px`,
                      }}
                    />
                  );
                })}
            </motion.div>
          </div>
        ) : (
          <div className="text-muted-foreground p-6 text-center text-xs italic">
            No source document visual available.
          </div>
        )}

        {sourceUrl && (
          <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/80 p-1.5 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s + 0.25, 4))}
              className="rounded-lg p-1.5 text-cyan-400 hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
              className="rounded-lg p-1.5 text-cyan-400 hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              className="rounded-lg p-1.5 text-cyan-400 hover:bg-white/10"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
