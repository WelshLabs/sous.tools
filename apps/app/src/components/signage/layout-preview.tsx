"use client";

import React from "react";
import { SignageLayoutConfig, PosItem, SignageSlide, SignageOverlay } from "@soustools/api-types";
import { Plus } from "lucide-react";
import { SlideRenderer } from "./slide-renderer";

export interface LayoutPreviewProps {
  config: SignageLayoutConfig;
  items: PosItem[];
  activeSlideIndex: number;
  onUpdateSlide: (index: number, updates: Partial<SignageSlide>) => void;
  isPreviewing?: boolean;
  onOpenContentPanel?: (columnIndex: number) => void;
  onAddOverlay?: (overlay: SignageOverlay) => void;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  config,
  items,
  activeSlideIndex,
  onUpdateSlide,
  isPreviewing = false,
  onOpenContentPanel,
  onAddOverlay,
}) => {
  const activeSlide = config.slides[activeSlideIndex] ?? config.slides[0];

  const fontsToLoad = new Set<string>();
  if (config.googleFont) fontsToLoad.add(config.googleFont);
  if (config.typography) {
    Object.values(config.typography).forEach((f) => f && f !== "Inherit" && fontsToLoad.add(f));
  }

  const customStyles = `
    ${config.customCss ?? ""}
    ${config.typography?.menuItemTitle ? `h5, .menu-item-title { font-family: '${config.typography.menuItemTitle}', sans-serif !important; }` : ""}
    ${config.typography?.menuItemPrice ? `.text-emerald-400, .menu-item-price { font-family: '${config.typography.menuItemPrice}', sans-serif !important; }` : ""}
    ${config.typography?.menuItemDescription ? `p, .menu-item-desc { font-family: '${config.typography.menuItemDescription}', sans-serif !important; }` : ""}
    ${config.typography?.marketingText ? `.marketing-text { font-family: '${config.typography.marketingText}', sans-serif !important; }` : ""}
  `;

  const handleAddOverlay = () => {
    const overlay: SignageOverlay = {
      id: `overlay-${Date.now()}`,
      type: "TEXT",
      content: "New Overlay",
      position: { bottom: "1rem", right: "1rem" },
      zIndex: 10,
    };
    onAddOverlay?.(overlay);
  };

  return (
    <div className="w-full h-full relative">
      {Array.from(fontsToLoad).map((font) => (
        <link
          key={font}
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`}
        />
      ))}
      <style>{customStyles}</style>

      <div
        className="w-full h-full relative overflow-hidden bg-black"
        style={{ fontFamily: config.googleFont || "inherit" }}
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

        {!isPreviewing && (
          <button
            onClick={handleAddOverlay}
            title="Add overlay"
            className="absolute bottom-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800/90 border border-white/10 text-white/60 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LayoutPreview;
