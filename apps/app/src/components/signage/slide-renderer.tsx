"use client";

import React from "react";
import { SignageSlide, PosItem, SignageLayoutConfig } from "@soustools/api-types";
import { PreviewColumnEditor } from "./preview-column-editor";
import { CanvasColumnCountBar } from "./canvas-column-count-bar";

interface SlideRendererProps {
  slide: SignageSlide;
  items: PosItem[];
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateSlide: (index: number, updates: Partial<SignageSlide>) => void;
  isPreviewing?: boolean;
  onOpenContentPanel?: (columnIndex: number) => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  items,
  config,
  activeSlideIndex,
  onUpdateSlide,
  isPreviewing,
}) => {
  if (slide.type === "IMAGE") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        {slide.imageUrl ? (
          <img src={slide.imageUrl} alt="Slide" className="w-full h-full object-cover" />
        ) : (
          <p className="text-xs text-blue-400 italic font-mono">Image: (no URL set)</p>
        )}
      </div>
    );
  }

  if (slide.type === "VIDEO") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        {slide.videoUrl ? (
          <video src={slide.videoUrl} autoPlay loop={slide.loop} muted={slide.mute} className="w-full h-full object-cover" />
        ) : (
          <p className="text-xs text-purple-400 italic font-mono">Video: (no URL set)</p>
        )}
      </div>
    );
  }

  if (slide.type === "IFRAME") {
    return (
      <div className="w-full h-full">
        {slide.url ? (
          <iframe src={slide.url} className="w-full h-full border-none" title="Iframe slide" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-yellow-400 italic font-mono">Iframe: (no URL set)</p>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "COLUMN_LAYOUT") {
    const colCount = slide.columns.length;
    const colTemplate = slide.splitRatio
      ? slide.splitRatio.split("/").map((r) => `${r}fr`).join(" ")
      : `repeat(${colCount}, minmax(0, 1fr))`;

    return (
      <div className="relative w-full h-full flex flex-col">
        {!isPreviewing && colCount >= 1 && (
          <CanvasColumnCountBar
            count={colCount}
            onChangeCount={(count) => {
              let newCols = [...slide.columns];
              if (newCols.length < count) {
                while (newCols.length < count) newCols.push({ type: "EMPTY" });
              } else {
                newCols = newCols.slice(0, count);
              }
              onUpdateSlide(activeSlideIndex, { columns: newCols });
            }}
          />
        )}
        <div className="grid gap-1.5 h-full p-2" style={{ gridTemplateColumns: colTemplate }}>
          {slide.columns.map((col, idx) => (
            <PreviewColumnEditor
              key={idx}
              column={col}
              items={items}
              soldOutBehavior={config.soldOutBehavior}
              onUpdate={(updates) => {
                const newCols = [...slide.columns];
                newCols[idx] = { ...newCols[idx], ...updates };
                onUpdateSlide(activeSlideIndex, { columns: newCols });
              }}
              onClear={() => {
                const newCols = [...slide.columns];
                newCols[idx] = { type: "EMPTY" };
                onUpdateSlide(activeSlideIndex, { columns: newCols });
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
