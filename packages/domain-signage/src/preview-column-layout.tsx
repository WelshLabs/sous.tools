"use client";

import React from "react";
import { type ColumnLayoutSlide, type SignageSlide, type MenuItemStyles, PosItem } from "@soustools/api-types";
import { PreviewBlockRenderer } from "./preview-block-renderer";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";

interface PreviewColumnLayoutProps {
  activeSlide: ColumnLayoutSlide;
  items: PosItem[];
  activeSlideIndex: number;
  onUpdateSlide: (index: number, updates: Partial<SignageSlide>) => void;
  menuItemStyles?: MenuItemStyles;
}

export const PreviewColumnLayout: React.FC<PreviewColumnLayoutProps> = ({
  activeSlide,
  items,
  menuItemStyles,
}) => {
  const blocks = activeSlide.columns?.[0]?.blocks || [];

  return (
    <div className="flex flex-col h-full w-full p-2 bg-[oklch(0.08_0.01_260)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between mb-2 border-b border-black/5 dark:border-white/5 pb-1">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Layout Preview</span>
      </div>
      <div className="flex flex-col gap-1.5 h-full items-stretch overflow-y-auto">
        {blocks.map(block => (
          <PreviewBlockRenderer key={block.id} block={block} items={items} styles={menuItemStyles || DEFAULT_MENU_ITEM_STYLES} />
        ))}
      </div>
    </div>
  );
};
