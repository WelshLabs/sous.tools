"use client";

import React from "react";
import { SignageLayoutConfig, PosItem, SignageSlide, ColumnLayoutSlide } from "@soustools/api-types";
import { SlideRenderer } from "./slide-renderer";

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
  const columnSlide = activeSlide?.type === "COLUMN_LAYOUT" ? (activeSlide as ColumnLayoutSlide) : null;

  const fontsToLoad = new Set<string>();
  if (config.googleFont) fontsToLoad.add(config.googleFont);
  if (config.typography) {
    Object.values(config.typography).forEach((f) => f && f !== "Inherit" && fontsToLoad.add(f));
  }

  const customStyles = `
    ${config.customCss ?? ""}
    ${config.typography?.menuItemTitle ? `h5, .menu-item-title { font-family: '${config.typography.menuItemTitle}', sans-serif !important; }` : ""}
    ${config.typography?.menuItemTitleColor ? `h5, .menu-item-title { color: ${config.typography.menuItemTitleColor} !important; }` : ""}
    ${config.typography?.menuItemPrice ? `.text-emerald-400, .menu-item-price { font-family: '${config.typography.menuItemPrice}', sans-serif !important; }` : ""}
    ${config.typography?.menuItemPriceColor ? `.text-emerald-400, .menu-item-price { color: ${config.typography.menuItemPriceColor} !important; }` : ""}
    ${config.typography?.menuItemDescription ? `p, .menu-item-desc { font-family: '${config.typography.menuItemDescription}', sans-serif !important; }` : ""}
    ${config.typography?.menuItemDescriptionColor ? `p, .menu-item-desc { color: ${config.typography.menuItemDescriptionColor} !important; }` : ""}
    ${config.typography?.marketingText ? `.marketing-text { font-family: '${config.typography.marketingText}', sans-serif !important; }` : ""}
    ${config.typography?.marketingTextColor ? `.marketing-text { color: ${config.typography.marketingTextColor} !important; }` : ""}
  `;

  // Build background style from active slide settings
  const bgStyle: React.CSSProperties & Record<string, string> = {
    fontFamily: config.googleFont || "inherit",
    backgroundColor: columnSlide?.backgroundColor ?? "#000000",
    "--menu-title-font": config.typography?.menuItemTitle || "inherit",
    "--menu-price-font": config.typography?.menuItemPrice || "inherit",
    "--menu-description-font": config.typography?.menuItemDescription || "inherit",
    "--marketing-text-font": config.typography?.marketingText || "inherit",
    "--menu-title-color": config.typography?.menuItemTitleColor || "inherit",
    "--menu-price-color": config.typography?.menuItemPriceColor || "inherit",
    "--menu-desc-color": config.typography?.menuItemDescriptionColor || "inherit",
    "--marketing-text-color": config.typography?.marketingTextColor || "inherit",
  } as any;
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
      <style>{customStyles}</style>

      <div className="w-full h-full relative overflow-hidden" style={bgStyle}>
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
      </div>
    </div>
  );
};

export default LayoutPreview;
