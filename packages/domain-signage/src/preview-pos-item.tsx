"use client";

import type { MenuItemStyles, PosItem } from "@soustools/api-types";
import { resolveItemState, buildPriceStyle, buildTitleStyle } from "./menu-item-style-utils";

export function PreviewPosItem({ block, items, styles }: { block: any, items: PosItem[], styles: MenuItemStyles }) {
    
      const item = items.find(
        (i) => i.id === block.posItemId || i.externalId === block.posItemId,
      );
      if (!item) {
        return (
          <div className="text-[8px] text-zinc-500 italic">
            Item not found ({block.posItemId})
          </div>
        );
      }
      const optStyle = resolveItemState(item, false, styles);
      if (optStyle.hidden && item.isSoldOut) return <></>;

      const isGlass = block.panelStyle === "glass";
      const isFlat =
        block.panelStyle === "none" ||
        ((!styles.regular.backgroundColor ||
          styles.regular.backgroundColor === "transparent" ||
          styles.regular.backgroundColor.includes("0,0,0,0")) &&
          (!styles.regular.borderWidth ||
            !styles.regular.borderColor ||
            styles.regular.borderColor === "transparent"));

      const classes = [
        "p-1.5 rounded flex justify-between items-center text-[9px] st-menu-item",
        isGlass
          ? "st-glass-panel"
          : isFlat
            ? "bg-transparent border-transparent"
            : "border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5",
        item.isSoldOut ? "st-sold-out" : "",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div
          className={classes}
          data-unique-id={block.uniqueSelector}
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
          <span
            style={buildTitleStyle(optStyle)}
            className="font-semibold truncate max-w-[70%] st-menu-item-title"
          >
            {item.name}
          </span>
          <span
            style={buildPriceStyle(optStyle)}
            className="font-mono st-price-tag"
          >
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      );
}
