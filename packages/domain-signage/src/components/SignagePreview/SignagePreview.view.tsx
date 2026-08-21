/* eslint-disable max-lines */
"use client";

import React from "react";
import {
  type SignageLayoutConfig,
  type PosItem,
  type SignageSlide,
  type SignageBlock,
} from "@soustools/api-types";
import { buildAllAnimationCss } from "../../menu-item-style-utils";
import { DEFAULT_MENU_ITEM_STYLES } from "../../config-migration";
import { BlockEditorNode } from "../../block-editor-node";
import { PreviewBlockRenderer } from "../../preview-block-renderer";
import { AuroraBackground } from "@soustools/design-system";
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

  const hasAurora =
    columnSlide?.auroraBackground ||
    columnSlide?.backgroundEffect === "aurora" ||
    config.auroraBackground ||
    config.backgroundEffect === "aurora";

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
      --global-accent: ${config.designTokens?.accentColor || "#22d3ee"};
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
      className="signage-preview-container bg-background dark:bg-background st-signage-root relative flex min-h-full w-full flex-col items-center justify-start pt-6 pb-28"
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
          className="h-[1080px] w-[1920px] shrink-0 origin-top transform-gpu overflow-hidden rounded-2xl shadow-2xl"
          style={{ transform: `scale(${scale})` }}
        >
          <PreviewContent
            {...props}
            bgStyle={bgStyle}
            activeSlide={activeSlide}
            hasAurora={hasAurora}
          />
        </div>
      ) : (
        <div className="flex min-h-[520px] w-full flex-1 flex-col">
          <PreviewContent
            {...props}
            bgStyle={bgStyle}
            activeSlide={activeSlide}
            hasAurora={hasAurora}
          />
        </div>
      )}

      {!isPreviewing && config.slides.length > 0 && (
        <div className="mt-6 w-full max-w-full">
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
    hasAurora,
  } = props;

  return (
    <div
      className={`st-layout-background relative flex h-full w-full flex-1 flex-col overflow-hidden ${
        config.aspectRatio === "responsive"
          ? ""
          : "border-border rounded-2xl border-2 shadow-2xl"
      }`}
      style={bgStyle}
    >
      {hasAurora && <AuroraBackground className="pointer-events-none z-0" />}

      <div className="relative z-10 flex h-full w-full flex-1 flex-col">
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
      </div>

      {(config.overlays ?? []).map((o: any) => (
        <div
          key={o.id}
          className={`bg-background/80 border-border signage-overlay absolute rounded border px-2 py-1 text-[10px] font-semibold shadow-lg ${o.customCssClass ?? ""}`}
          style={{
            top: o.position.top,
            bottom: o.position.bottom,
            left: o.position.left,
            right: o.position.right,
            zIndex: o.zIndex ?? 20,
          }}
        >
          {o.type === "BADGE" && (
            <span className="text-foreground mr-1 rounded bg-red-500 px-1 text-[8px] font-bold">
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
          <p className="text-xs text-cyan-400 italic">Image: (no URL set)</p>
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
    const columns = slide.columns || [];
    const styles = config.menuItemStyles || DEFAULT_MENU_ITEM_STYLES;

    if (isPreviewing) {
      return (
        <div className="relative flex h-full w-full flex-1 flex-row gap-4 overflow-y-auto p-4">
          {columns.length > 0 ? (
            columns.map((col: any, cIdx: number) => (
              <div
                key={col.id || cIdx}
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-3"
              >
                {(col.blocks || []).map((block: any) => (
                  <PreviewBlockRenderer
                    key={block.id}
                    block={block}
                    items={items}
                    styles={styles}
                    isRoot
                    onFetchModifierOptions={fetchModifiers}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-xs italic">
              No columns configured
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative flex h-full w-full flex-1 flex-row gap-4 p-4"
        onClick={(e) => {
          e.stopPropagation();
          onSelectBlock?.(null);
        }}
      >
        {columns.length > 0 ? (
          columns.map((col: any, cIdx: number) => {
            const blocks = col.blocks || [];
            return (
              <div
                key={col.id || cIdx}
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-3"
              >
                {blocks.length > 0 ? (
                  blocks.map((block: any, idx: number) => (
                    <BlockEditorNode
                      key={block.id || `block-fallback-${cIdx}-${idx}`}
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
                  <div className="border-border text-muted-foreground flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed p-8 text-xs transition-colors hover:border-cyan-400 hover:text-cyan-400">
                    Empty Column
                  </div>
                )}
              </div>
            );
          })
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
                      className="text-foreground/30 hover:text-foreground cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div
                      onClick={() => onSelectSlide?.(index)}
                      className={`flex h-18 w-28 cursor-pointer flex-col justify-between rounded-xl border p-2 text-xs font-semibold transition-all ${
                        index === activeSlideIndex
                          ? "border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                          : "border-border bg-card/60 text-muted-foreground hover:border-zinc-500"
                      }`}
                    >
                      <span>Slide {index + 1}</span>
                      <span className="font-mono text-[9px] uppercase opacity-70">
                        {slide.type}
                      </span>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <button
              type="button"
              onClick={onAddSlide}
              className="border-border text-muted-foreground flex h-18 w-28 items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-semibold transition-colors hover:border-cyan-400 hover:text-cyan-400"
            >
              <Plus className="h-4 w-4" /> Add Slide
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
