"use client";

import React from "react";
import { PosItem, MenuItemStyles, HighlightItemConfig } from "@soustools/api-types";
import {
  buildCardStyle,
  buildTitleStyle,
  buildPriceStyle,
  buildDescriptionStyle,
  resolveItemState,
  isItemHighlighted,
} from "./menu-item-style-utils";

export interface MenuItemCardProps {
  item: PosItem;
  highlightItems?: (string | HighlightItemConfig)[];
  menuItemStyles: MenuItemStyles;
}

export function MenuItemCard({ item, highlightItems, menuItemStyles }: MenuItemCardProps) {
  const highlighted = isItemHighlighted(item, highlightItems);
  const stateStyle = resolveItemState(item, highlighted, menuItemStyles);

  if (stateStyle.hidden && item.isSoldOut) return null;

  const cardStyle = buildCardStyle(stateStyle);
  const titleStyle = buildTitleStyle(stateStyle);
  const priceStyle = buildPriceStyle(stateStyle);
  const descStyle = buildDescriptionStyle(stateStyle);

  return (
    <div
      className="rounded-2xl transition-all duration-300 flex flex-col justify-between border relative"
      style={{ ...cardStyle, overflow: "visible", padding: cardStyle.padding ?? "24px" }}
    >
      {stateStyle.icon && stateStyle.iconPosition === "top-right-corner" && (
        <span className="absolute top-2 right-3 text-xl">{stateStyle.icon}</span>
      )}
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-bold tracking-tight" style={titleStyle}>
            {stateStyle.icon && stateStyle.iconPosition === "before-title" && (
              <span className="mr-1">{stateStyle.icon}</span>
            )}
            {item.name}
            {stateStyle.icon && stateStyle.iconPosition === "after-title" && (
              <span className="ml-1">{stateStyle.icon}</span>
            )}
          </h3>
          <span className="text-lg font-extrabold whitespace-nowrap" style={priceStyle}>
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="text-sm line-clamp-2" style={descStyle}>
            {item.description}
          </p>
        )}
      </div>
      {stateStyle.badge && (
        <div className="mt-4 flex">
          <span
            className="text-[10px] px-2.5 py-1 font-black uppercase tracking-wider"
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
