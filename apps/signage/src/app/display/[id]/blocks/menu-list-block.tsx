import React from "react";
import { PosItem, MenuItemStyles, SignageBlock } from "@soustools/api-types";
import { resolveItemState, buildTitleStyle, buildPriceStyle, buildCardStyle, buildDescriptionStyle } from "../menu-item-style-utils";

interface MenuListBlockProps extends SignageBlock {
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
}

export function MenuListBlock({
  itemIds,
  styles,
  panelStyle,
  className,
  items,
  menuItemStyles,
  itemModifiers,
  modifierLayout,
  hideDescriptions,
}: MenuListBlockProps) {
  if (!itemIds || itemIds.length === 0) return null;

  const isGlass = panelStyle === "glass";
  const containerClasses = [
    "flex flex-col gap-2 w-full st-menu-list",
    isGlass ? "st-glass-panel p-2 border border-white/10 bg-white/5 rounded" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {itemIds.map((itemId) => {
        const item = items.find((i) => i.id === itemId || i.externalId === itemId);
        if (!item) return null;

        const blockStyles = styles ?? menuItemStyles;
        const optStyle = resolveItemState(item, false, blockStyles);
        if (optStyle.hidden && item.isSoldOut) return null;

        const isFlatItem = panelStyle === "none" || (
          (!blockStyles.regular.backgroundColor || blockStyles.regular.backgroundColor === "transparent" || blockStyles.regular.backgroundColor.includes("0,0,0,0")) &&
          (!blockStyles.regular.borderWidth || !blockStyles.regular.borderColor || blockStyles.regular.borderColor === "transparent")
        );

        let borderClass = "border";
        let cardStyle = buildCardStyle(optStyle);
        if (isFlatItem) {
          borderClass = "border-transparent bg-transparent px-2 py-1.5";
          delete cardStyle.backgroundColor;
          delete cardStyle.borderColor;
          delete cardStyle.borderWidth;
          delete cardStyle.boxShadow;
        }

        const titleStyle = buildTitleStyle(optStyle);
        const priceStyle = buildPriceStyle(optStyle);
        const descStyle = buildDescriptionStyle(optStyle);

        const overrides = itemModifiers?.[itemId] || [];
        const isInlineMod = modifierLayout === "inline";

        return (
          <div
            key={item.id}
            className={`flex flex-col justify-between items-start gap-1 w-full rounded-xl ${borderClass} transition-all duration-300 relative st-menu-item`}
            style={{
              ...cardStyle,
              opacity: item.isSoldOut ? (blockStyles.soldOut.dimOpacity ?? 0.5) : 1,
            }}
          >
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col">
                <span className="font-bold tracking-tight st-item-title leading-snug" style={titleStyle}>
                  {item.name}
                </span>
                {!hideDescriptions && item.description && (
                  <span className="text-[0.8rem] leading-tight mt-0.5 st-item-description" style={descStyle}>
                    {item.description}
                  </span>
                )}
              </div>
              {Number(item.price) > 0 && (
                <span className="font-extrabold whitespace-nowrap st-price-tag shrink-0" style={priceStyle}>
                  ${Number(item.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Modifiers List */}
            {overrides.length > 0 && (
              <div className={`w-full mt-1 ${isInlineMod ? "flex flex-row flex-wrap gap-x-3 gap-y-1" : "flex flex-col gap-1 pl-2 border-l border-white/10"}`}>
                {overrides.map((override, idx) => {
                  return (
                    <div key={idx} className="flex items-center text-[0.85rem] text-slate-300">
                      <span className="st-item-modifier text-cyan-400 font-medium">
                        {override.displayNameOverride || `Modifier Group (${override.modifierIds.length} items)`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {item.isSoldOut && optStyle.strikethrough && (
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 transform -translate-y-1/2 opacity-75 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
