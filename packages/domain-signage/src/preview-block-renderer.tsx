"use client";

import React from "react";
import { type MenuItemStyles, SignageBlock, PosItem } from "@soustools/api-types";
import { PreviewContentBlocks } from "./preview-content-blocks";

interface PreviewBlockRendererProps {
  block: SignageBlock;
  items: PosItem[];
  styles: MenuItemStyles;
  isRoot?: boolean;
  onFetchModifierOptions?: (id: string) => Promise<any[]>;
}

export function PreviewBlockRenderer({
  block,
  items,
  styles,
  isRoot,
  onFetchModifierOptions,
}: PreviewBlockRendererProps): React.JSX.Element {
  switch (block.type) {
    // --- Layout Containers ---
    case "ColumnBlock": {
      const classes = [
        "flex flex-col gap-2 w-full st-layout-column",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub: SignageBlock, idx: number) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} onFetchModifierOptions={onFetchModifierOptions} />
          ))}
        </div>
      );
    }

    case "RowBlock": {
      const classes = [
        "flex flex-row gap-2 w-full overflow-x-auto st-layout-row",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} onFetchModifierOptions={onFetchModifierOptions} />
          ))}
        </div>
      );
    }

    case "GridBlock": {
      const colClass = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[block.columns] || "grid-cols-2";
      const classes = [
        "grid gap-2 w-full st-layout-grid",
        colClass,
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div
          className={classes}
          data-unique-id={block.uniqueSelector}
        >
          {(block.cells || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} onFetchModifierOptions={onFetchModifierOptions} />
          ))}
        </div>
      );
    }

    case "ExplodedItemBlock": {
      const classes = [
        "flex flex-col gap-2 w-full st-exploded-item",
        block.panelStyle === "glass" ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded" : "",
        isRoot ? "flex-1 h-full" : "",
        block.className
      ].filter(Boolean).join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {(block.blocks || []).map((sub, idx) => (
            <PreviewBlockRenderer key={idx} block={sub} items={items} styles={styles} onFetchModifierOptions={onFetchModifierOptions} />
          ))}
        </div>
      );
    }

    default:
      return <PreviewContentBlocks block={block} items={items} styles={styles} onFetchModifierOptions={onFetchModifierOptions} />;
  }
}
