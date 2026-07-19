/* eslint-disable max-lines */
import React from "react";
import { type SignageLayoutConfig, type PosItem, type SignageSlide, type SignageBlock } from "@soustools/api-types";
import { buildAllAnimationCss, buildTitleStyle, buildPriceStyle, resolveItemState, getTypoStyle } from "../../menu-item-style-utils";
import { DEFAULT_MENU_ITEM_STYLES } from "../../config-migration";
import { BlockEditorNode } from "../../block-editor-node";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
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

export const SignagePreviewView: React.FC<SignagePreviewViewProps> = (props) => {
  const { config, activeSlideIndex, isPreviewing, containerRef, scale } = props;
  const activeSlide = config.slides[activeSlideIndex] ?? config.slides[0];
  const columnSlide = activeSlide?.type === "COLUMN_LAYOUT" ? activeSlide : null;

  const fontFamilies = new Set<string>();
  if (config.googleFont) fontFamilies.add(config.googleFont);
  if (config.designTokens?.headingFont) fontFamilies.add(config.designTokens.headingFont);
  if (config.designTokens?.subtitleFont) fontFamilies.add(config.designTokens.subtitleFont);
  if (config.designTokens?.bodyFont) fontFamilies.add(config.designTokens.bodyFont);

  config.slides.forEach(slide => {
    if (slide.type === "COLUMN_LAYOUT") {
      slide.columns?.forEach(col => {
        col.blocks?.forEach(block => {
          if (block.visuals?.typography?.fontFamily) fontFamilies.add(block.visuals.typography.fontFamily);
          if (block.visuals?.subtitleTypography?.fontFamily) fontFamilies.add(block.visuals.subtitleTypography.fontFamily);
        });
      });
    }
  });

  const uniqueFonts = Array.from(fontFamilies).filter(f => f && f !== "inherit" && f !== "Global Default");

  const bgStyle: React.CSSProperties = {
    fontFamily: config.googleFont ? `'${config.googleFont}', sans-serif` : "inherit",
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

  const googleFontsUrl = uniqueFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700`).join("&")}&display=swap`
    : "";

  let customCss = "";
  if (googleFontsUrl) customCss += `@import url('${googleFontsUrl}');\n`;
  customCss += cssVars;
  if (config.designTokens?.globalCss) customCss += `\n@scope (.st-signage-root) {\n${config.designTokens.globalCss}\n}\n`;
  if (config.customCss) customCss += `\n@scope (.st-signage-root) {\n${config.customCss}\n}\n`;
  
  const animationCss = config.menuItemStyles ? buildAllAnimationCss(config.menuItemStyles) : "";

  return (
    <div className="w-full min-h-full relative flex flex-col items-center justify-start signage-preview-container bg-white dark:bg-black pt-8 pb-32 st-signage-root" ref={containerRef}>
      {(customCss || animationCss) && <style dangerouslySetInnerHTML={{ __html: `${animationCss}\n${customCss}` }} />}
      
      {isPreviewing && config.aspectRatio !== "responsive" && config.scaleToFit !== false ? (
        <div className="w-[1920px] h-[1080px] shrink-0 origin-top transform-gpu shadow-2xl" style={{ transform: `scale(${scale})` }}>
          <PreviewContent {...props} bgStyle={bgStyle} activeSlide={activeSlide} />
        </div>
      ) : (
        <div className="w-full min-h-[500px] flex-1 flex flex-col">
          <PreviewContent {...props} bgStyle={bgStyle} activeSlide={activeSlide} />
        </div>
      )}
      
      {!isPreviewing && config.slides.length > 0 && (
         <div className="w-full mt-8 max-w-full">
           <SlideFilmstrip {...props} slides={config.slides} />
         </div>
      )}
    </div>
  );
};

const PreviewContent = (props: any) => {
  const { config, activeSlide, bgStyle, items, isPreviewing, selectedBlockId, onSelectBlock, onAddBlock, onUpdateBlock, fetchModifiers } = props;
  return (
    <div className={`w-full flex-1 h-full relative st-layout-background flex flex-col ${config.aspectRatio === "responsive" ? "" : "border-2 border-black/10 dark:border-white/10 shadow-2xl rounded-2xl"}`} style={bgStyle}>
      {!activeSlide ? (
        <div className="flex items-center justify-center h-full text-zinc-500 text-sm font-mono">Click + Add Slide to begin</div>
      ) : (
        <SlideRenderer slide={activeSlide} items={items} config={config} isPreviewing={isPreviewing} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} onAddBlock={onAddBlock} onUpdateBlock={onUpdateBlock} fetchModifiers={fetchModifiers} />
      )}
      {(config.overlays ?? []).map((o: any) => (
        <div key={o.id} className={`absolute text-[9px] bg-zinc-950/80 border border-zinc-800 px-1.5 py-0.5 rounded shadow signage-overlay ${o.customCssClass ?? ""}`} style={{ top: o.position.top, bottom: o.position.bottom, left: o.position.left, right: o.position.right, zIndex: o.zIndex ?? 10 }}>
          {o.type === "BADGE" && <span className="bg-red-500 text-white font-bold px-0.5 rounded mr-0.5 text-[8px]">SOLD OUT</span>}
          {o.content}
        </div>
      ))}
    </div>
  );
};

