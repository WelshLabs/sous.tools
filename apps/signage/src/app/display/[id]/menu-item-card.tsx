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
  panelStyle?: "glass" | "none";
  className?: string;
}

export function MenuItemCard({
  item,
  highlightItems,
  menuItemStyles,
  panelStyle,
  className,
}: MenuItemCardProps) {
  const highlighted = isItemHighlighted(item, highlightItems);
  const stateStyle = resolveItemState(item, highlighted, menuItemStyles);

  if (stateStyle.hidden && item.isSoldOut) return null;

  const cardStyle = buildCardStyle(stateStyle);
  const titleStyle = buildTitleStyle(stateStyle);
  const priceStyle = buildPriceStyle(stateStyle);
  const descStyle = buildDescriptionStyle(stateStyle);

  const isGlass = panelStyle === "glass";
  const isBgTransparent = !menuItemStyles.regular.backgroundColor ||
    menuItemStyles.regular.backgroundColor === "transparent" ||
    menuItemStyles.regular.backgroundColor.replace(/\s+/g, "") === "rgba(0,0,0,0)" ||
    menuItemStyles.regular.backgroundColor.replace(/\s+/g, "") === "rgba(255,255,255,0)";
  const isBorderZero = !menuItemStyles.regular.borderWidth ||
    menuItemStyles.regular.borderWidth === 0 ||
    !menuItemStyles.regular.borderColor ||
    menuItemStyles.regular.borderColor === "transparent" ||
    menuItemStyles.regular.borderColor.replace(/\s+/g, "") === "rgba(0,0,0,0)";
  const isFlat = panelStyle === "none" || (isBgTransparent && isBorderZero);

  const finalCardStyle = { ...cardStyle };
  if (isFlat) {
    delete finalCardStyle.backgroundColor;
    delete finalCardStyle.borderColor;
    delete finalCardStyle.borderWidth;
    delete finalCardStyle.boxShadow;
  }

  const baseClasses = "rounded-2xl transition-all duration-300 flex flex-col justify-between relative";
  const glassClasses = isGlass ? "st-glass-panel" : "";
  const borderClasses = (!isGlass && !isFlat) ? "border" : "";
  const containerClassName = [
    baseClasses,
    glassClasses,
    borderClasses,
    "st-menu-item",
    item.isSoldOut ? "st-sold-out" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const finalStyle: React.CSSProperties = {
    ...finalCardStyle,
    overflow: "visible",
  };
  if (!isFlat) {
    finalStyle.padding = cardStyle.padding ?? "24px";
  }

  return (
    <div className={containerClassName} style={finalStyle}>
      {stateStyle.icon && stateStyle.iconPosition === "top-right-corner" && (
        <span className="absolute top-2 right-3 text-xl">{stateStyle.icon}</span>
      )}
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-bold tracking-tight st-menu-item-title" style={titleStyle}>
            {stateStyle.icon && stateStyle.iconPosition === "before-title" && (
              <span className="mr-1">{stateStyle.icon}</span>
            )}
            {item.name}
            {stateStyle.icon && stateStyle.iconPosition === "after-title" && (
              <span className="ml-1">{stateStyle.icon}</span>
            )}
          </h3>
          <span className="text-lg font-extrabold whitespace-nowrap st-price-tag" style={priceStyle}>
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="text-sm line-clamp-2 st-item-description" style={descStyle}>
            {item.description}
          </p>
        )}
      </div>
      {stateStyle.badge && (
        <div className="mt-4 flex">
          <span
            className={[
              "text-[10px] px-2.5 py-1 font-black uppercase tracking-wider st-menu-item-badge",
              item.isSoldOut ? "st-sold-out-badge" : ""
            ].filter(Boolean).join(" ")}
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
