"use client";

import React, { useRef, useState, useEffect } from "react";
import { SignageLayoutConfig, PosItem, SignageBlock } from "@soustools/api-types";
import { SlideRenderer } from "./slide-renderer";
import { buildAllAnimationCss } from "./menu-item-style-utils";

export interface LayoutPreviewProps {
  config: SignageLayoutConfig;
  items: PosItem[];
  activeSlideIndex: number;
  isPreviewing?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string | null) => void;
  onAddBlock?: (parentId: string) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  config, items, activeSlideIndex, isPreviewing = false,
  selectedBlockId, onSelectBlock, onAddBlock, onUpdateBlock
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const activeSlide = config.slides[activeSlideIndex] ?? config.slides[0];
  const columnSlide = activeSlide?.type === "COLUMN_LAYOUT" ? activeSlide : null;

  const fontFamilies = new Set<string>();
  if (config.googleFont) fontFamilies.add(config.googleFont);
  if (config.designTokens?.headingFont) fontFamilies.add(config.designTokens.headingFont);
  if (config.designTokens?.subtitleFont) fontFamilies.add(config.designTokens.subtitleFont);
  if (config.designTokens?.bodyFont) fontFamilies.add(config.designTokens.bodyFont);

  config.slides.forEach(slide => {
    if (slide.type === "COLUMN_LAYOUT") {
      slide.columns.forEach(col => {
        col.blocks?.forEach(block => {
          if (block.visuals?.typography?.fontFamily) fontFamilies.add(block.visuals.typography.fontFamily);
          if (block.visuals?.subtitleTypography?.fontFamily) fontFamilies.add(block.visuals.subtitleTypography.fontFamily);
        });
      });
    }
  });

  const uniqueFonts = Array.from(fontFamilies).filter(f => f && f !== "inherit" && f !== "Global Default");

  const bgStyle: React.CSSProperties = {
    fontFamily: config.googleFont ? `'${config.googleFont}', sans-serif` : "inherit",
    backgroundColor: columnSlide?.backgroundColor ?? "transparent",
  };
  if (columnSlide?.backgroundImageUrl) {
    bgStyle.backgroundImage = `url(${columnSlide.backgroundImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  useEffect(() => {
    if (config.aspectRatio === "responsive" || config.scaleToFit === false) return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.max(0.1, (entry.contentRect.width - 64) / 1920));
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [config.aspectRatio, config.scaleToFit]);

    const cssVars = `
      .st-signage-root {
        --global-primary: ${config.designTokens?.primaryColor || "#06b6d4"};
        --global-accent: ${config.designTokens?.accentColor || "#3b82f6"};
        --global-heading-font: ${config.designTokens?.headingFont ? `'${config.designTokens.headingFont}', sans-serif` : "inherit"};
        --global-heading-color: ${config.designTokens?.headingColor || "inherit"};
        --global-heading-weight: ${config.designTokens?.headingWeight || "inherit"};
        --global-subtitle-font: ${config.designTokens?.subtitleFont ? `'${config.designTokens.subtitleFont}', sans-serif` : "inherit"};
        --global-subtitle-color: ${config.designTokens?.subtitleColor || "inherit"};
        --global-subtitle-weight: ${config.designTokens?.subtitleWeight || "inherit"};
        --global-body-font: ${config.designTokens?.bodyFont ? `'${config.designTokens.bodyFont}', sans-serif` : "inherit"};
        --global-body-color: ${config.designTokens?.bodyColor || "inherit"};
        --global-body-weight: ${config.designTokens?.bodyWeight || "inherit"};
      }
    `;

  const googleFontsUrl = uniqueFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700`).join("&")}&display=swap`
    : "";

  let combinedCustomCss = "";
  if (googleFontsUrl) combinedCustomCss += `@import url('${googleFontsUrl}');\n`;
  combinedCustomCss += cssVars;
  
  if (config.designTokens?.globalCss) combinedCustomCss += `\n@scope (.st-signage-root) {\n${config.designTokens.globalCss}\n}\n`;
  if (config.customCss) combinedCustomCss += `\n@scope (.st-signage-root) {\n${config.customCss}\n}\n`;
  
  const customCss = combinedCustomCss;
  const animationCss = config.menuItemStyles ? buildAllAnimationCss(config.menuItemStyles) : "";

  const previewContent = (
    <div className={`w-full flex-1 min-h-[100vh] relative st-layout-background flex flex-col ${config.aspectRatio === "responsive" ? "" : "border-2 border-white/10 shadow-2xl rounded-2xl"}`} style={bgStyle}>
      {!activeSlide ? (
        <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">Click + Add Slide to begin</div>
      ) : (
        <SlideRenderer
          slide={activeSlide} items={items} config={config} isPreviewing={isPreviewing}
          selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} onAddBlock={onAddBlock} onUpdateBlock={onUpdateBlock}
        />
      )}
      {(config.overlays ?? []).map((o) => (
        <div key={o.id} className={`absolute text-[9px] bg-slate-900/80 border border-slate-700 px-1.5 py-0.5 rounded shadow signage-overlay ${o.customCssClass ?? ""}`} style={{ top: o.position.top, bottom: o.position.bottom, left: o.position.left, right: o.position.right, zIndex: o.zIndex ?? 10 }}>
          {o.type === "BADGE" && <span className="bg-red-500 text-white font-bold px-0.5 rounded mr-0.5 text-[8px]">SOLD OUT</span>}
          {o.content}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full min-h-full relative flex items-start justify-center signage-preview-container bg-black pt-8 pb-32 st-signage-root" ref={containerRef}>
      {(customCss || animationCss) && <style dangerouslySetInnerHTML={{ __html: `${animationCss}\n${customCss}` }} />}
      {isPreviewing && config.aspectRatio !== "responsive" && config.scaleToFit !== false ? (
        <div className="w-[1920px] h-[1080px] shrink-0 origin-top transform-gpu shadow-2xl" style={{ transform: `scale(${scale})` }}>{previewContent}</div>
      ) : (
        <div className="w-full min-h-full flex-1 flex flex-col">{previewContent}</div>
      )}
    </div>
  );
};

export default LayoutPreview;
