"use client";

import React from "react";
import { SignageLayoutConfig, PosItem, SignageSlide } from "@soustools/api-types";
import { SlideRenderer } from "./slide-renderer";
import { buildAllAnimationCss } from "./menu-item-style-utils";

export interface LayoutPreviewProps {
  config: SignageLayoutConfig;
  items: PosItem[];
  activeSlideIndex: number;
  onUpdateSlide: (index: number, updates: Partial<SignageSlide>) => void;
  isPreviewing?: boolean;
  onOpenContentPanel?: (columnIndex: number) => void;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  config,
  items,
  activeSlideIndex,
  onUpdateSlide,
  isPreviewing = false,
  onOpenContentPanel,
}) => {
  const activeSlide = config.slides[activeSlideIndex] ?? config.slides[0];
  const columnSlide = activeSlide?.type === "COLUMN_LAYOUT" ? activeSlide : null;

  // Load Google font for base font only
  const fontsToLoad = new Set<string>();
  if (config.googleFont) fontsToLoad.add(config.googleFont);

  // Animation keyframes from menuItemStyles
  const animationCss = config.menuItemStyles
    ? buildAllAnimationCss(config.menuItemStyles)
    : "";

  // Custom CSS scoped to preview container
  const customCss = config.customCss
    ? `.signage-preview-container { ${config.customCss} }`
    : "";

  const bgStyle: React.CSSProperties = {
    fontFamily: config.googleFont ? `'${config.googleFont}', sans-serif` : "inherit",
    backgroundColor: columnSlide?.backgroundColor ?? "#000000",
  };
  if (columnSlide?.backgroundImageUrl) {
    bgStyle.backgroundImage = `url(${columnSlide.backgroundImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  return (
    <div className="w-full h-full relative">
      {Array.from(fontsToLoad).map((font) => (
        <link
          key={font}
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`}
        />
      ))}
      {(customCss || animationCss) && (
        <style>{`${animationCss}\n${customCss}`}</style>
      )}

      <div
        className="w-full h-full relative overflow-hidden signage-preview-container"
        style={bgStyle}
      >
        {!activeSlide ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm font-mono">Click + Add Slide to begin</p>
          </div>
        ) : (
          <SlideRenderer
            slide={activeSlide}
            items={items}
            config={config}
            activeSlideIndex={activeSlideIndex}
            onUpdateSlide={onUpdateSlide}
            isPreviewing={isPreviewing}
            onOpenContentPanel={onOpenContentPanel}
          />
        )}

        {/* Overlays */}
        {(config.overlays ?? []).map((o) => (
          <div
            key={o.id}
            className={`absolute text-[9px] bg-slate-900/80 border border-slate-700 px-1.5 py-0.5 rounded shadow signage-overlay ${o.customCssClass ?? ""}`}
            style={{
              top: o.position.top ?? "auto",
              bottom: o.position.bottom ?? "auto",
              left: o.position.left ?? "auto",
              right: o.position.right ?? "auto",
              zIndex: o.zIndex ?? 10,
            }}
          >
            {o.type === "BADGE" && (
              <span className="bg-red-500 text-white font-bold px-0.5 rounded mr-0.5 text-[8px]">SOLD OUT</span>
            )}
            {o.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutPreview;
