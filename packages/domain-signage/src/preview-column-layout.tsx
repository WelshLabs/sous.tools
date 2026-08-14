"use client";

import {
  type ColumnLayoutSlide,
  type SignageSlide,
  type MenuItemStyles,
  type PosItem,
} from "@soustools/api-types";
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
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-[oklch(0.08_0.01_260)] p-2">
      <div className="border-border mb-2 flex items-center justify-between border-b pb-1">
        <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
          Layout Preview
        </span>
      </div>
      <div className="flex h-full flex-col items-stretch gap-1.5 overflow-y-auto">
        {blocks.map((block) => (
          <PreviewBlockRenderer
            key={block.id}
            block={block}
            items={items}
            styles={menuItemStyles || DEFAULT_MENU_ITEM_STYLES}
          />
        ))}
      </div>
    </div>
  );
};
