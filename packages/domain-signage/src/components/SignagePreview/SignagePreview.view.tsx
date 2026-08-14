/* eslint-disable max-lines */
import React from "react";
import {
  type SignageLayoutConfig,
  type PosItem,
  type SignageSlide,
  type SignageBlock,
} from "@soustools/api-types";
import {
  buildAllAnimationCss,
  buildTitleStyle,
  buildPriceStyle,
  resolveItemState,
  getTypoStyle,
} from "../../menu-item-style-utils";
import { DEFAULT_MENU_ITEM_STYLES } from "../../config-migration";
import { BlockEditorNode } from "../../block-editor-node";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Plus } from "lucide-react";

export interface SignagePreviewViewProps {
  config: SignageLayoutConfig;
  items: PosItem[];
  activeSlideIndex: number;
  isPreviewing?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string | null) => void;
  onAddBlock?: (parentId: string) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
  fetchModifiers: (id: string) => Promise<any[]>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  onSelectSlide?: (index: number) => void;
  onAddSlide?: () => void;
  onRemoveSlide?: (index: number) => void;
  onReorderSlides?: (slides: SignageSlide[]) => void;
}

export const SignagePreviewView: React.FC<SignagePreviewViewProps> = (
  props,
) => {
  const { config, activeSlideIndex, isPreviewing, containerRef, scale } = props;
  const activeSlide = config.slides[activeSlideIndex] ?? config.slides[0];
  const columnSlide =
    activeSlide?.type === "COLUMN_LAYOUT" ? activeSlide : null;

  const fontFamilies = new Set<string>();
  if (config.googleFont) fontFamilies.add(config.googleFont);
  if (config.designTokens?.headingFont)
    fontFamilies.add(config.designTokens.headingFont);
  if (config.designTokens?.subtitleFont)
    fontFamilies.add(config.designTokens.subtitleFont);
  if (config.designTokens?.bodyFont)
    fontFamilies.add(config.designTokens.bodyFont);

  config.slides.forEach((slide) => {
    if (slide.type === "COLUMN_LAYOUT") {
      slide.columns?.forEach((col) => {
        col.blocks?.forEach((block) => {
          if (block.visuals?.typography?.fontFamily)
            fontFamilies.add(block.visuals.typography.fontFamily);
          if (block.visuals?.subtitleTypography?.fontFamily)
            fontFamilies.add(block.visuals.subtitleTypography.fontFamily);
        });
      });
    }
  });

  const uniqueFonts = Array.from(fontFamilies).filter(
    (f) => f && f !== "inherit" && f !== "Global Default",
  );

  const bgStyle: React.CSSProperties = {
    fontFamily: config.googleFont
      ? `'${config.googleFont}', sans-serif`
      : "inherit",
    backgroundColor: columnSlide?.backgroundColor ?? "transparent",
  };
  if (columnSlide?.backgroundImageUrl) {
    bgStyle.backgroundImage = `url(${columnSlide.backgroundImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

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

  const googleFontsUrl =
    uniqueFonts.length > 0
      ? `https://fonts.googleapis.com/css2?${uniqueFonts.map((f) => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700`).join("&")}&display=swap`
      : "";

  let customCss = "";
  if (googleFontsUrl) customCss += `@import url('${googleFontsUrl}');\n`;
  customCss += cssVars;
  if (config.designTokens?.globalCss)
    customCss += `\n@scope (.st-signage-root) {\n${config.designTokens.globalCss}\n}\n`;
  if (config.customCss)
    customCss += `\n@scope (.st-signage-root) {\n${config.customCss}\n}\n`;

  const animationCss = config.menuItemStyles
    ? buildAllAnimationCss(config.menuItemStyles)
    : "";

  return (
    <div
      className="signage-preview-container bg-background dark:bg-background st-signage-root relative flex min-h-full w-full flex-col items-center justify-start pt-8 pb-32"
      ref={containerRef}
    >
      {(customCss || animationCss) && (
        <style
          dangerouslySetInnerHTML={{ __html: `${animationCss}\n${customCss}` }}
        />
      )}

      {isPreviewing &&
      config.aspectRatio !== "responsive" &&
      config.scaleToFit !== false ? (
        <div
          className="h-[1080px] w-[1920px] shrink-0 origin-top transform-gpu shadow-2xl"
          style={{ transform: `scale(${scale})` }}
        >
          <PreviewContent
            {...props}
            bgStyle={bgStyle}
            activeSlide={activeSlide}
          />
        </div>
      ) : (
        <div className="flex min-h-[500px] w-full flex-1 flex-col">
          <PreviewContent
            {...props}
            bgStyle={bgStyle}
            activeSlide={activeSlide}
          />
        </div>
      )}

      {!isPreviewing && config.slides.length > 0 && (
        <div className="mt-8 w-full max-w-full">
          <SlideFilmstrip {...props} slides={config.slides} />
        </div>
      )}
    </div>
  );
};

const PreviewContent = (props: any) => {
  const {
    config,
    activeSlide,
    bgStyle,
    items,
    isPreviewing,
    selectedBlockId,
    onSelectBlock,
    onAddBlock,
    onUpdateBlock,
    fetchModifiers,
  } = props;
  return (
    <div
      className={`st-layout-background relative flex h-full w-full flex-1 flex-col ${config.aspectRatio === "responsive" ? "" : "border-border rounded-2xl border-2 shadow-2xl"}`}
      style={bgStyle}
    >
      {!activeSlide ? (
        <div className="text-muted-foreground flex h-full items-center justify-center font-mono text-sm">
          Click + Add Slide to begin
        </div>
      ) : (
        <SlideRenderer
          slide={activeSlide}
          items={items}
          config={config}
          isPreviewing={isPreviewing}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onAddBlock={onAddBlock}
          onUpdateBlock={onUpdateBlock}
          fetchModifiers={fetchModifiers}
        />
      )}
      {(config.overlays ?? []).map((o: any) => (
        <div
          key={o.id}
          className={`bg-background/80 border-border signage-overlay absolute rounded border px-1.5 py-0.5 text-[9px] shadow ${o.customCssClass ?? ""}`}
          style={{
            top: o.position.top,
            bottom: o.position.bottom,
            left: o.position.left,
            right: o.position.right,
            zIndex: o.zIndex ?? 10,
          }}
        >
          {o.type === "BADGE" && (
            <span className="text-foreground mr-0.5 rounded bg-red-500 px-0.5 text-[8px] font-bold">
              SOLD OUT
            </span>
          )}
          {o.content}
        </div>
      ))}
    </div>
  );
};

const SlideRenderer = (props: any) => {
  const {
    slide,
    items,
    config,
    isPreviewing,
    selectedBlockId,
    onSelectBlock,
    onAddBlock,
    onUpdateBlock,
    fetchModifiers,
  } = props;
  if (slide.type === "IMAGE")
    return (
      <div className="bg-card flex h-full w-full items-center justify-center">
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt="Slide"
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="text-xs text-blue-400 italic">Image: (no URL set)</p>
        )}
      </div>
    );
  if (slide.type === "VIDEO")
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
          <p className="text-xs text-purple-400 italic">Video: (no URL set)</p>
        )}
      </div>
    );
  if (slide.type === "IFRAME")
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
            <p className="text-xs text-yellow-400 italic">
              Iframe: (no URL set)
            </p>
          </div>
        )}
      </div>
    );

  if (slide.type === "COLUMN_LAYOUT") {
    const blocks = slide.columns?.[0]?.blocks || [];
    const styles = config.menuItemStyles || DEFAULT_MENU_ITEM_STYLES;
    if (isPreviewing) {
      return (
        <div className="bg-background dark:bg-background relative flex h-full w-full flex-col">
          {blocks.map((block: any) => (
            <PreviewBlockRenderer
              key={block.id}
              block={block}
              items={items}
              styles={styles}
              isRoot
              fetchModifiers={fetchModifiers}
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
          blocks.map((block: any, idx: number) => (
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

const PreviewBlockRenderer = (props: any) => {
  const { block, items, styles, isRoot, fetchModifiers } = props;
  switch (block.type) {
    case "ColumnBlock": {
      const classes = [
        "flex flex-col gap-2 w-full st-layout-column",
        block.panelStyle === "glass"
          ? "st-glass-panel p-2 border border-border bg-muted/50 rounded"
          : "",
        isRoot ? "flex-1 h-full" : "",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub: any, idx: number) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              fetchModifiers={fetchModifiers}
            />
          ))}
        </div>
      );
    }
    case "RowBlock": {
      const classes = [
        "flex flex-row gap-2 w-full overflow-x-auto st-layout-row",
        block.panelStyle === "glass"
          ? "st-glass-panel p-2 border border-border bg-muted/50 rounded"
          : "",
        isRoot ? "flex-1 h-full" : "",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub: any, idx: number) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              fetchModifiers={fetchModifiers}
            />
          ))}
        </div>
      );
    }
    case "GridBlock": {
      const colClass =
        {
          1: "grid-cols-1",
          2: "grid-cols-2",
          3: "grid-cols-3",
          4: "grid-cols-4",
          5: "grid-cols-5",
          6: "grid-cols-6",
        }[block.columns as number] || "grid-cols-2";
      const classes = [
        "grid gap-2 w-full st-layout-grid",
        colClass,
        block.panelStyle === "glass"
          ? "st-glass-panel p-2 border border-border bg-muted/50 rounded"
          : "",
        isRoot ? "flex-1 h-full" : "",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.cells || []).map((sub: any, idx: number) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              fetchModifiers={fetchModifiers}
            />
          ))}
        </div>
      );
    }
    case "ExplodedItemBlock": {
      const classes = [
        "flex flex-col gap-2 w-full st-exploded-item",
        block.panelStyle === "glass"
          ? "st-glass-panel p-2 border border-border bg-muted/50 rounded"
          : "",
        isRoot ? "flex-1 h-full" : "",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub: any, idx: number) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              fetchModifiers={fetchModifiers}
            />
          ))}
        </div>
      );
    }
    default:
      return (
        <PreviewContentBlocks
          block={block}
          items={items}
          styles={styles}
          fetchModifiers={fetchModifiers}
        />
      );
  }
};