const SlideRenderer = (props: any) => {
  const { slide, items, config, isPreviewing, selectedBlockId, onSelectBlock, onAddBlock, onUpdateBlock, fetchModifiers } = props;
  if (slide.type === "IMAGE") return <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-card">{slide.imageUrl ? <img src={slide.imageUrl} alt="Slide" className="w-full h-full object-cover" /> : <p className="text-xs text-blue-400 italic">Image: (no URL set)</p>}</div>;
  if (slide.type === "VIDEO") return <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-card">{slide.videoUrl ? <video src={slide.videoUrl} autoPlay loop={slide.loop} muted={slide.mute} className="w-full h-full object-cover" /> : <p className="text-xs text-purple-400 italic">Video: (no URL set)</p>}</div>;
  if (slide.type === "IFRAME") return <div className="w-full h-full">{slide.url ? <iframe src={slide.url} className="w-full h-full border-none" title="Iframe slide" /> : <div className="flex items-center justify-center h-full"><p className="text-xs text-yellow-400 italic">Iframe: (no URL set)</p></div>}</div>;

  if (slide.type === "COLUMN_LAYOUT") {
    const blocks = slide.columns?.[0]?.blocks || [];
    const styles = config.menuItemStyles || DEFAULT_MENU_ITEM_STYLES;
    if (isPreviewing) {
      return (
        <div className="relative w-full h-full flex flex-col bg-white dark:bg-black">
          {blocks.map((block: any) => (
            <PreviewBlockRenderer key={block.id} block={block} items={items} styles={styles} isRoot fetchModifiers={fetchModifiers} />
          ))}
        </div>
      );
    }
    return (
      <div className="relative w-full h-full flex flex-col p-4" onClick={(e) => { e.stopPropagation(); onSelectBlock?.(null); }}>
        {blocks.length > 0 ? (
          blocks.map((block: any, idx: number) => (
            <BlockEditorNode key={block.id || `block-fallback-${idx}`} block={block} items={items} menuItemStyles={styles} onUpdate={onUpdateBlock!} onAddBlock={onAddBlock!} onSelectBlock={onSelectBlock!} selectedBlockId={selectedBlockId || undefined} isRoot />
          ))
        ) : (
          <div className="flex-1 border border-dashed border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm cursor-pointer hover:border-cyan-400 hover:text-cyan-400 transition-colors">Empty Canvas</div>
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
      const classes = ["flex flex-col gap-2 w-full st-layout-column", block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "", isRoot ? "flex-1 h-full" : "", block.className].filter(Boolean).join(" ");
      return <div className={classes} data-unique-id={block.uniqueSelector}>{(block.blocks || []).map((sub: any, idx: number) => <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} fetchModifiers={fetchModifiers} />)}</div>;
    }
    case "RowBlock": {
      const classes = ["flex flex-row gap-2 w-full overflow-x-auto st-layout-row", block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "", isRoot ? "flex-1 h-full" : "", block.className].filter(Boolean).join(" ");
      return <div className={classes} data-unique-id={block.uniqueSelector}>{(block.blocks || []).map((sub: any, idx: number) => <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} fetchModifiers={fetchModifiers} />)}</div>;
    }
    case "GridBlock": {
      const colClass = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[block.columns as number] || "grid-cols-2";
      const classes = ["grid gap-2 w-full st-layout-grid", colClass, block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "", isRoot ? "flex-1 h-full" : "", block.className].filter(Boolean).join(" ");
      return <div className={classes} data-unique-id={block.uniqueSelector}>{(block.cells || []).map((sub: any, idx: number) => <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} fetchModifiers={fetchModifiers} />)}</div>;
    }
    case "ExplodedItemBlock": {
      const classes = ["flex flex-col gap-2 w-full st-exploded-item", block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "", isRoot ? "flex-1 h-full" : "", block.className].filter(Boolean).join(" ");
      return <div className={classes} data-unique-id={block.uniqueSelector}>{(block.blocks || []).map((sub: any, idx: number) => <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} fetchModifiers={fetchModifiers} />)}</div>;
    }
    default:
      return <PreviewContentBlocks block={block} items={items} styles={styles} fetchModifiers={fetchModifiers} />;
  }
};

