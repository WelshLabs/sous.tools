"use client";

import {
  type SignageSlide,
  type PosItem,
  type SignageLayoutConfig,
  type SignageBlock,
} from "@soustools/api-types";
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
  onFetchModifierOptions?: (id: string) => Promise<any[]>;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  items,
  config,
  isPreviewing,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onUpdateBlock,
  onFetchModifierOptions,
}) => {
  if (slide.type === "IMAGE") {
    return (
      <div className="bg-card flex h-full w-full items-center justify-center">
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt="Slide"
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="font-mono text-xs text-blue-400 italic">
            Image: (no URL set)
          </p>
        )}
      </div>
    );
  }
  if (slide.type === "VIDEO") {
    return (
      <div className="bg-card flex h-full w-full items-center justify-center">
        {slide.videoUrl ? (
          <video
            src={slide.videoUrl}
            autoPlay
            loop={slide.loop}
            muted={slide.mute}
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="font-mono text-xs text-purple-400 italic">
            Video: (no URL set)
          </p>
        )}
      </div>
    );
  }
  if (slide.type === "IFRAME") {
    return (
      <div className="h-full w-full">
        {slide.url ? (
          <iframe
            src={slide.url}
            className="h-full w-full border-none"
            title="Iframe slide"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-xs text-yellow-400 italic">
              Iframe: (no URL set)
            </p>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "COLUMN_LAYOUT") {
    const blocks = slide.columns?.[0]?.blocks || [];
    const styles = config.menuItemStyles || DEFAULT_MENU_ITEM_STYLES;

    if (isPreviewing) {
      return (
        <div className="bg-background dark:bg-background relative flex h-full w-full flex-col">
          {blocks.map((block) => (
            <PreviewBlockRenderer
              key={block.id}
              block={block}
              items={items}
              styles={styles}
              isRoot
              onFetchModifierOptions={onFetchModifierOptions}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className="relative flex h-full w-full flex-col p-4"
        onClick={(e) => {
          e.stopPropagation();
          onSelectBlock?.(null);
        }}
      >
        {blocks.length > 0 ? (
          blocks.map((block, idx) => (
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
          ))
        ) : (
          <div className="border-border text-muted-foreground flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed text-sm transition-colors hover:border-cyan-400 hover:text-cyan-400">
            Empty Canvas
          </div>
        )}
      </div>
    );
  }

  return null;
};
