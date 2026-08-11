"use client";

import React from "react";
import { type ColumnConfig, type MenuItemStyles, type PosItem } from "@soustools/api-types";
import {
  buildCardStyle,
  buildTitleStyle,
  buildPriceStyle,
  buildDescriptionStyle,
  resolveItemState,
  isItemHighlighted,
} from "./menu-item-style-utils";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";

interface PreviewMenuRendererProps {
  column: ColumnConfig;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export const PreviewMenuRenderer: React.FC<PreviewMenuRendererProps> = ({
  column,
  items,
  menuItemStyles,
}) => {
  const styles = menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES;

  const renderPreviewItem = (item: PosItem) => {
    const highlighted = isItemHighlighted(item, column.highlightItems);
    const stateStyle = resolveItemState(item, highlighted, styles);
    const cardStyle = buildCardStyle(stateStyle);
    const titleStyle = buildTitleStyle(stateStyle);
    const priceStyle = buildPriceStyle(stateStyle);
    const descStyle = buildDescriptionStyle(stateStyle);

    const cardClassName = [
      "p-2 rounded-lg text-left text-[10px] transition-all flex flex-col justify-between h-full min-h-[50px] border st-menu-item",
      item.isSoldOut ? "st-sold-out" : ""
    ].filter(Boolean).join(" ");

    return (
      <div
        key={item.id}
        className={cardClassName}
        style={cardStyle}
      >
        <div className="space-y-0.5">
          <div className="flex justify-between items-start gap-1">
            <h5 className="font-bold truncate max-w-[70%] text-[10px] leading-tight st-menu-item-title" style={titleStyle}>
              {item.name}
            </h5>
            <span className="font-semibold text-[9px] whitespace-nowrap st-price-tag" style={priceStyle}>
              ${Number(item.price).toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-[8px] line-clamp-1 leading-normal st-item-description" style={descStyle}>
              {item.description}
            </p>
          )}
        </div>
        {stateStyle.badge && (
          <div className="mt-1 flex">
            <span
              className={[
                "text-[7px] px-1 py-0.5 rounded font-black uppercase tracking-wider st-menu-item-badge",
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
  };

  let activeItems: PosItem[] = [];
  if (column.itemIds && column.itemIds.length > 0) {
    activeItems = column.itemIds
      .map((id) => items.find((item) => item.id === id || item.externalId === id))
      .filter((item): item is PosItem => !!item);
  }
  activeItems = activeItems.filter((item) => {
    if (!item.isSoldOut) return true;
    return !styles.soldOut.hidden;
  });

  if (activeItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-[10px] italic">
        No menu items selected
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2.5 bg-[oklch(0.08_0.01_260)] flex flex-col rounded-lg overflow-hidden">
      <h4 className="text-[10px] font-bold text-center mb-1.5 font-brand text-muted-foreground">Menu</h4>
      <div className="grid grid-cols-3 gap-1.5 overflow-y-auto max-h-[140px] pr-1">
        {activeItems.map(renderPreviewItem)}
      </div>
    </div>
  );
};
