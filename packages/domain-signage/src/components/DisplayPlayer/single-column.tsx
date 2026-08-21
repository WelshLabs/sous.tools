"use client";

import {
  type ColumnConfig,
  type PosItem,
  type MenuItemStyles,
} from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";
import { DEFAULT_MENU_ITEM_STYLES } from "@soustools/domain-signage";

interface SingleColumnProps {
  column: ColumnConfig;
  index: number;
  style: React.CSSProperties;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export function SingleColumn({
  column,
  index,
  style,
  items,
  menuItemStyles = DEFAULT_MENU_ITEM_STYLES,
}: SingleColumnProps) {
  switch (column.type) {
    case "MENU": {
      let columnItems = items;
      if (column.itemIds && column.itemIds.length > 0) {
        columnItems = column.itemIds
          .map((id) =>
            items.find((item) => item.id === id || item.externalId === id),
          )
          .filter((item): item is PosItem => !!item);
      }
      columnItems = columnItems.filter(
        (item) => !(item.isSoldOut && (menuItemStyles.soldOut.hidden ?? false)),
      );
      return (
        <div
          key={index}
          style={style}
          className="flex h-full w-full flex-col gap-4 overflow-x-hidden overflow-y-auto p-6"
        >
          {columnItems.length > 0 ? (
            columnItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                highlightItems={column.highlightItems}
                menuItemStyles={menuItemStyles}
              />
            ))
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm dark:text-zinc-500">
              No Menu Items Selected
            </div>
          )}
        </div>
      );
    }
    case "IMAGE":
      return (
        <div
          key={index}
          style={style}
          className="relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent"
        >
          {column.imageUrl ? (
            <img
              src={column.imageUrl}
              alt="Column Media"
              className={`h-full w-full object-${column.fit || "cover"}`}
            />
          ) : (
            <div className="text-muted-foreground text-sm dark:text-zinc-500">
              No Image Selected
            </div>
          )}
        </div>
      );
    case "VIDEO":
      return (
        <div
          key={index}
          style={style}
          className="relative h-full w-full overflow-hidden bg-transparent"
        >
          {column.videoUrl ? (
            <video
              src={column.videoUrl}
              autoPlay
              loop={column.loop !== false}
              muted={column.mute !== false}
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm dark:text-zinc-500">
              No Video Selected
            </div>
          )}
        </div>
      );
    case "IFRAME":
      return (
        <div
          key={index}
          style={style}
          className="relative h-full w-full overflow-hidden bg-transparent"
        >
          {column.iframeUrl ? (
            <iframe
              src={column.iframeUrl}
              title="Embedded Content"
              className="h-full w-full border-none"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm dark:text-zinc-500">
              No URL Configured
            </div>
          )}
        </div>
      );
    case "TEXT":
      return (
        <div
          key={index}
          style={style}
          className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
        >
          {column.title && (
            <h2
              className="mb-4 text-3xl font-extrabold tracking-tight text-white"
              style={{
                fontFamily: "var(--marketing-text-font)",
                color: "var(--marketing-text-color)",
              }}
            >
              {column.title}
            </h2>
          )}
          {column.content && (
            <p
              className="text-lg whitespace-pre-line text-zinc-700 dark:text-zinc-300"
              style={{
                fontFamily: "var(--marketing-text-font)",
                color: "var(--marketing-text-color)",
              }}
            >
              {column.content}
            </p>
          )}
          {!column.title && !column.content && (
            <div className="text-muted-foreground text-sm dark:text-zinc-500">
              No Text Configured
            </div>
          )}
        </div>
      );
    case "EMPTY":
    default:
      return (
        <div
          key={index}
          style={style}
          className="h-full w-full bg-transparent"
        />
      );
  }
}
