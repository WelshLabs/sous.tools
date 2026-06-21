"use client";

import React from "react";
import { SignageBlock, PosItem, MenuItemStyles } from "@soustools/api-types";
import {
  buildTitleStyle,
  buildPriceStyle,
  resolveItemState,
} from "./menu-item-style-utils";
import { PreviewNestedItem } from "./preview-nested-exploded";
import * as LucideIcons from "lucide-react";
import { supabase } from "../../lib/supabase";

const PreviewMediaCarousel = ({ block }: { block: any }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const slides = block.slides || [];
  const duration = block.slideDuration || 5000;
  
  React.useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, duration);
    return () => clearInterval(interval);
  }, [slides.length, duration]);


  const objectFitClass = block.objectFit === "contain" ? "object-contain" : (block.objectFit === "fill" ? "object-fill" : "object-cover");
  const classes = [
    "relative overflow-hidden w-full h-full min-h-[200px] bg-zinc-950 rounded border border-white/5 flex items-center justify-center text-[9px] st-media-carousel",
    block.className
  ].filter(Boolean).join(" ");
  return (
    <div className={classes} data-unique-id={block.uniqueSelector}>
      {slides.length > 0 ? (
        slides.map((slide: any, i: number) => {
          if (!slide.imageUrl) return null;
          const isActive = i === activeIndex;
          return (
            <img 
              key={i} 
              src={slide.imageUrl} 
              alt={`slide-${i}`} 
              className={`absolute inset-0 w-full h-full ${objectFitClass} transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`} 
            />
          );
        })
      ) : (
        <span className="text-slate-500 italic relative z-20">Media Carousel Preview</span>
      )}
    </div>
  );
};