const PreviewContentBlocks = ({
  block,
  items,
  styles,
  fetchModifiers,
}: any) => {
  switch (block.type) {
    case "CategoryHeaderBlock":
      return <PreviewCategoryHeader block={block} />;
    case "PosItemBlock":
      return <PreviewPosItem block={block} items={items} styles={styles} />;
    case "MenuListBlock":
      return <PreviewMenuList block={block} items={items} styles={styles} />;
    case "NestedItemBlock":
      return <PreviewNestedItem block={block} items={items} styles={styles} />;
    case "MediaCarouselBlock":
      return <PreviewMediaCarousel block={block} />;
    case "ModifierGroupBlock":
      return (
        <PreviewModifierGroup block={block} fetchModifiers={fetchModifiers} />
      );
    case "TimelineBlock":
      return <PreviewTimeline block={block} />;
    case "ImageBlock":
      return (
        <div className="bg-background/50 flex h-full min-h-[60px] w-full items-center justify-center overflow-hidden rounded border border-dashed border-black/10">
          {block.imageUrl ? (
            <img src={block.imageUrl} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px]">Static Image</span>
          )}
        </div>
      );
    case "VideoBlock":
      return (
        <div className="bg-background/50 flex h-full min-h-[200px] w-full items-center justify-center rounded border border-dashed">
          <video
            src={block.videoUrl || ""}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
      );
    default:
      return (
        <div className="bg-muted/50 flex min-h-[100px] w-full items-center justify-center rounded border border-dashed">
          <span className="text-muted-foreground text-center text-[10px] font-bold tracking-widest uppercase">
            Unconfigured Content
          </span>
        </div>
      );
  }
};

