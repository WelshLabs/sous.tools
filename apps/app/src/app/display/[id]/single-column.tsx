"use client";

import React from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";
import { DEFAULT_MENU_ITEM_STYLES } from "../../../components/signage/config-migration";

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
          .map((id) => items.find((item) => item.id === id || item.externalId === id))
          .filter((item): item is PosItem => !!item);
      }
      columnItems = columnItems.filter(
        (item) => !(item.isSoldOut && (menuItemStyles.soldOut.hidden ?? false))
      );
      return (
        <div
          key={index}
          style={style}
          className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden w-full h-full p-6"
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
            <div className="flex-1 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
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
          className="w-full h-full overflow-hidden relative bg-transparent flex items-center justify-center"
        >
          {column.imageUrl ? (
            <img
              src={column.imageUrl}
              alt="Column Media"
              className={`w-full h-full object-${column.fit || "cover"}`}
            />
          ) : (
            <div className="text-zinc-400 dark:text-zinc-500 text-sm">No Image Selected</div>
          )}
        </div>
      );
    case "VIDEO":
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full overflow-hidden relative bg-transparent"
        >
          {column.videoUrl ? (
            <video
              src={column.videoUrl}
              autoPlay
              loop={column.loop !== false}
              muted={column.mute !== false}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
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
          className="w-full h-full overflow-hidden relative bg-transparent"
        >
          {column.iframeUrl ? (
            <iframe
              src={column.iframeUrl}
              title="Embedded Content"
              className="w-full h-full border-none"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
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
          className="w-full h-full flex flex-col justify-center items-center text-center p-8"
        >
          {column.title && (
            <h2
              className="text-3xl font-extrabold tracking-tight mb-4 text-white"
              style={{ fontFamily: "var(--marketing-text-font)", color: "var(--marketing-text-color)" }}
            >
              {column.title}
            </h2>
          )}
          {column.content && (
            <p
              className="text-lg text-zinc-700 dark:text-zinc-300 whitespace-pre-line"
              style={{ fontFamily: "var(--marketing-text-font)", color: "var(--marketing-text-color)" }}
            >
              {column.content}
            </p>
          )}
          {!column.title && !column.content && (
            <div className="text-zinc-400 dark:text-zinc-500 text-sm">No Text Configured</div>
          )}
        </div>
      );
    case "EMPTY":
    default:
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full bg-transparent"
        />
      );
  }
}
