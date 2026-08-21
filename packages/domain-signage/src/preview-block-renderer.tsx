"use client";

import React from "react";
import {
  type MenuItemStyles,
  type SignageBlock,
  type PosItem,
} from "@soustools/api-types";
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
          {(block.blocks || []).map((sub: SignageBlock, idx: number) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              onFetchModifierOptions={onFetchModifierOptions}
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
          {(block.blocks || []).map((sub, idx) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              onFetchModifierOptions={onFetchModifierOptions}
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
        }[block.columns] || "grid-cols-2";
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
          {(block.cells || []).map((sub, idx) => (
            <PreviewBlockRenderer
              key={idx}
              block={sub}
              items={items}
              styles={styles}
              onFetchModifierOptions={onFetchModifierOptions}
            />
          ))}
        </div>
      );
    }

    case "ExplodedItemBlock": {
      const b = block as any;
      const baseItem = items.find(
        (i) => i.id === b.menuItemId || i.externalId === b.menuItemId,
      );
      const isGlass = block.panelStyle === "glass";
      const classes = [
        "flex flex-col gap-3 w-full st-exploded-item rounded-2xl border p-4 shadow-xl transition-all",
        isGlass ? "st-glass-panel border-border" : "border-border bg-card/60",
        isRoot ? "flex-1 h-full" : "",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");

      const showHeader =
        b.badge ||
        (!b.hideTitle && (baseItem?.name || b.menuItemId)) ||
        (!b.hidePrice && baseItem?.price) ||
        (!b.hideDescription && (baseItem?.description || b.subtitle));

      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          {showHeader && (
            <div className="border-border flex flex-col gap-1 border-b pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {b.badge && (
                    <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[8px] font-black tracking-wider text-zinc-950 uppercase">
                      {b.badge}
                    </span>
                  )}
                  {!b.hideTitle && (
                    <h3 className="text-foreground font-archivo text-sm font-bold tracking-wide">
                      {baseItem?.name || b.menuItemId || "Exploded Item"}
                    </h3>
                  )}
                </div>
                {!b.hidePrice && baseItem && (
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    ${Number(baseItem.price).toFixed(2)}
                  </span>
                )}
              </div>
              {!b.hideDescription && (baseItem?.description || b.subtitle) && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {baseItem?.description || b.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Child Blocks (Modifiers, Columns, Ingredients) */}
          <div className="flex flex-col gap-2">
            {(block.blocks || []).map((sub, idx) => (
              <PreviewBlockRenderer
                key={idx}
                block={sub}
                items={items}
                styles={styles}
                onFetchModifierOptions={onFetchModifierOptions}
              />
            ))}
          </div>
        </div>
      );
    }

    default:
      return (
        <PreviewContentBlocks
          block={block}
          items={items}
          styles={styles}
          onFetchModifierOptions={onFetchModifierOptions}
        />
      );
  }
}
