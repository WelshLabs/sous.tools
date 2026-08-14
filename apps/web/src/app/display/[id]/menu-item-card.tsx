"use client";

import React from "react";
import {
  type PosItem,
  type MenuItemStyles,
  type HighlightItemConfig,
} from "@soustools/api-types";
import {
  buildCardStyle,
  buildTitleStyle,
  buildPriceStyle,
  buildDescriptionStyle,
  resolveItemState,
  isItemHighlighted,
} from "@soustools/domain-signage";

export interface MenuItemCardProps {
  item: PosItem;
  highlightItems?: (string | HighlightItemConfig)[];
  menuItemStyles: MenuItemStyles;
}

export function MenuItemCard({
  item,
  highlightItems,
  menuItemStyles,
}: MenuItemCardProps) {
  const highlighted = isItemHighlighted(item, highlightItems);
  const stateStyle = resolveItemState(item, highlighted, menuItemStyles);

  if (stateStyle.hidden && item.isSoldOut) return null;

  const cardStyle = buildCardStyle(stateStyle);
  const titleStyle = buildTitleStyle(stateStyle);
  const priceStyle = buildPriceStyle(stateStyle);
  const descStyle = buildDescriptionStyle(stateStyle);

  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl border transition-all duration-300"
      style={{
        ...cardStyle,
        overflow: "visible",
        padding: cardStyle.padding ?? "24px",
      }}
    >
      {stateStyle.icon && stateStyle.iconPosition === "top-right-corner" && (
        <span className="absolute top-2 right-3 text-xl">
          {stateStyle.icon}
        </span>
      )}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold tracking-tight" style={titleStyle}>
            {stateStyle.icon && stateStyle.iconPosition === "before-title" && (
              <span className="mr-1">{stateStyle.icon}</span>
            )}
            {item.name}
            {stateStyle.icon && stateStyle.iconPosition === "after-title" && (
              <span className="ml-1">{stateStyle.icon}</span>
            )}
          </h3>
          <span
            className="text-lg font-extrabold whitespace-nowrap"
            style={priceStyle}
          >
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="line-clamp-2 text-sm" style={descStyle}>
            {item.description}
          </p>
        )}
      </div>
      {stateStyle.badge && (
        <div className="mt-4 flex">
          <span
            className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase"
            style={{
              backgroundColor: stateStyle.badge.color,
              color: stateStyle.badge.textColor,
              borderRadius: stateStyle.badge.borderRadius ?? "4px",
            }}
          >
            {stateStyle.badge.text}
          </span>
        </div>
      )}
    </div>
  );
}
