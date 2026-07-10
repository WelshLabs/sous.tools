"use client";

import type { MenuItemStyles, PosItem } from "@soustools/api-types";
import { resolveItemState, buildTitleStyle, buildPriceStyle } from "./menu-item-style-utils";


export function PreviewMenuList({ block, items, styles }: { block: any, items: PosItem[], styles: MenuItemStyles }) {
    
      if (!block.itemIds || block.itemIds.length === 0) {
        return (
          <div
            className="flex flex-col items-center justify-center w-full min-h-[60px] p-4 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5 opacity-80"
            data-unique-id={block.uniqueSelector}
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
              Select POS items from Block Settings to populate this space.
            </span>
          </div>
        );
      }

      const isGlass = block.panelStyle === "glass";

      const containerClasses = [
        "flex flex-col gap-2 w-full st-menu-list",
        isGlass
          ? "st-glass-panel p-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded"
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
                  : "border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5",
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
                <div className="flex flex-col truncate w-full">
                  <div className="flex justify-between items-center w-full">
                    <span
                      style={buildTitleStyle(optStyle)}
                      className="font-semibold truncate st-menu-item-title"
                    >
                      {item.name}
                    </span>
                    {!(block as any).priceDisplay && (
                      <span
                        style={buildPriceStyle(optStyle)}
                        className="font-mono st-price-tag shrink-0 pl-2"
                      >
                        ${Number(item.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {!block.hideDescriptions && item.description && (
                    <span className="text-[8px] opacity-70 truncate">
                      {item.description}
                    </span>
                  )}
                  {(block as any).priceDisplay && (
                    <div className="flex gap-8 border-t border-black/10 dark:border-white/10 pt-3 mt-2">
                      {Object.entries((block as any).priceDisplay).map(
                        ([key, value]) => (
                          <div key={key} className="flex gap-2 items-center">
                            <span className="text-zinc-400 capitalize text-[8px]">
                              {key}
                            </span>
                            <span className="font-mono st-price-tag text-[9px]">
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
