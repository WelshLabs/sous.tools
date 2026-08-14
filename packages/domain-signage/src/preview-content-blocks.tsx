"use client";

import {
  type MenuItemStyles,
  type PosItem,
  type SignageBlock,
} from "@soustools/api-types";
import { PreviewNestedItem } from "./preview-nested-exploded";

import { PreviewCategoryHeader } from "./preview-category-header";
import { PreviewPosItem } from "./preview-pos-item";
import { PreviewMediaCarousel } from "./preview-media-carousel";
import { PreviewModifierGroup } from "./preview-modifier-group";
import { PreviewMenuList } from "./preview-menu-list";
import { PreviewCallout } from "./preview-callout";
import { PreviewTimeline } from "./preview-timeline";

interface PreviewContentBlocksProps {
  block: SignageBlock;
  items: PosItem[];
  styles: MenuItemStyles;
  config?: any;
  onFetchModifierOptions?: (id: string) => Promise<any[]>;
}

export function PreviewContentBlocks({
  block,
  items,
  styles,
  config: _config,
  onFetchModifierOptions,
}: PreviewContentBlocksProps): React.JSX.Element {
  switch (block.type) {
    case "CategoryHeaderBlock":
      return <PreviewCategoryHeader block={block} />;
    case "PosItemBlock":
      return <PreviewPosItem block={block} items={items} styles={styles} />;

    case "CalloutBlock":
      return <PreviewCallout block={block} />;

    case "MenuListBlock":
      return <PreviewMenuList block={block} items={items} styles={styles} />;
    case "NestedItemBlock":
      return <PreviewNestedItem block={block} items={items} styles={styles} />;

    case "MediaCarouselBlock": {
      return <PreviewMediaCarousel block={block} />;
    }

    case "ModifierGroupBlock":
      return (
        <PreviewModifierGroup
          block={block}
          onFetchModifierOptions={onFetchModifierOptions}
        />
      );

    case "ImageBlock": {
      const b = block as any;
      const objectFitClass =
        b.objectFit === "contain"
          ? "object-contain"
          : b.objectFit === "fill"
            ? "object-fill"
            : "object-cover";
      const classes = [
        "w-full h-full min-h-[60px] flex items-center justify-center bg-background/50 border border-dashed border-border rounded overflow-hidden",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {b.imageUrl ? (
            <img
              src={b.imageUrl}
              alt="preview"
              className={`w-full h-full ${objectFitClass}`}
            />
          ) : (
            <span className="text-[10px] text-muted-foreground italic">
              Static Image
            </span>
          )}
        </div>
      );
    }

    case "VideoBlock": {
      const b = block as any;
      const videoSrc =
        b.videoUrl ||
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      const classes = [
        "w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-background/50 border border-dashed border-border rounded overflow-hidden p-0 relative st-video-container aspect-video",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover st-video-player"
          />
          {!b.videoUrl && (
            <div className="absolute inset-0 bg-background/5 dark:bg-background/40 flex items-center justify-center pointer-events-none z-10">
              <span className="text-[10px] text-muted-foreground italic px-3 py-1 bg-background/50 dark:bg-background/60 rounded">
                Placeholder Video
              </span>
            </div>
          )}
        </div>
      );
    }

    case "TimelineBlock":
      return <PreviewTimeline block={block} />;
    default:
      return (
        <div
          className="w-full min-h-[100px] flex items-center justify-center bg-muted/50 border border-dashed border-border rounded"
          data-unique-id={block.uniqueSelector}
        >
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
            Unconfigured Content
          </span>
        </div>
      );
  }
}
