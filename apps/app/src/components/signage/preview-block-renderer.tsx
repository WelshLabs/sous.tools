"use client";

import React from "react";
import { SignageBlock, PosItem, MenuItemStyles } from "@soustools/api-types";
import { PreviewContentBlocks } from "./preview-content-blocks";

interface PreviewBlockRendererProps {
  block: SignageBlock;
  items: PosItem[];
  styles: MenuItemStyles;
  isRoot?: boolean;
}

export function PreviewBlockRenderer({
  block,
  items,
  styles,
  isRoot,
}: PreviewBlockRendererProps): React.JSX.Element {
  switch (block.type) {
    // --- Layout Containers ---
    case "ColumnBlock": {
      const classes = [
        "flex flex-col gap-2 w-full st-layout-column",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-white/10 bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} />
          ))}
        </div>
      );
    }

    case "RowBlock": {
      const classes = [
        "flex flex-row gap-2 w-full overflow-x-auto st-layout-row",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-white/10 bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} />
          ))}
        </div>
      );
    }

    case "GridBlock": {
      const classes = [
        "grid gap-2 w-full st-layout-grid",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-white/10 bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div
          className={classes}
          data-unique-id={block.uniqueSelector}
          style={{
            gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${block.rows}, minmax(0, 1fr))`,
          }}
        >
          {(block.cells || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} />
          ))}
        </div>
      );
    }

    case "ExplodedItemBlock": {
      const classes = [
        "flex flex-col gap-2 w-full st-exploded-item",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-white/10 bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} />
          ))}
        </div>
      );
    }

    default:
      return <PreviewContentBlocks block={block} items={items} styles={styles} />;
  }
}
