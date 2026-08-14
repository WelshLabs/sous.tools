"use client";

import React from "react";
import {
  type ColumnConfig,
  type MenuItemStyles,
  type PosItem,
} from "@soustools/api-types";
import { Image as ImageIcon } from "lucide-react";
import {
  buildCardStyle,
  buildTitleStyle,
  buildPriceStyle,
  buildDescriptionStyle,
  resolveItemState,
  isItemHighlighted,
} from "./menu-item-style-utils";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";

interface ColumnPreviewProps {
  column: ColumnConfig;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export const ColumnMenuPreview: React.FC<ColumnPreviewProps> = ({
  column,
  items,
  menuItemStyles,
}) => {
  const styles = menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES;

  const activeItems = (column.itemIds || [])
    .map((id) => items.find((item) => item.id === id || item.externalId === id))
    .filter((item): item is PosItem => !!item)
    .filter((item) => {
      if (!item.isSoldOut) return true;
      return !styles.soldOut.hidden;
    });

  if (activeItems.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-[9px] italic">
        No menu items selected
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-[140px] w-full flex-col justify-start gap-1 overflow-y-auto p-2 pr-1">
      {activeItems.map((item) => {
        const highlighted = isItemHighlighted(item, column.highlightItems);
        const stateStyle = resolveItemState(item, highlighted, styles);
        const cardStyle = buildCardStyle(stateStyle);
        const titleStyle = buildTitleStyle(stateStyle);
        const priceStyle = buildPriceStyle(stateStyle);
        const descStyle = buildDescriptionStyle(stateStyle);

        return (
          <div
            key={item.id}
            className="flex shrink-0 flex-col justify-between rounded border p-1.5 text-[8px] transition-all"
            style={cardStyle}
          >
            <div className="flex items-start justify-between gap-1">
              <h5
                className="max-w-[70%] truncate text-[8px] font-bold"
                style={titleStyle}
              >
                {item.name}
              </h5>
              <span className="text-[8px] font-semibold" style={priceStyle}>
                ${Number(item.price).toFixed(2)}
              </span>
            </div>
            {item.description && (
              <p className="mt-0.5 line-clamp-1 text-[6px]" style={descStyle}>
                {item.description}
              </p>
            )}
            {stateStyle.badge && (
              <span
                className="mt-0.5 text-[6px] font-bold uppercase"
                style={{ color: stateStyle.badge.color }}
              >
                {stateStyle.badge.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ColumnImagePreview: React.FC<{ imageUrl?: string }> = ({
  imageUrl,
}) => (
  <div className="bg-background relative flex h-full w-full items-center justify-center overflow-hidden rounded">
    {imageUrl ? (
      <img src={imageUrl} alt="Promo" className="h-full w-full object-cover" />
    ) : (
      <div className="text-muted-foreground flex flex-col items-center gap-1 text-[10px]">
        <ImageIcon className="h-5 w-5 animate-pulse text-zinc-600" />
        <span>No Image URL</span>
      </div>
    )}
  </div>
);

export const ColumnTextPreview: React.FC<{
  title?: string;
  content?: string;
  marketingText?: string;
}> = ({ title, content, marketingText }) => (
  <div
    className="bg-muted/50 border-border flex h-full w-full flex-col justify-center space-y-1 overflow-hidden rounded border p-3 text-center"
    style={marketingText ? { fontFamily: marketingText } : undefined}
  >
    {title ? (
      <h4 className="text-foreground text-xs leading-tight font-bold">
        {title}
      </h4>
    ) : (
      <h4 className="text-muted-foreground text-xs font-bold italic">
        No Title
      </h4>
    )}
    {content ? (
      <p className="text-muted-foreground line-clamp-4 text-[9px] leading-normal">
        {content}
      </p>
    ) : (
      <p className="text-muted-foreground text-[8px] italic">
        No content text entered
      </p>
    )}
  </div>
);
