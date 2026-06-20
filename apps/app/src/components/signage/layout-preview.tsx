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
      setScale(Math.min(entry.contentRect.width / 1920, entry.contentRect.height / 1080));
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [config.aspectRatio, config.scaleToFit]);

  const customCss = config.customCss ? `.signage-preview-container { ${config.customCss} }` : "";
  const animationCss = config.menuItemStyles ? buildAllAnimationCss(config.menuItemStyles) : "";

  const previewContent = (
    <div className={`w-full h-full relative st-layout-background overflow-hidden ${config.aspectRatio === "responsive" ? "" : "border-2 border-white/10 shadow-2xl rounded-2xl"}`} style={bgStyle}>
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
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden signage-preview-container bg-black">
      {config.googleFont && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${config.googleFont.replace(/\s+/g, "+")}&display=swap`} />}
      {(customCss || animationCss) && <style>{`${animationCss}\n${customCss}`}</style>}
      {isPreviewing && config.aspectRatio !== "responsive" && config.scaleToFit !== false ? (
        <div ref={containerRef} className="w-[1920px] h-[1080px] shrink-0 origin-center transform-gpu" style={{ transform: `scale(${scale})` }}>{previewContent}</div>
      ) : (
        <div className="w-full h-full relative" ref={containerRef}>{previewContent}</div>
      )}
    </div>
  );
};

export default LayoutPreview;
