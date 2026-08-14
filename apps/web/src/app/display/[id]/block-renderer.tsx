"use client";

import React from "react";
import {
  type SignageBlock,
  type PosItem,
  type MenuItemStyles,
  type BlockSizing,
} from "@soustools/api-types";
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
  const {
    width,
    height,
    flexBasis,
    flexGrow,
    flexShrink,
    gap,
    padding,
    margin,
  } = sizing;
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

export function getLayoutClass(
  direction: "column" | "row" | "grid",
  panelStyle?: string,
  className?: string,
) {
  return [
    direction === "grid"
      ? "grid gap-4 w-full h-full st-layout-grid"
      : `flex flex-${direction === "column" ? "col" : "row"} gap-4 w-full h-full st-layout-${direction}`,
    panelStyle === "glass" ? " p-4 rounded-2xl" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function BlockRenderer({
  block,
  items,
  menuItemStyles,
  config,
}: BlockRendererProps): React.JSX.Element {
  const sizingStyles = getSizingStyles(block.sizing);

  switch (block.type) {
    case "ColumnBlock":
      return (
        <div
          className={getLayoutClass(
            "column",
            block.panelStyle,
            block.className,
          )}
          style={sizingStyles}
        >
          {block.blocks.map((subBlock) => (
            <BlockRenderer
              key={subBlock.id || Math.random().toString()}
              block={subBlock}
              items={items}
              menuItemStyles={menuItemStyles}
              config={config}
            />
          ))}
        </div>
      );
    case "RowBlock":
      return (
        <div
          className={getLayoutClass("row", block.panelStyle, block.className)}
          style={sizingStyles}
        >
          {block.blocks.map((subBlock) => (
            <BlockRenderer
              key={subBlock.id || Math.random().toString()}
              block={subBlock}
              items={items}
              menuItemStyles={menuItemStyles}
              config={config}
            />
          ))}
        </div>
      );
    case "GridBlock": {
      const colTemplate = `repeat(${block.columns}, minmax(0, 1fr))`;
      const rowTemplate = `repeat(${block.rows}, minmax(0, 1fr))`;
      return (
        <div
          className={getLayoutClass("grid", block.panelStyle, block.className)}
          style={{
            ...sizingStyles,
            gridTemplateColumns: colTemplate,
            gridTemplateRows: rowTemplate,
          }}
        >
          {block.cells.map((subBlock) => (
            <BlockRenderer
              key={subBlock.id || Math.random().toString()}
              block={subBlock}
              items={items}
              menuItemStyles={menuItemStyles}
              config={config}
            />
          ))}
        </div>
      );
    }
    case "CategoryHeaderBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
          <CategoryHeaderBlock
            {...block}
            color={block.color || config?.designTokens?.primaryColor}
          />
        </div>
      );
    case "MenuListBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
          <MenuListBlock
            {...(block as any)}
            items={items}
            menuItemStyles={menuItemStyles}
          />
        </div>
      );
    case "PosItemBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
          <PosItemBlock
            {...block}
            items={items}
            menuItemStyles={menuItemStyles}
          />
        </div>
      );
    case "CalloutBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
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
        <div style={sizingStyles} className="h-full w-full">
          <NestedItemBlock
            {...block}
            items={items}
            menuItemStyles={menuItemStyles}
          />
        </div>
      );
    case "MediaCarouselBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
          <MediaCarouselBlock slides={block.slides} style={block.style} />
        </div>
      );
    case "ExplodedItemBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
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
              <BlockRenderer
                key={subBlock.id || Math.random().toString()}
                block={subBlock}
                items={items}
                menuItemStyles={menuItemStyles}
                config={config}
              />
            ))}
          </ExplodedItemBlock>
        </div>
      );
    case "ModifierGroupBlock":
      return (
        <div style={sizingStyles} className="h-full w-full">
          <ModifierGroupBlock
            modifierGroupId={block.modifierGroupId}
            menuItemStyles={menuItemStyles}
          />
        </div>
      );
    case "ImageBlock": {
      const b = block as any;
      return (
        <div
          style={sizingStyles}
          className="flex h-full w-full items-center justify-center overflow-hidden"
        >
          {b.imageUrl && (
            <img
              src={b.imageUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      );
    }
    case "VideoBlock": {
      const b = block as any;
      return (
        <div style={sizingStyles} className="h-full w-full overflow-hidden">
          {b.videoUrl && (
            <video
              src={b.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          )}
        </div>
      );
    }
    case "TimelineBlock": {
      const b = block as any;
      const steps = b.steps || [];
      return (
        <div
          style={sizingStyles}
          className="flex h-full w-full flex-col gap-6 p-4"
        >
          {steps.map((step: any, idx: number) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-cyan-500 bg-cyan-500/20 text-sm font-bold text-cyan-400">
                {idx + 1}
              </div>
              <div className="mt-0.5 text-xl text-zinc-100">{step.text}</div>
            </div>
          ))}
        </div>
      );
    }
    default:
      return (
        <div
          style={sizingStyles}
          className="rounded-xl border border-red-900 bg-red-950/20 p-4 font-mono text-xs text-red-500"
        >
          Unknown block type: {(block as any).type}
        </div>
      );
  }
}
