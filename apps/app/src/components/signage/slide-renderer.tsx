"use client";

import React from "react";
import { SignageSlide, PosItem, SignageLayoutConfig, SignageBlock } from "@soustools/api-types";
import { BlockEditorNode } from "./block-editor-node";
import { PreviewBlockRenderer } from "./preview-block-renderer";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";

interface SlideRendererProps {
  slide: SignageSlide;
  items: PosItem[];
  config: SignageLayoutConfig;
  isPreviewing?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string | null) => void;
  onAddBlock?: (parentId: string) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide, items, config, isPreviewing,
  selectedBlockId, onSelectBlock, onAddBlock, onUpdateBlock
}) => {
  if (slide.type === "IMAGE") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        {slide.imageUrl ? <img src={slide.imageUrl} alt="Slide" className="w-full h-full object-cover" /> : <p className="text-xs text-blue-400 italic font-mono">Image: (no URL set)</p>}
      </div>
    );
  }
  if (slide.type === "VIDEO") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        {slide.videoUrl ? <video src={slide.videoUrl} autoPlay loop={slide.loop} muted={slide.mute} className="w-full h-full object-cover" /> : <p className="text-xs text-purple-400 italic font-mono">Video: (no URL set)</p>}
      </div>
    );
  }
  if (slide.type === "IFRAME") {
    return (
      <div className="w-full h-full">
        {slide.url ? <iframe src={slide.url} className="w-full h-full border-none" title="Iframe slide" /> : <div className="flex items-center justify-center h-full"><p className="text-xs text-yellow-400 italic font-mono">Iframe: (no URL set)</p></div>}
      </div>
    );
  }
  
  if (slide.type === "COLUMN_LAYOUT") {
    const blocks = slide.columns?.[0]?.blocks || [];
    const styles = config.menuItemStyles || DEFAULT_MENU_ITEM_STYLES;

    if (isPreviewing) {
      return (
        <div className="relative w-full h-full flex flex-col bg-black">
          {blocks.map(block => (
            <PreviewBlockRenderer key={block.id} block={block} items={items} styles={styles} isRoot />
          ))}
        </div>
      );
    }

    return (
      <div 
        className="relative w-full h-full flex flex-col p-4"
        onClick={(e) => { e.stopPropagation(); onSelectBlock?.(null); }}
      >
        {blocks.length > 0 ? blocks.map((block, idx) => (
          <BlockEditorNode
            key={block.id || `block-fallback-${idx}`}
            block={block}
            items={items}
            menuItemStyles={styles}
            onUpdate={onUpdateBlock!}
            onAddBlock={onAddBlock!}
            onSelectBlock={onSelectBlock!}
            selectedBlockId={selectedBlockId || undefined}
            isRoot
          />
        )) : (
          <div className="flex-1 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-zinc-500 text-sm cursor-pointer hover:border-cyan-400 hover:text-cyan-400 transition-colors">
             Empty Canvas
          </div>
        )}
      </div>
    );
  }
  
  return null;
};
