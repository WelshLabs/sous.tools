"use client";

import { Trash2 } from "lucide-react";
import type { SignageSlide, ColumnLayoutSlide } from "@soustools/api-types";

const COLUMN_COLORS = ["#0091FF", "#22c55e", "#f59e0b", "#ec4899"];

/** Full 640×360 miniature scaled to 25% to fit inside a 160×90 thumbnail. */
export function SlideMiniature({
  slide,
}: {
  slide: SignageSlide;
}): React.ReactElement {
  const colSlide =
    slide.type === "COLUMN_LAYOUT" ? (slide as ColumnLayoutSlide) : null;

  return (
    <div
      style={{
        transform: "scale(0.25)",
        transformOrigin: "top left",
        width: "640px",
        height: "360px",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#1e293b",
      }}
    >
      {/* Type badge top-left */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 999,
          padding: "4px 14px",
          color: "#fff",
          fontSize: 18,
          fontWeight: 600,
          zIndex: 2,
        }}
      >
        {slide.type.replace("_", " ")}
      </div>

      {/* Column dividers for COLUMN_LAYOUT */}
      {colSlide &&
        colSlide.columns.length > 1 &&
        colSlide.columns.slice(1).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${((i + 1) / colSlide.columns.length) * 100}%`,
              width: 4,
              background: COLUMN_COLORS[i % COLUMN_COLORS.length],
              opacity: 0.7,
              zIndex: 1,
            }}
          />
        ))}

      {/* Duration badge bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 999,
          padding: "4px 14px",
          color: "#fff",
          fontSize: 18,
          zIndex: 2,
        }}
      >
        {slide.durationSeconds}s
      </div>
    </div>
  );
}

interface SlideCardProps {
  slide: SignageSlide;
  isActive: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

/** Individual filmstrip thumbnail with hover-revealed trash button. */
export function SlideCard({
  slide,
  isActive,
  onSelect,
  onRemove,
}: SlideCardProps): React.ReactElement {
  return (
    <div
      onClick={onSelect}
      className={[
        "w-40 h-[90px] flex-shrink-0 relative rounded-lg overflow-hidden cursor-pointer group transition-shadow duration-150",
        isActive ? "ring-2 ring-primary" : "ring-1 ring-white/10",
      ].join(" ")}
    >
      <SlideMiniature slide={slide} />
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 dark:bg-background/60 hover:bg-red-500/80 rounded p-0.5"
        aria-label="Remove slide"
      >
        <Trash2 className="w-3 h-3 text-foreground" />
      </button>
    </div>
  );
}
