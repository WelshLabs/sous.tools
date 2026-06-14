"use client";

import React from "react";
import { ColumnConfig, PosItem } from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";

interface ColumnLayoutRendererProps {
  columns: ColumnConfig[];
  splitRatio?: string;
  items: PosItem[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
}

/** Parse a "60/40" splitRatio into flex-basis values for exactly 2 columns. */
function getSplitStyles(
  splitRatio: string | undefined,
  index: number,
  totalCols: number,
): React.CSSProperties {
  if (!splitRatio || totalCols !== 2) return { flex: 1 };
  const parts = splitRatio.split("/").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const pct = index === 0 ? parts[0] : parts[1];
    return { flex: `0 0 ${pct}%` };
  }
  return { flex: 1 };
}

export function ColumnLayoutRenderer({
  columns,
  splitRatio,
  items,
  soldOutBehavior,
}: ColumnLayoutRendererProps) {
  return (
    <div className="w-full h-full min-h-screen bg-[oklch(0.08_0.01_260)] flex flex-row p-8 gap-6">
      {columns.map((column, index) => {
        const style = getSplitStyles(splitRatio, index, columns.length);
        switch (column.type) {
          case "MENU": {
            let columnItems = items;
            if (column.itemIds && column.itemIds.length > 0) {
              columnItems = column.itemIds
                .map((id) => items.find((item) => item.id === id || item.squareId === id))
                .filter((item): item is PosItem => !!item);
            }
            columnItems = columnItems.filter(
              (item) => !(item.isSoldOut && soldOutBehavior === "HIDE")
            );
            return (
              <div
                key={index}
                style={style}
                className="rounded-2xl p-6 bg-white/5 border border-white/5 flex flex-col gap-4 overflow-y-auto max-h-[90vh]"
              >
                {columnItems.length > 0 ? (
                  columnItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      highlightItems={column.highlightItems}
                      soldOutBehavior={soldOutBehavior}
                    />
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
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
                className="rounded-2xl overflow-hidden relative bg-black flex items-center justify-center border border-white/5"
              >
                {column.imageUrl ? (
                  <img
                    src={column.imageUrl}
                    alt="Column Media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-zinc-500 text-sm">No Image Selected</div>
                )}
              </div>
            );
          case "VIDEO":
            return (
              <div
                key={index}
                style={style}
                className="rounded-2xl overflow-hidden relative bg-black border border-white/5"
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
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
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
                className="rounded-2xl overflow-hidden relative bg-black border border-white/5"
              >
                {column.iframeUrl ? (
                  <iframe
                    src={column.iframeUrl}
                    title="Embedded Content"
                    className="w-full h-full border-none"
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
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
                className="rounded-2xl p-8 bg-white/5 border border-white/5 flex flex-col justify-center items-center text-center"
              >
                {column.title && (
                  <h2
                    className="text-3xl font-extrabold tracking-tight mb-4 text-white"
                    style={{ fontFamily: "var(--marketing-text-font)" }}
                  >
                    {column.title}
                  </h2>
                )}
                {column.content && (
                  <p
                    className="text-lg text-zinc-300 whitespace-pre-line"
                    style={{ fontFamily: "var(--marketing-text-font)" }}
                  >
                    {column.content}
                  </p>
                )}
                {!column.title && !column.content && (
                  <div className="text-zinc-500 text-sm">No Text Configured</div>
                )}
              </div>
            );
          case "EMPTY":
          default:
            return (
              <div
                key={index}
                style={style}
                className="rounded-2xl border border-dashed border-white/10 bg-white/2"
              />
            );
        }
      })}
    </div>
  );
}
