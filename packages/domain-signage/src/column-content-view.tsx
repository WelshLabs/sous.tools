"use client";

import {
  type ColumnConfig,
  type PosItem,
  type MenuItemStyles,
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
import { PreviewBlockRenderer } from "./preview-block-renderer";

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

  if (column.blocks && column.blocks.length > 0) {
    return (
      <div className="st-editor-preview-column flex h-full w-full flex-col gap-2 overflow-y-auto py-1">
        {column.blocks.map((block, idx) => (
          <PreviewBlockRenderer
            key={idx}
            block={block}
            items={items}
            styles={styles}
          />
        ))}
      </div>
    );
  }

  const selectedItems = (column.itemIds || [])
    .map((id) => items.find((item) => item.id === id || item.externalId === id))
    .filter((item): item is PosItem => !!item)
    .filter((item) => !item.isSoldOut || !styles.soldOut.hidden);

  if (column.type === "MENU") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 overflow-y-auto py-1">
        {selectedItems.length === 0 ? (
          <span className="text-muted-foreground block text-center text-[10px] italic">
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
                className="flex flex-col justify-between gap-1 rounded border p-1.5 transition-all"
                style={cardStyle}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className="max-w-[70%] truncate text-[10px] font-semibold"
                    style={titleStyle}
                  >
                    {stateStyle.icon &&
                      stateStyle.iconPosition === "before-title" && (
                        <span className="mr-0.5">{stateStyle.icon}</span>
                      )}
                    {item.name}
                    {stateStyle.icon &&
                      stateStyle.iconPosition === "after-title" && (
                        <span className="ml-0.5">{stateStyle.icon}</span>
                      )}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-mono text-[10px]" style={priceStyle}>
                      ${Number(item.price).toFixed(2)}
                    </span>
                    {stateStyle.icon &&
                      stateStyle.iconPosition === "top-right-corner" && (
                        <span className="text-[10px]">{stateStyle.icon}</span>
                      )}
                  </div>
                </div>
                {item.description && (
                  <p
                    className="line-clamp-2 text-left text-[8px]"
                    style={descStyle}
                  >
                    {item.description}
                  </p>
                )}
                {stateStyle.badge && (
                  <span
                    className="self-start px-1 py-0.5 text-[7px] font-bold uppercase"
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
      <div className="bg-background/20 flex h-full min-h-[120px] w-full items-center justify-center overflow-hidden rounded">
        {column.imageUrl ? (
          <img
            src={column.imageUrl}
            alt="Column visual"
            className={`h-full w-full object-${column.fit || "cover"}`}
          />
        ) : (
          <div className="flex flex-col items-center text-[10px] text-zinc-600">
            <ImageIcon className="mb-1 h-6 w-6" />
            <span>No Image URL</span>
          </div>
        )}
      </div>
    );
  }

  if (column.type === "TEXT") {
    return (
      <div className="space-y-1 text-center">
        <h4 className="text-foreground text-xs font-bold">
          {column.title || "Untitled"}
        </h4>
        <p className="text-muted-foreground text-[10px] leading-normal">
          {column.content || "Empty content"}
        </p>
      </div>
    );
  }

  return null;
};