const PreviewCategoryHeader = ({ block }: any) => {
  const typoStyle = getTypoStyle(block, "heading");
  return (
    <div
      className={`flex w-full flex-col gap-0.5 rounded p-2 ${block.panelStyle === "glass" ? "st-glass-panel" : ""} ${block.className || ""}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <h5
          className="flex-1 text-[10px] tracking-wider uppercase"
          style={{
            ...typoStyle,
            fontSize: typoStyle.fontSize || block.fontSize,
          }}
        >
          {block.title}
        </h5>
        {block.badge && (
          <span
            className={`text-foreground shrink-0 rounded bg-red-600 px-1 text-[6px] font-bold ${block.animateBadge ? "animate-pulse" : ""}`}
          >
            {block.badge}
          </span>
        )}
      </div>
      {block.subtitle && (
        <p
          className="text-[8px] opacity-80"
          style={getTypoStyle(block, "subtitle")}
        >
          {block.subtitle}
        </p>
      )}
    </div>
  );
};

const PreviewPosItem = ({ block, items, styles }: any) => {
  const item = items.find(
    (i: any) => i.id === block.posItemId || i.externalId === block.posItemId,
  );
  if (!item)
    return (
      <div className="text-muted-foreground text-[8px] italic">
        Item not found ({block.posItemId})
      </div>
    );
  const optStyle = resolveItemState(item, false, styles);
  if (optStyle.hidden && item.isSoldOut) return null;
  return (
    <div
      className={`flex items-center justify-between rounded p-1.5 text-[9px] ${block.className || ""}`}
      style={{
        opacity: optStyle.dimOpacity ?? (item.isSoldOut ? 0.5 : 1),
        filter: optStyle.grayscale ? "grayscale(1)" : undefined,
      }}
    >
      <span
        style={buildTitleStyle(optStyle)}
        className="max-w-[70%] truncate font-semibold"
      >
        {item.name}
      </span>
      <span style={buildPriceStyle(optStyle)} className="font-mono">
        ${Number(item.price).toFixed(2)}
      </span>
    </div>
  );
};

const PreviewMenuList = ({ block, items, styles }: any) => {
  if (!block.itemIds?.length)
    return (
      <div className="text-muted-foreground text-[10px]">Select items...</div>
    );
  return (
    <div className={`flex w-full flex-col gap-2 ${block.className || ""}`}>
      {block.itemIds.map((itemId: string) => {
        const item = items.find(
          (i: any) => i.id === itemId || i.externalId === itemId,
        );
        if (!item) return null;
        const optStyle = resolveItemState(item, false, block.styles ?? styles);
        if (optStyle.hidden && item.isSoldOut) return null;
        return (
          <div
            key={item.id}
            className="flex flex-col justify-between p-1.5"
            style={{
              opacity: optStyle.dimOpacity ?? (item.isSoldOut ? 0.5 : 1),
            }}
          >
            <div className="flex items-center justify-between">
              <span style={buildTitleStyle(optStyle)} className="font-semibold">
                {item.name}
              </span>
              <span style={buildPriceStyle(optStyle)} className="font-mono">
                ${Number(item.price).toFixed(2)}
              </span>
            </div>
            {!block.hideDescriptions && item.description && (
              <span className="truncate text-[8px] opacity-70">
                {item.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PreviewNestedItem = ({ block, items }: any) => {
  const baseItem = items.find(
    (i: any) =>
      i.id === block.basePosItemId || i.externalId === block.basePosItemId,
  );
  return (
    <div className="flex flex-col gap-1 rounded p-2 text-[9px]">
      <div className="flex justify-between font-bold">
        <span>{baseItem?.name || "Unknown"}</span>
        <span>${baseItem ? Number(baseItem.price).toFixed(2) : "0.00"}</span>
      </div>
      <ul className="flex flex-col gap-0.5 border-l border-white/10 pl-2 text-[8px] opacity-80">
        {(block.upgradeItems || []).map((up: any, idx: number) => {
          const upItem = items.find(
            (i: any) => i.id === up.posItemId || i.externalId === up.posItemId,
          );
          return <li key={idx}>• {upItem?.name || "Up"}</li>;
        })}
      </ul>
    </div>
  );
};

const PreviewMediaCarousel = ({ block }: any) => {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if ((block.slides?.length || 0) <= 1) return;
    const interval = setInterval(
      () => setIdx((p) => (p + 1) % block.slides.length),
      block.slideDuration || 5000,
    );
    return () => clearInterval(interval);
  }, [block.slides, block.slideDuration]);

  if (!block.slides?.length)
    return (
      <span className="text-muted-foreground relative z-20 italic">
        Media Carousel
      </span>
    );
  return (
    <div className="relative h-full min-h-[200px] w-full overflow-hidden">
      {block.slides.map((s: any, i: number) => (
        <img
          key={i}
          src={s.imageUrl}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === idx ? "z-10 opacity-100" : "z-0 opacity-0"}`}
        />
      ))}
    </div>
  );
};

