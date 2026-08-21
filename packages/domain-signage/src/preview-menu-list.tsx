"use client";

import type { MenuItemStyles, PosItem } from "@soustools/api-types";
import {
  resolveItemState,
  buildTitleStyle,
  buildPriceStyle,
  buildCardStyle,
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
      ? "st-glass-panel p-2 border border-border bg-muted/50 rounded-xl"
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
          "p-2 rounded-lg flex flex-col justify-between text-[9px] st-menu-item transition-all",
          isGlass
            ? "bg-transparent border-transparent"
            : isFlatItem
              ? "bg-transparent border-transparent"
              : "border border-border bg-card/60",
          item.isSoldOut ? "st-sold-out" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const itemModifiers =
          block.itemModifiers?.[item.id] ||
          block.itemModifiers?.[item.externalId || ""] ||
          [];

        return (
          <div
            key={item.id}
            className={itemClasses}
            style={{
              ...(isFlatItem ? {} : buildCardStyle(optStyle)),
              opacity:
                optStyle.dimOpacity !== undefined
                  ? optStyle.dimOpacity
                  : item.isSoldOut
                    ? 0.5
                    : 1,
              filter: optStyle.grayscale ? "grayscale(1)" : undefined,
            }}
          >
            <div className="flex w-full flex-col">
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span
                    style={buildTitleStyle(optStyle)}
                    className="st-menu-item-title truncate font-semibold"
                  >
                    {item.name}
                  </span>
                  {item.isSoldOut && (
                    <span className="py-0.2 shrink-0 rounded bg-red-500/20 px-1 text-[7px] font-bold text-red-400 uppercase">
                      Sold Out
                    </span>
                  )}
                </div>
                {!(block as any).priceDisplay && (
                  <span
                    style={buildPriceStyle(optStyle)}
                    className="st-price-tag shrink-0 font-mono font-bold"
                  >
                    ${Number(item.price).toFixed(2)}
                  </span>
                )}
              </div>

              {!block.hideDescriptions && item.description && (
                <span className="text-muted-foreground mt-0.5 text-[8px] leading-tight opacity-80">
                  {item.description}
                </span>
              )}

              {/* Modifier Overrides Rendering */}
              {itemModifiers.length > 0 && (
                <div
                  className={
                    block.modifierLayout === "inline"
                      ? "mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[8px]"
                      : "mt-1.5 flex flex-col gap-1 border-l-2 border-cyan-500/30 pl-2.5 text-[8px]"
                  }
                >
                  {itemModifiers.map((mod: any, mIdx: number) => {
                    const label =
                      mod.text ||
                      mod.displayNameOverride ||
                      (mod.modifierIds && mod.modifierIds.length > 0
                        ? mod.modifierIds.join(", ")
                        : "");
                    if (!label && !mod.price) return null;
                    return (
                      <div
                        key={mIdx}
                        className={
                          block.modifierLayout === "inline"
                            ? "flex items-center gap-1 text-cyan-400"
                            : "flex items-center justify-between gap-2 text-cyan-400"
                        }
                      >
                        <span className="font-medium italic">
                          {block.modifierLayout === "inline"
                            ? `• ${label}`
                            : label}
                        </span>
                        {mod.price && (
                          <span className="font-mono font-bold text-cyan-300">
                            {mod.price.startsWith("$")
                              ? mod.price
                              : `+$${mod.price}`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {(block as any).priceDisplay && (
                <div className="border-border mt-2 flex gap-8 border-t pt-2">
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
