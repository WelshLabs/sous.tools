"use client";

import React from "react";
import { type ColumnConfig, type MenuItemStyles, type PosItem } from "@soustools/api-types";
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
      <div className="flex items-center justify-center h-full text-muted-foreground text-[9px] italic">
        No menu items selected
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 flex flex-col justify-start gap-1 overflow-y-auto max-h-[140px] pr-1">
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
            className="p-1.5 rounded text-[8px] transition-all flex flex-col justify-between shrink-0 border"
            style={cardStyle}
          >
            <div className="flex justify-between items-start gap-1">
              <h5 className="font-bold truncate max-w-[70%] text-[8px]" style={titleStyle}>
                {item.name}
              </h5>
              <span className="font-semibold text-[8px]" style={priceStyle}>
                ${Number(item.price).toFixed(2)}
              </span>
            </div>
            {item.description && (
              <p className="text-[6px] line-clamp-1 mt-0.5" style={descStyle}>
                {item.description}
              </p>
            )}
            {stateStyle.badge && (
              <span
                className="text-[6px] font-bold uppercase mt-0.5"
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

export const ColumnImagePreview: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => (
  <div className="w-full h-full relative flex items-center justify-center bg-background rounded overflow-hidden">
    {imageUrl ? (
      <img src={imageUrl} alt="Promo" className="w-full h-full object-cover" />
    ) : (
      <div className="text-[10px] text-muted-foreground flex flex-col items-center gap-1">
        <ImageIcon className="w-5 h-5 text-zinc-600 animate-pulse" />
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
    className="w-full h-full p-3 bg-muted/50 border border-border rounded flex flex-col justify-center text-center space-y-1 overflow-hidden"
    style={marketingText ? { fontFamily: marketingText } : undefined}
  >
    {title ? (
      <h4 className="text-xs font-bold text-foreground leading-tight">{title}</h4>
    ) : (
      <h4 className="text-xs font-bold text-muted-foreground italic">No Title</h4>
    )}
    {content ? (
      <p className="text-[9px] text-muted-foreground leading-normal line-clamp-4">{content}</p>
    ) : (
      <p className="text-[8px] text-muted-foreground italic">No content text entered</p>
    )}
  </div>
);