const PreviewModifierGroup = ({ block, fetchModifiers }: any) => {
  const [opts, setOpts] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (block.modifierGroupId)
      fetchModifiers(block.modifierGroupId).then(setOpts).catch(console.error);
  }, [block.modifierGroupId, fetchModifiers]);

  if (!opts.length)
    return (
      <div className="text-muted-foreground text-[10px]">
        Modifier Group loading...
      </div>
    );
  return (
    <div className="flex w-full flex-col divide-y divide-white/5">
      <div className="px-3 py-2 text-[10px] font-semibold uppercase">
        Options
      </div>
      {opts.map((o) => (
        <div key={o.id} className="flex justify-between px-3 py-2 text-[10px]">
          <span>{o.name}</span>
          <span>${Number(o.price).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

const PreviewTimeline = ({ block }: any) => {
  return (
    <div className="relative flex w-full flex-col p-2">
      {(block.steps || []).map((step: any, i: number) => (
        <div key={i} className="flex items-start gap-4 py-2">
          <div className="h-4 w-4 shrink-0 rounded-full border-2 border-cyan-400 bg-cyan-900"></div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">{step.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const SlideFilmstrip = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onReorderSlides,
}: any) => {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderSlides) return;
    const list = Array.from(slides) as SignageSlide[];
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    onReorderSlides(list);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="filmstrip-slides" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-row gap-3 overflow-x-auto p-3"
          >
            {slides.map((slide: any, index: number) => (
              <Draggable
                key={slide.id || index}
                draggableId={slide.id || `slide-${index}`}
                index={index}
              >
                {(drag) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    className="flex items-center gap-1"
                  >
                    <div
                      {...drag.dragHandleProps}
                      className="text-foreground/30"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div
                      onClick={() => onSelectSlide?.(index)}
                      className={`h-20 w-32 cursor-pointer rounded border ${index === activeSlideIndex ? "border-cyan-500" : "border-white/20"}`}
                    >
                      Slide {index + 1}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <button
              onClick={onAddSlide}
              className="flex h-20 w-32 items-center justify-center border-2 border-dashed text-xs"
            >
              <Plus className="h-4 w-4" /> Add Slide
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