const PreviewModifierGroup = ({ block }: { block: any }) => {
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchOptions() {
      if (!block.modifierGroupId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("pos_modifier_options")
        .select("*")
        .eq("modifier_group_id", block.modifierGroupId)
        .order("price", { ascending: true });
        
      if (!error && data) {
        setOptions(data);
      }
      setLoading(false);
    }
    fetchOptions();
  }, [block.modifierGroupId]);

  if (loading) {
    return (
      <div className="w-full min-h-[60px] flex items-center justify-center p-4 bg-zinc-950 border border-dashed border-white/5 rounded text-slate-500 italic text-[10px] animate-pulse">
        Loading Options...
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="p-3 bg-zinc-950 border border-dashed border-white/5 rounded text-[10px] text-slate-500 italic flex items-center justify-center">
        Modifier Group: {block.modifierGroupId || "Dynamic"} (No options found)
      </div>
    );
  }

  const classes = [
    "w-full bg-black/40 rounded border border-white/5 overflow-hidden",
    block.className
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} data-unique-id={block.uniqueSelector}>
      <div className="px-3 py-2 bg-white/5 border-b border-white/5 font-semibold text-[10px] text-slate-300 uppercase tracking-wider">
        Options
      </div>
      <div className="flex flex-col divide-y divide-white/5">
        {options.map(opt => (
          <div key={opt.id} className="flex justify-between items-center px-3 py-2 text-[10px]">
            <span className="text-slate-200">{opt.name}</span>
            <span className="text-slate-400 font-mono">
              {opt.price > 0 ? `+$${Number(opt.price).toFixed(2)}` : "Free"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PreviewContentBlocksProps {
  block: SignageBlock;
  items: PosItem[];
  styles: MenuItemStyles;
  config?: any;
}

export function PreviewContentBlocks({
  block,
  items,
  styles,
  config,
}: PreviewContentBlocksProps): React.JSX.Element {
  switch (block.type) {
    case "CategoryHeaderBlock": {
      const isGlass = block.panelStyle === "glass";
      const classes = [
        "p-2 rounded flex flex-col gap-0.5 st-category-header",
        isGlass ? "st-glass-panel" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          <div className="flex justify-between items-center">
            <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: block.color || config?.designTokens?.primaryColor, fontSize: block.fontSize }}>
              {block.title}
            </h5>
            {block.badge && (
              <span className={`text-[6px] px-1 bg-red-600 rounded text-white font-bold ${block.animateBadge ? "animate-pulse" : ""}`}>{block.badge}</span>
            )}
          </div>
          {block.subtitle && <p className="text-[8px] opacity-80">{block.subtitle}</p>}
        </div>
      );
    }

    case "PosItemBlock": {
      const item = items.find((i) => i.id === block.posItemId || i.externalId === block.posItemId);
      if (!item) {
        return <div className="text-[8px] text-slate-500 italic">Item not found ({block.posItemId})</div>;
      }
      const optStyle = resolveItemState(item, false, styles);
      if (optStyle.hidden && item.isSoldOut) return <></>;

      const isGlass = block.panelStyle === "glass";
      const isFlat = block.panelStyle === "none" || (
        (!styles.regular.backgroundColor || styles.regular.backgroundColor === "transparent" || styles.regular.backgroundColor.includes("0,0,0,0")) &&
        (!styles.regular.borderWidth || !styles.regular.borderColor || styles.regular.borderColor === "transparent")
      );

      const classes = [
        "p-1.5 rounded flex justify-between items-center text-[9px] st-menu-item",
        isGlass ? "st-glass-panel" : (isFlat ? "bg-transparent border-transparent" : "border border-white/5 bg-white/5"),
        item.isSoldOut ? "st-sold-out" : "",
        block.className
      ].filter(Boolean).join(" ");

      return (
        <div
          className={classes}
          data-unique-id={block.uniqueSelector}
          style={{
            opacity: optStyle.dimOpacity !== undefined ? optStyle.dimOpacity : (item.isSoldOut ? 0.5 : 1),
            filter: optStyle.grayscale ? "grayscale(1)" : undefined,
          }}
        >
          <span style={buildTitleStyle(optStyle)} className="font-semibold truncate max-w-[70%] st-menu-item-title">
            {item.name}
          </span>
          <span style={buildPriceStyle(optStyle)} className="font-mono st-price-tag">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      );
    }

    case "CalloutBlock": {
      const b = block as any;
      const isGlass = block.panelStyle === "glass";
      const classes = [
        "p-5 rounded-xl flex flex-col items-center text-center gap-3 st-callout w-full",
        isGlass ? "st-glass-panel border border-white/10" : (block.panelStyle !== "none" ? "bg-zinc-900 border border-zinc-800" : ""),
        block.accentBorder ? "border-t-4 border-t-cyan-400" : "",
        block.className
      ].filter(Boolean).join(" ");
      
      const IconComponent = b.iconName ? ((LucideIcons as any)[b.iconName] || LucideIcons.Info) : LucideIcons.Info;
      const bgStyle = b.backgroundOpacity !== undefined && !isGlass && block.panelStyle !== "none" ? { backgroundColor: `rgba(24, 24, 27, ${b.backgroundOpacity})` } : {};
      return (
        <div className={classes} data-unique-id={block.uniqueSelector} style={bgStyle}>
          <div className="shrink-0">
             <IconComponent className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex flex-col gap-1 items-center justify-center w-full" style={{ color: b.textColor }}>
            {b.title && <span className="font-bold tracking-wide text-lg" style={{ fontSize: b.fontSize }}>{b.title}</span>}
            {b.message && <span className="leading-snug" style={{ fontSize: b.fontSize ? `calc(${b.fontSize} * 0.75)` : undefined }}>{b.message}</span>}
          </div>
        </div>
      );
    }

    case "MenuListBlock": {
      if (!block.itemIds || block.itemIds.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center w-full min-h-[60px] p-4 border border-dashed border-white/10 rounded-xl bg-white/5 opacity-80" data-unique-id={block.uniqueSelector}>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
               Select POS items from Block Settings to populate this space.
             </span>
          </div>
        );
      }

      const isGlass = block.panelStyle === "glass";

      const containerClasses = [
        "flex flex-col gap-2 w-full st-menu-list",
        isGlass ? "st-glass-panel p-2 border border-white/10 bg-white/5 rounded" : "",
        block.className
      ].filter(Boolean).join(" ");

      return (
        <div className={containerClasses} data-unique-id={block.uniqueSelector}>
          {block.itemIds.map((itemId) => {
             const item = items.find(i => i.id === itemId || i.externalId === itemId);
             if (!item) return null;
             
             const blockStyles = block.styles ?? styles;
             const optStyle = resolveItemState(item, false, blockStyles);
             if (optStyle.hidden && item.isSoldOut) return null;

             const isFlatItem = block.panelStyle === "none" || (
               (!blockStyles.regular.backgroundColor || blockStyles.regular.backgroundColor === "transparent" || blockStyles.regular.backgroundColor.includes("0,0,0,0")) &&
               (!blockStyles.regular.borderWidth || !blockStyles.regular.borderColor || blockStyles.regular.borderColor === "transparent")
             );

             const itemClasses = [
               "p-1.5 rounded flex justify-between items-center text-[9px] st-menu-item",
               isGlass ? "bg-transparent border-transparent" : (isFlatItem ? "bg-transparent border-transparent" : "border border-white/5 bg-white/5"),
               item.isSoldOut ? "st-sold-out" : ""
             ].filter(Boolean).join(" ");

             return (
               <div key={item.id} className={itemClasses} style={{
                 opacity: optStyle.dimOpacity !== undefined ? optStyle.dimOpacity : (item.isSoldOut ? 0.5 : 1),
                 filter: optStyle.grayscale ? "grayscale(1)" : undefined,
               }}>
                 <div className="flex flex-col truncate w-full">
                   <div className="flex justify-between items-center w-full">
                     <span style={buildTitleStyle(optStyle)} className="font-semibold truncate st-menu-item-title">
                       {item.name}
                     </span>
                     {!(block as any).priceDisplay && (
                       <span style={buildPriceStyle(optStyle)} className="font-mono st-price-tag shrink-0 pl-2">
                         ${Number(item.price).toFixed(2)}
                       </span>
                     )}
                   </div>
                   {!block.hideDescriptions && item.description && (
                     <span className="text-[8px] opacity-70 truncate">{item.description}</span>
                   )}
                   {(block as any).priceDisplay && (
                     <div className="flex gap-8 border-t border-white/10 pt-3 mt-2">
                       {Object.entries((block as any).priceDisplay).map(([key, value]) => (
                         <div key={key} className="flex gap-2 items-center">
                           <span className="text-slate-400 capitalize text-[8px]">{key}</span>
                           <span className="font-mono st-price-tag text-[9px]">{value as string}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      );
    }

    case "NestedItemBlock":
      return <PreviewNestedItem block={block} items={items} styles={styles} />;

    case "MediaCarouselBlock": {
      return <PreviewMediaCarousel block={block} />;
    }

    case "ModifierGroupBlock":
      return <PreviewModifierGroup block={block} />;

    case "ImageBlock": {
      const b = block as any;
      const objectFitClass = b.objectFit === "contain" ? "object-contain" : (b.objectFit === "fill" ? "object-fill" : "object-cover");
      const classes = [
        "w-full h-full min-h-[60px] flex items-center justify-center bg-zinc-950/50 border border-dashed border-white/10 rounded overflow-hidden",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {b.imageUrl ? (
            <img src={b.imageUrl} alt="preview" className={`w-full h-full ${objectFitClass}`} />
          ) : (
            <span className="text-[10px] text-slate-500 italic">Static Image</span>
          )}
        </div>
      );
    }

    case "VideoBlock": {
      const b = block as any;
      const videoSrc = b.videoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      const classes = [
        "w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-zinc-950/50 border border-dashed border-white/10 rounded overflow-hidden p-0 relative st-video-container aspect-video",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
           <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover st-video-player" />
           {!b.videoUrl && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10">
               <span className="text-[10px] text-slate-300 italic px-3 py-1 bg-black/60 rounded">Placeholder Video</span>
             </div>
           )}
        </div>
      );
    }

    case "TimelineBlock": {
      const b = block as any;
      const steps = b.steps || [];
      const classes = [
        "w-full flex flex-col p-2 relative st-timeline",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/20 z-0"></div>
          {steps.length === 0 ? (
            <span className="text-[10px] text-slate-500 italic relative z-10 bg-zinc-950 pl-2">No timeline steps configured.</span>
          ) : (
            steps.map((step: any) => (
              <div key={step.id} className="flex gap-4 items-start relative z-10 py-2">
                <div className="w-4 h-4 rounded-full bg-cyan-900 border-2 border-cyan-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-200">{step.text}</span>
                  {step.subtitle && <span className="text-slate-400 text-[8px]">{step.subtitle}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    default:
      return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[60px] opacity-40">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
             Unconfigured Content
           </span>
        </div>
      );
  }
}
