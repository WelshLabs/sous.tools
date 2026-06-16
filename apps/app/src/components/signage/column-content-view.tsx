"use client";

import React from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
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

interface ColumnContentViewProps {
  column: ColumnConfig;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

/**
 * Renders column content in the editor canvas using the same
 * menuItemStyles system as the live TV player, ensuring visual parity.
 */
export const ColumnContentView: React.FC<ColumnContentViewProps> = ({
  column,
  items,
  menuItemStyles,
}) => {
  const styles = menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES;

  const selectedItems = (column.itemIds || [])
    .map((id) => items.find((item) => item.id === id || item.squareId === id))
    .filter((item): item is PosItem => !!item)
    .filter((item) => !item.isSoldOut || !styles.soldOut.hidden);

  if (column.type === "MENU") {
    return (
      <div className="w-full h-full overflow-y-auto flex flex-col gap-1.5 py-1">
        {selectedItems.length === 0 ? (
          <span className="text-[10px] text-slate-500 italic block text-center">
            No items selected
          </span>
        ) : (
          selectedItems.map((item) => {
            const highlighted = isItemHighlighted(item, column.highlightItems);
            const stateStyle = resolveItemState(item, highlighted, styles);
            const cardStyle = buildCardStyle(stateStyle);
            const titleStyle = buildTitleStyle(stateStyle);
            const priceStyle = buildPriceStyle(stateStyle);
            const descStyle = buildDescriptionStyle(stateStyle);

            return (
              <div
                key={item.id}
                className="p-1.5 rounded flex flex-col justify-between gap-1 border transition-all"
                style={cardStyle}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="font-semibold truncate max-w-[70%] text-[10px]" style={titleStyle}>
                    {stateStyle.icon && stateStyle.iconPosition === "before-title" && (
                      <span className="mr-0.5">{stateStyle.icon}</span>
                    )}
                    {item.name}
                    {stateStyle.icon && stateStyle.iconPosition === "after-title" && (
                      <span className="ml-0.5">{stateStyle.icon}</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[10px]" style={priceStyle}>
                      ${Number(item.price).toFixed(2)}
                    </span>
                    {stateStyle.icon && stateStyle.iconPosition === "top-right-corner" && (
                      <span className="text-[10px]">{stateStyle.icon}</span>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="text-[8px] line-clamp-2 text-left" style={descStyle}>
                    {item.description}
                  </p>
                )}
                {stateStyle.badge && (
                  <span
                    className="text-[7px] font-bold uppercase px-1 py-0.5 self-start"
                    style={{
                      backgroundColor: stateStyle.badge.color,
                      color: stateStyle.badge.textColor,
                      borderRadius: stateStyle.badge.borderRadius ?? "3px",
                    }}
                  >
                    {stateStyle.badge.text}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (column.type === "IMAGE") {
    return (
      <div className="w-full h-full min-h-[120px] flex items-center justify-center bg-black/20 rounded overflow-hidden">
        {column.imageUrl ? (
          <img src={column.imageUrl} alt="Column visual" className={`w-full h-full object-${column.fit || "cover"}`} />
        ) : (
          <div className="flex flex-col items-center text-slate-600 text-[10px]">
            <ImageIcon className="w-6 h-6 mb-1" />
            <span>No Image URL</span>
          </div>
        )}
      </div>
    );
  }

  if (column.type === "TEXT") {
    return (
      <div className="text-center space-y-1">
        <h4 className="text-xs font-bold text-white">{column.title || "Untitled"}</h4>
        <p className="text-[10px] text-slate-400 leading-normal">{column.content || "Empty content"}</p>
      </div>
    );
  }

  return null;
};
