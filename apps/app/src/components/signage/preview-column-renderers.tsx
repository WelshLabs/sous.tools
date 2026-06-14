"use client";

import React from "react";
import { ColumnConfig, PosItem, TypographyConfig } from "@soustools/api-types";
import { Image as ImageIcon } from "lucide-react";

interface ColumnPreviewProps {
  column: ColumnConfig;
  items: PosItem[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
  typography?: TypographyConfig;
}

export const ColumnMenuPreview: React.FC<ColumnPreviewProps> = ({
  column,
  items,
  soldOutBehavior,
  typography,
}) => {
  const activeItems = (column.itemIds || [])
    .map((id) => items.find((item) => item.id === id || item.squareId === id))
    .filter((item): item is PosItem => !!item)
    .filter((item) => !(item.isSoldOut && soldOutBehavior === "HIDE"));

  if (activeItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-[9px] italic">
        No menu items selected
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 flex flex-col justify-start gap-1 overflow-y-auto max-h-[140px] pr-1">
      {activeItems.map((item) => {
        const isHighlighted = column.highlightItems?.some((h) => {
          if (!h) return false;
          if (typeof h === "string") {
            return h === item.id || h === item.squareId;
          }
          return h.itemId === item.id || h.itemId === item.squareId;
        });

        const isSoldOut = item.isSoldOut;
        let classes = "p-1.5 rounded text-[8px] transition-all flex flex-col justify-between shrink-0 ";
        if (isHighlighted) {
          classes += "bg-white/10 border border-primary/40 shadow-sm ";
        } else {
          classes += "bg-white/5 border border-white/5 ";
        }

        if (isSoldOut) {
          if (soldOutBehavior === "STRIKE") classes += "line-through opacity-45 ";
          else if (soldOutBehavior === "GRAY_OUT") classes += "grayscale opacity-50 ";
        }

        return (
          <div key={item.id} className={classes}>
            <div className="flex justify-between items-start gap-1">
              <h5
                className="font-bold text-white truncate max-w-[70%] text-[8px]"
                style={typography?.menuItemTitle ? { fontFamily: typography.menuItemTitle } : undefined}
              >
                {item.name}
              </h5>
              <span
                className="text-emerald-400 font-semibold text-[8px]"
                style={typography?.menuItemPrice ? { fontFamily: typography.menuItemPrice } : undefined}
              >
                ${Number(item.price).toFixed(2)}
              </span>
            </div>
            {item.description && (
              <p
                className="text-[6px] text-slate-400 line-clamp-1 mt-0.5"
                style={typography?.menuItemDescription ? { fontFamily: typography.menuItemDescription } : undefined}
              >
                {item.description}
              </p>
            )}
            {isSoldOut && soldOutBehavior === "LABEL" && (
              <span className="text-[6px] text-red-500 font-bold uppercase mt-0.5">Sold Out</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ColumnImagePreview: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => (
  <div className="w-full h-full relative flex items-center justify-center bg-slate-900 rounded overflow-hidden">
    {imageUrl ? (
      <img src={imageUrl} alt="Promo" className="w-full h-full object-cover" />
    ) : (
      <div className="text-[10px] text-slate-500 flex flex-col items-center gap-1">
        <ImageIcon className="w-5 h-5 text-slate-600 animate-pulse" />
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
    className="w-full h-full p-3 bg-white/5 border border-white/10 rounded flex flex-col justify-center text-center space-y-1 overflow-hidden"
    style={marketingText ? { fontFamily: marketingText } : undefined}
  >
    {title ? (
      <h4 className="text-xs font-bold text-white leading-tight">{title}</h4>
    ) : (
      <h4 className="text-xs font-bold text-slate-500 italic">No Title</h4>
    )}
    {content ? (
      <p className="text-[9px] text-slate-300 leading-normal line-clamp-4">{content}</p>
    ) : (
      <p className="text-[8px] text-slate-500 italic">No content text entered</p>
    )}
  </div>
);
