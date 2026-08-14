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
              className={`h-full w-full ${objectFitClass}`}
            />
          ) : (
            <span className="text-muted-foreground text-[10px] italic">
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
            className="st-video-player h-full w-full object-cover"
          />
          {!b.videoUrl && (
            <div className="bg-background/5 dark:bg-background/40 pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <span className="text-muted-foreground bg-background/50 dark:bg-background/60 rounded px-3 py-1 text-[10px] italic">
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
          className="bg-muted/50 border-border flex min-h-[100px] w-full items-center justify-center rounded border border-dashed"
          data-unique-id={block.uniqueSelector}
        >
          <span className="text-muted-foreground text-center text-[10px] font-bold tracking-widest uppercase">
            Unconfigured Content
          </span>
        </div>
      );
  }
}
