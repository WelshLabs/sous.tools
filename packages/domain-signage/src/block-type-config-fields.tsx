"use client";

import type {
  SignageBlock,
  PosItem,
  SignageLayoutConfig,
} from "@soustools/api-types";
import { MenuItemStylesInspector } from "./menu-item-styles-inspector";
import { LayoutControls } from "./editor-controls/LayoutControls";
import { TypographyControls } from "./editor-controls/TypographyControls";
import { BackgroundControls } from "./editor-controls/BackgroundControls";
import { BorderControls } from "./editor-controls/BorderControls";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";
import type { MenuItemStyles } from "@soustools/api-types";
import { MenuListBlockConfig } from "./block-configs/menu-list-block-config";
import { CategoryHeaderBlockConfig } from "./block-configs/category-header-block-config";
import { ModifierGroupBlockConfig } from "./block-configs/modifier-group-block-config";
import { ImageBlockConfig } from "./block-configs/image-block-config";
import { VideoBlockConfig } from "./block-configs/video-block-config";
import { TimelineBlockConfig } from "./block-configs/timeline-block-config";
import { NestedItemBlockConfig } from "./block-configs/nested-item-block-config";
import { MediaCarouselBlockConfig } from "./block-configs/media-carousel-block-config";
import { CalloutBlockConfig } from "./block-configs/callout-block-config";

export interface BlockTypeConfigFieldsProps {
  selectedBlockId: string;
  selectedBlock: SignageBlock;
  onUpdateBlock: (blockId: string, updates: Partial<SignageBlock>) => void;
  items: PosItem[];
  onFetchModifierGroups?: (
    posItemId: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  handleUpdateBlockStyles: (s: MenuItemStyles) => void;
  parentExplodedItem: SignageBlock | null;
  config: SignageLayoutConfig;
}

/** Organism: All per-block-type configuration fields rendered inside the block inspector. */
export function BlockTypeConfigFields({
  selectedBlockId,
  selectedBlock,
  onUpdateBlock,
  items,
  onFetchModifierGroups,
  handleUpdateBlockStyles,
  parentExplodedItem,
  config,
}: BlockTypeConfigFieldsProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 space-y-6">
      <MenuListBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
        items={items}
      />
      <CategoryHeaderBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
      />
      <ModifierGroupBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
        onFetchModifierGroups={onFetchModifierGroups}
        parentExplodedItem={parentExplodedItem}
      />
      <ImageBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
      />
      <VideoBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
      />
      <TimelineBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
      />
      <NestedItemBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
        items={items}
      />
      <MediaCarouselBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
      />
      <CalloutBlockConfig
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onUpdateBlock={onUpdateBlock}
      />
      {(selectedBlock.type === "MenuListBlock" ||
        selectedBlock.type === "NestedItemBlock") && (
        <div className="pt-4 border-t border-border">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Item Styles
          </div>
          <MenuItemStylesInspector
            styles={
              selectedBlock.styles ??
              config.menuItemStyles ??
              DEFAULT_MENU_ITEM_STYLES
            }
            onChange={handleUpdateBlockStyles}
            googleFont={config.googleFont}
          />
        </div>
      )}

      <div className="h-px bg-muted/50 w-full my-6" />
      {/* Generic Layout Controls */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1">
          Layout
        </label>
        <LayoutControls
          block={selectedBlock}
          onUpdate={(u) => onUpdateBlock(selectedBlockId, u)}
        />
      </div>
      {/* Generic Typography Controls */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1">
          {selectedBlock.type === "CategoryHeaderBlock"
            ? "Heading Typography"
            : "Typography"}
        </label>
        <TypographyControls
          block={selectedBlock}
          onUpdate={(u) => onUpdateBlock(selectedBlockId, u)}
          globalTokens={config.designTokens}
          context={
            selectedBlock.type === "CategoryHeaderBlock"
              ? "heading"
              : selectedBlock.type === "CalloutBlock"
                ? "body"
                : "body"
          }
        />
      </div>
      {/* Category Header Subtitle Typography */}
      {selectedBlock.type === "CategoryHeaderBlock" && (
        <div className="space-y-3 mt-6">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1">
            Subtitle Typography
          </label>
          <TypographyControls
            block={selectedBlock}
            onUpdate={(u) => onUpdateBlock(selectedBlockId, u)}
            globalTokens={config.designTokens}
            context="subtitle"
            targetField="subtitleTypography"
          />
        </div>
      )}
      {/* Generic Background Controls */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1">
          Background
        </label>
        <BackgroundControls
          block={selectedBlock}
          onUpdate={(u) => onUpdateBlock(selectedBlockId, u)}
        />
      </div>
      {/* Generic Border Controls */}
      <div className="space-y-3">
        <BorderControls
          block={selectedBlock}
          onUpdate={(u) => onUpdateBlock(selectedBlockId, u)}
        />
      </div>
    </div>
  );
}