const PreviewContentBlocks = ({ block, items, styles, fetchModifiers }: any) => {
  switch (block.type) {
    case "CategoryHeaderBlock": return <PreviewCategoryHeader block={block} />;
    case "PosItemBlock": return <PreviewPosItem block={block} items={items} styles={styles} />;
    case "MenuListBlock": return <PreviewMenuList block={block} items={items} styles={styles} />;
    case "NestedItemBlock": return <PreviewNestedItem block={block} items={items} styles={styles} />;
    case "MediaCarouselBlock": return <PreviewMediaCarousel block={block} />;
    case "ModifierGroupBlock": return <PreviewModifierGroup block={block} fetchModifiers={fetchModifiers} />;
    case "TimelineBlock": return <PreviewTimeline block={block} />;
    case "ImageBlock": return <div className="w-full h-full min-h-[60px] flex items-center justify-center bg-zinc-950/50 border border-dashed border-black/10 rounded overflow-hidden">{block.imageUrl ? <img src={block.imageUrl} className="w-full h-full object-cover"/> : <span className="text-[10px]">Static Image</span>}</div>;
    case "VideoBlock": return <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-zinc-950/50 border border-dashed rounded"><video src={block.videoUrl || ""} autoPlay loop muted playsInline className="w-full h-full object-cover" /></div>;
    default: return <div className="w-full min-h-[100px] flex items-center justify-center bg-black/5 dark:bg-white/5 border border-dashed rounded"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Unconfigured Content</span></div>;
  }
};

const PreviewCategoryHeader = ({ block }: any) => {
  const typoStyle = getTypoStyle(block, "heading");
  return (
    <div className={`w-full p-2 rounded flex flex-col gap-0.5 ${block.panelStyle === "glass" ? "st-glass-panel" : ""} ${block.className || ""}`}>
      <div className="flex justify-between items-center w-full gap-2">
        <h5 className="text-[10px] uppercase tracking-wider flex-1" style={{...typoStyle, fontSize: typoStyle.fontSize || block.fontSize}}>{block.title}</h5>
        {block.badge && <span className={`text-[6px] px-1 bg-red-600 rounded text-white font-bold shrink-0 ${block.animateBadge ? "animate-pulse" : ""}`}>{block.badge}</span>}
      </div>
      {block.subtitle && <p className="text-[8px] opacity-80" style={getTypoStyle(block, "subtitle")}>{block.subtitle}</p>}
    </div>
  );
};

const PreviewPosItem = ({ block, items, styles }: any) => {
  const item = items.find((i: any) => i.id === block.posItemId || i.externalId === block.posItemId);
  if (!item) return <div className="text-[8px] text-zinc-500 italic">Item not found ({block.posItemId})</div>;
  const optStyle = resolveItemState(item, false, styles);
  if (optStyle.hidden && item.isSoldOut) return null;
  return (
    <div className={`p-1.5 rounded flex justify-between items-center text-[9px] ${block.className || ""}`} style={{opacity: optStyle.dimOpacity ?? (item.isSoldOut ? 0.5 : 1), filter: optStyle.grayscale ? "grayscale(1)" : undefined}}>
      <span style={buildTitleStyle(optStyle)} className="font-semibold truncate max-w-[70%]">{item.name}</span>
      <span style={buildPriceStyle(optStyle)} className="font-mono">${Number(item.price).toFixed(2)}</span>
    </div>
  );
};

