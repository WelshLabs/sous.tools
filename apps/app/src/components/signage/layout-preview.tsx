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
      --global-subtitle-font: ${config.designTokens?.subtitleFont ? `'${config.designTokens.subtitleFont}', sans-serif` : "inherit"};
      --global-body-font: ${config.designTokens?.bodyFont ? `'${config.designTokens.bodyFont}', sans-serif` : "inherit"};
    }
  `;

  let combinedCustomCss = cssVars;
  if (config.designTokens?.globalCss) combinedCustomCss += `\n@scope (.st-signage-root) {\n${config.designTokens.globalCss}\n}\n`;
  if (config.customCss) combinedCustomCss += `\n@scope (.st-signage-root) {\n${config.customCss}\n}\n`;
  
  const customCss = combinedCustomCss;
  const animationCss = config.menuItemStyles ? buildAllAnimationCss(config.menuItemStyles) : "";

  const previewContent = (
    <div className={`w-full h-full relative st-layout-background ${config.aspectRatio === "responsive" ? "" : "border-2 border-white/10 shadow-2xl rounded-2xl"}`} style={bgStyle}>
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
    <div className="w-full h-full relative flex items-start justify-center signage-preview-container bg-black pt-8 st-signage-root" ref={containerRef}>
      {config.googleFont && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${config.googleFont.replace(/\s+/g, "+")}&display=swap`} />}
      {config.designTokens?.headingFont && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${config.designTokens.headingFont.replace(/\s+/g, "+")}&display=swap`} />}
      {config.designTokens?.subtitleFont && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${config.designTokens.subtitleFont.replace(/\s+/g, "+")}&display=swap`} />}
      {config.designTokens?.bodyFont && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${config.designTokens.bodyFont.replace(/\s+/g, "+")}&display=swap`} />}
      {(customCss || animationCss) && <style dangerouslySetInnerHTML={{ __html: `${animationCss}\n${customCss}` }} />}
      {isPreviewing && config.aspectRatio !== "responsive" && config.scaleToFit !== false ? (
        <div className="w-[1920px] h-[1080px] shrink-0 origin-top transform-gpu shadow-2xl" style={{ transform: `scale(${scale})` }}>{previewContent}</div>
      ) : (
        <div className="w-full h-full">{previewContent}</div>
      )}
    </div>
  );
};

export default LayoutPreview;
