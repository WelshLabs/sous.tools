"use client";

import React from "react";
import { ColumnConfig, PosItem } from "@soustools/api-types";
import { Image as ImageIcon, Sparkles } from "lucide-react";

interface ColumnContentViewProps {
  column: ColumnConfig;
  items: PosItem[];
}

export const ColumnContentView: React.FC<ColumnContentViewProps> = ({ column, items }) => {
  const selectedItems = (column.itemIds || [])
    .map(id => items.find(item => item.id === id || item.squareId === id))
    .filter((item): item is PosItem => !!item);

  return (
    <>
      {column.type === "MENU" && (
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto w-full">
          {selectedItems.length === 0 ? (
            <span className="text-[10px] text-slate-500 italic block text-center">No items selected</span>
          ) : (
            selectedItems.map(item => {
              const isStarred = column.highlightItems?.some(h => 
                typeof h === "string" ? h === item.id : h.itemId === item.id
              );
              return (
                <div
                  key={item.id}
                  className={`p-1.5 rounded flex items-center justify-between text-[10px] ${
                    isStarred ? "bg-primary/20 border border-primary/40" : "bg-white/5"
                  }`}
                >
                  <span className="font-semibold text-white truncate max-w-[70%]">{item.name}</span>
                  <div className="flex items-center gap-1">
                    {isStarred && <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                    <span className="text-slate-400 font-mono">${Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {column.type === "IMAGE" && (
        <div className="w-full h-full min-h-[120px] flex items-center justify-center bg-black/20 rounded overflow-hidden relative">
          {column.imageUrl ? (
            <img
              src={column.imageUrl}
              alt="Column visual"
              className={`w-full h-full object-${column.fit || "cover"}`}
            />
          ) : (
            <div className="flex flex-col items-center text-slate-600 text-[10px]">
              <ImageIcon className="w-6 h-6 mb-1" />
              <span>No Image URL</span>
            </div>
          )}
        </div>
      )}

      {column.type === "TEXT" && (
        <div className="text-center space-y-1">
          <h4 className="text-xs font-bold text-white font-brand">{column.title || "Untitled"}</h4>
          <p className="text-[10px] text-slate-400 leading-normal">{column.content || "Empty content"}</p>
        </div>
      )}
    </>
  );
};
