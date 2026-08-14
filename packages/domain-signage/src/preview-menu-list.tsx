"use client";

import type { MenuItemStyles, PosItem } from "@soustools/api-types";
import {
  resolveItemState,
  buildTitleStyle,
  buildPriceStyle,
} from "./menu-item-style-utils";

export function PreviewMenuList({
  block,
  items,
  styles,
}: {
  block: any;
  items: PosItem[];
  styles: MenuItemStyles;
}) {
  if (!block.itemIds || block.itemIds.length === 0) {
    return (
      <div
        className="border-border bg-muted/50 flex min-h-[60px] w-full flex-col items-center justify-center rounded-xl border border-dashed p-4 opacity-80"
        data-unique-id={block.uniqueSelector}
      >
        <span className="text-muted-foreground text-center text-[10px] font-bold tracking-widest uppercase">
          Select POS items from Block Settings to populate this space.
        </span>
      </div>
    );
  }

  const isGlass = block.panelStyle === "glass";

  const containerClasses = [
    "flex flex-col gap-2 w-full st-menu-list",
    isGlass
      ? "st-glass-panel p-2 border border-border bg-muted/50 rounded"
      : "",
    block.className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} data-unique-id={block.uniqueSelector}>
      {block.itemIds.map((itemId: string) => {
        const item = items.find(
          (i) => i.id === itemId || i.externalId === itemId,
        );
        if (!item) return null;

        const blockStyles = block.styles ?? styles;
        const optStyle = resolveItemState(item, false, blockStyles);
        if (optStyle.hidden && item.isSoldOut) return null;

        const isFlatItem =
          block.panelStyle === "none" ||
          ((!blockStyles.regular.backgroundColor ||
            blockStyles.regular.backgroundColor === "transparent" ||
            blockStyles.regular.backgroundColor.includes("0,0,0,0")) &&
            (!blockStyles.regular.borderWidth ||
              !blockStyles.regular.borderColor ||
              blockStyles.regular.borderColor === "transparent"));

        const itemClasses = [
          "p-1.5 rounded flex justify-between items-center text-[9px] st-menu-item",
          isGlass
            ? "bg-transparent border-transparent"
            : isFlatItem
              ? "bg-transparent border-transparent"
              : "border border-border bg-muted/50",
          item.isSoldOut ? "st-sold-out" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={item.id}
            className={itemClasses}
            style={{
              opacity:
                optStyle.dimOpacity !== undefined
                  ? optStyle.dimOpacity
                  : item.isSoldOut
                    ? 0.5
                    : 1,
              filter: optStyle.grayscale ? "grayscale(1)" : undefined,
            }}
          >
            <div className="flex w-full flex-col truncate">
              <div className="flex w-full items-center justify-between">
                <span
                  style={buildTitleStyle(optStyle)}
                  className="st-menu-item-title truncate font-semibold"
                >
                  {item.name}
                </span>
                {!(block as any).priceDisplay && (
                  <span
                    style={buildPriceStyle(optStyle)}
                    className="st-price-tag shrink-0 pl-2 font-mono"
                  >
                    ${Number(item.price).toFixed(2)}
                  </span>
                )}
              </div>
              {!block.hideDescriptions && item.description && (
                <span className="truncate text-[8px] opacity-70">
                  {item.description}
                </span>
              )}
              {(block as any).priceDisplay && (
                <div className="border-border mt-2 flex gap-8 border-t pt-3">
                  {Object.entries((block as any).priceDisplay).map(
                    ([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-[8px] capitalize">
                          {key}
                        </span>
                        <span className="st-price-tag font-mono text-[9px]">
                          {value as string}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
