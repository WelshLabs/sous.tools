"use client";

import React from "react";
import { type SignageBlock, type PosItem, type MenuItemStyles, type BlockSizing } from "@soustools/api-types";
import { CategoryHeaderBlock } from "./blocks/category-header-block";
import { PosItemBlock } from "./blocks/pos-item-block";
import { CalloutBlock } from "./blocks/callout-block";
import { NestedItemBlock } from "./blocks/nested-item-block";
import { MediaCarouselBlock } from "./blocks/media-carousel-block";
import { ExplodedItemBlock } from "./blocks/exploded-item-block";
import { ModifierGroupBlock } from "./blocks/modifier-group-block";
import { MenuListBlock } from "./blocks/menu-list-block";

interface BlockRendererProps {
  block: SignageBlock;
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
  config?: any;
}

export function getSizingStyles(sizing?: BlockSizing): React.CSSProperties {
  if (!sizing) return {};
  const { width, height, flexBasis, flexGrow, flexShrink, gap, padding, margin } = sizing;
  return {
    ...(width && { width }),
    ...(height && { height }),
    ...(flexBasis && { flexBasis }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(gap && { gap }),
    ...(padding && { padding }),
    ...(margin && { margin }),
  };
}

export function getLayoutClass(direction: "column" | "row" | "grid", panelStyle?: string, className?: string) {
  return [
    direction === "grid"
      ? "grid gap-4 w-full h-full st-layout-grid"
      : `flex flex-${direction === "column" ? "col" : "row"} gap-4 w-full h-full st-layout-${direction}`,
    panelStyle === "glass" ? " p-4 rounded-2xl" : "",
    className
  ].filter(Boolean).join(" ");
}

export function BlockRenderer({ block, items, menuItemStyles, config }: BlockRendererProps): React.JSX.Element {
  const sizingStyles = getSizingStyles(block.sizing);

  switch (block.type) {
    case "ColumnBlock":
      return (
        <div className={getLayoutClass("column", block.panelStyle, block.className)} style={sizingStyles}>
          {block.blocks.map((subBlock) => (
            <BlockRenderer key={subBlock.id || Math.random().toString()} block={subBlock} items={items} menuItemStyles={menuItemStyles} config={config} />
          ))}
        </div>
      );
    case "RowBlock":
      return (
        <div className={getLayoutClass("row", block.panelStyle, block.className)} style={sizingStyles}>
          {block.blocks.map((subBlock) => (
            <BlockRenderer key={subBlock.id || Math.random().toString()} block={subBlock} items={items} menuItemStyles={menuItemStyles} config={config} />
          ))}
        </div>
      );
    case "GridBlock": {
      const colTemplate = `repeat(${block.columns}, minmax(0, 1fr))`;
      const rowTemplate = `repeat(${block.rows}, minmax(0, 1fr))`;
      return (
        <div
          className={getLayoutClass("grid", block.panelStyle, block.className)}
          style={{ ...sizingStyles, gridTemplateColumns: colTemplate, gridTemplateRows: rowTemplate }}
        >
          {block.cells.map((subBlock) => (
            <BlockRenderer key={subBlock.id || Math.random().toString()} block={subBlock} items={items} menuItemStyles={menuItemStyles} config={config} />
          ))}
        </div>
      );
    }
    case "CategoryHeaderBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <CategoryHeaderBlock {...block} color={block.color || config?.designTokens?.primaryColor} />
        </div>
      );
    case "MenuListBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <MenuListBlock {...block as any} items={items} menuItemStyles={menuItemStyles} />
        </div>
      );
    case "PosItemBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <PosItemBlock
            {...block}
            items={items}
            menuItemStyles={menuItemStyles}
          />
        </div>
      );
    case "CalloutBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <CalloutBlock
            {...block}
            panelStyle={
              block.panelStyle === "glass" || block.panelStyle === "none"
                ? block.panelStyle
                : undefined
            }
          />
        </div>
      );
    case "NestedItemBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <NestedItemBlock {...block} items={items} menuItemStyles={menuItemStyles} />
        </div>
      );
    case "MediaCarouselBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <MediaCarouselBlock slides={block.slides} style={block.style} />
        </div>
      );
    case "ExplodedItemBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <ExplodedItemBlock 
            menuItemId={block.menuItemId} 
            items={items} 
            panelStyle={block.panelStyle} 
            className={block.className}
            hideTitle={(block as any).hideTitle}
            hidePrice={(block as any).hidePrice}
            hideDescription={(block as any).hideDescription}
          >
             {block.blocks?.map((subBlock) => (
               <BlockRenderer key={subBlock.id || Math.random().toString()} block={subBlock} items={items} menuItemStyles={menuItemStyles} config={config} />
             ))}
          </ExplodedItemBlock>
        </div>
      );
    case "ModifierGroupBlock":
      return (
        <div style={sizingStyles} className="w-full h-full">
          <ModifierGroupBlock modifierGroupId={block.modifierGroupId} menuItemStyles={menuItemStyles} />
        </div>
      );
    case "ImageBlock": {
      const b = block as any;
      return (
        <div style={sizingStyles} className="w-full h-full flex items-center justify-center overflow-hidden">
          {b.imageUrl && <img src={b.imageUrl} alt="" className="max-w-full max-h-full object-contain" />}
        </div>
      );
    }
    case "VideoBlock": {
      const b = block as any;
      return (
        <div style={sizingStyles} className="w-full h-full overflow-hidden">
          {b.videoUrl && (
            <video src={b.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          )}
        </div>
      );
    }
    case "TimelineBlock": {
      const b = block as any;
      const steps = b.steps || [];
      return (
        <div style={sizingStyles} className="w-full h-full flex flex-col gap-6 p-4">
          {steps.map((step: any, idx: number) => (
            <div key={step.id} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center text-sm font-bold text-cyan-400 shrink-0">
                {idx + 1}
              </div>
              <div className="text-xl text-zinc-100 mt-0.5">{step.text}</div>
            </div>
          ))}
        </div>
      );
    }
    default:
      return (
        <div style={sizingStyles} className="p-4 bg-red-950/20 border border-red-900 text-red-500 rounded-xl text-xs font-mono">
          Unknown block type: {(block as any).type}
        </div>
      );
  }
}