const PreviewMenuList = ({ block, items, styles }: any) => {
  if (!block.itemIds?.length) return <div className="text-[10px] text-zinc-400">Select items...</div>;
  return (
    <div className={`flex flex-col gap-2 w-full ${block.className || ""}`}>
      {block.itemIds.map((itemId: string) => {
        const item = items.find((i: any) => i.id === itemId || i.externalId === itemId);
        if (!item) return null;
        const optStyle = resolveItemState(item, false, block.styles ?? styles);
        if (optStyle.hidden && item.isSoldOut) return null;
        return (
          <div key={item.id} className="p-1.5 flex flex-col justify-between" style={{opacity: optStyle.dimOpacity ?? (item.isSoldOut ? 0.5 : 1)}}>
            <div className="flex justify-between items-center">
              <span style={buildTitleStyle(optStyle)} className="font-semibold">{item.name}</span>
              <span style={buildPriceStyle(optStyle)} className="font-mono">${Number(item.price).toFixed(2)}</span>
            </div>
            {!block.hideDescriptions && item.description && <span className="text-[8px] opacity-70 truncate">{item.description}</span>}
          </div>
        );
      })}
    </div>
  );
};

const PreviewNestedItem = ({ block, items }: any) => {
  const baseItem = items.find((i: any) => i.id === block.basePosItemId || i.externalId === block.basePosItemId);
  return (
    <div className="p-2 rounded flex flex-col gap-1 text-[9px]">
      <div className="flex justify-between font-bold">
        <span>{baseItem?.name || "Unknown"}</span>
        <span>${baseItem ? Number(baseItem.price).toFixed(2) : "0.00"}</span>
      </div>
      <ul className="flex flex-col gap-0.5 text-[8px] opacity-80 pl-2 border-l border-white/10">
        {(block.upgradeItems || []).map((up: any, idx: number) => {
          const upItem = items.find((i: any) => i.id === up.posItemId || i.externalId === up.posItemId);
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
    const interval = setInterval(() => setIdx(p => (p + 1) % block.slides.length), block.slideDuration || 5000);
    return () => clearInterval(interval);
  }, [block.slides, block.slideDuration]);
  
  if (!block.slides?.length) return <span className="text-zinc-500 italic relative z-20">Media Carousel</span>;
  return (
    <div className="relative overflow-hidden w-full h-full min-h-[200px]">
      {block.slides.map((s: any, i: number) => (
        <img key={i} src={s.imageUrl} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`} />
      ))}
    </div>
  );
};

const PreviewModifierGroup = ({ block, fetchModifiers }: any) => {
  const [opts, setOpts] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (block.modifierGroupId) fetchModifiers(block.modifierGroupId).then(setOpts).catch(console.error);
  }, [block.modifierGroupId, fetchModifiers]);
  
  if (!opts.length) return <div className="text-[10px] text-zinc-500">Modifier Group loading...</div>;
  return (
    <div className="w-full flex flex-col divide-y divide-white/5">
      <div className="px-3 py-2 font-semibold text-[10px] uppercase">Options</div>
      {opts.map(o => <div key={o.id} className="flex justify-between px-3 py-2 text-[10px]"><span>{o.name}</span><span>${Number(o.price).toFixed(2)}</span></div>)}
    </div>
  );
};

const PreviewTimeline = ({ block }: any) => {
  return (
    <div className="w-full flex flex-col p-2 relative">
      {(block.steps || []).map((step: any, i: number) => (
        <div key={i} className="flex gap-4 items-start py-2">
          <div className="w-4 h-4 rounded-full bg-cyan-900 border-2 border-cyan-400 shrink-0"></div>
          <div className="flex flex-col gap-0.5"><span className="font-bold">{step.text}</span></div>
        </div>
      ))}
    </div>
  );
};

const SlideFilmstrip = ({ slides, activeSlideIndex, onSelectSlide, onAddSlide, onReorderSlides }: any) => {
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
          <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-row gap-3 overflow-x-auto p-3">
            {slides.map((slide: any, index: number) => (
              <Draggable key={slide.id || index} draggableId={slide.id || `slide-${index}`} index={index}>
                {(drag) => (
                  <div ref={drag.innerRef} {...drag.draggableProps} className="flex items-center gap-1">
                    <div {...drag.dragHandleProps} className="text-white/30"><GripVertical className="w-4 h-4" /></div>
                    <div onClick={() => onSelectSlide?.(index)} className={`w-32 h-20 border rounded cursor-pointer ${index === activeSlideIndex ? "border-cyan-500" : "border-white/20"}`}>
                       Slide {index + 1}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <button onClick={onAddSlide} className="w-32 h-20 border-2 border-dashed flex items-center justify-center text-xs"><Plus className="w-4 h-4" /> Add Slide</button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
