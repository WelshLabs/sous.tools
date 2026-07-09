"use client";
import React from "react";
import { useState } from "react";
import { type PosItem, type HighlightItemConfig } from "@soustools/api-types";
import { Star, Check, Search, ChevronDown, ChevronUp } from "lucide-react";

interface MenuItemSelectorProps {
  items: PosItem[];
  selectedItemIds: string[];
  highlightItems: (string | HighlightItemConfig)[];
  onChange: (
    itemIds: string[],
    highlightItems: (string | HighlightItemConfig)[]
  ) => void;
}

export const MenuItemSelector: React.FC<MenuItemSelectorProps> = ({
  items,
  selectedItemIds,
  highlightItems,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleToggleSelect = (itemId: string) => {
    let newIds: string[];
    if (selectedItemIds.includes(itemId)) {
      newIds = selectedItemIds.filter((id) => id !== itemId);
    } else {
      newIds = [...selectedItemIds, itemId];
    }
    // Also remove from highlights if item is deselected
    const newHighlights = highlightItems.filter((h) => {
      const hId = typeof h === "string" ? h : h.itemId;
      return hId !== itemId;
    });
    onChange(newIds, newHighlights);
  };

  const handleToggleHighlight = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItemIds.includes(itemId)) return;

    const isHighlighted = highlightItems.some((h) => {
      const hId = typeof h === "string" ? h : h.itemId;
      return hId === itemId;
    });

    let newHighlights: (string | HighlightItemConfig)[];
    if (isHighlighted) {
      newHighlights = highlightItems.filter((h) => {
        const hId = typeof h === "string" ? h : h.itemId;
        return hId !== itemId;
      });
    } else {
      newHighlights = [...highlightItems, itemId];
    }
    onChange(selectedItemIds, newHighlights);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded px-2.5 py-1.5 text-xs text-zinc-200 cursor-pointer"
      >
        <span>
          {selectedItemIds.length === 0
            ? "No items selected"
            : `${selectedItemIds.length} item${selectedItemIds.length > 1 ? "s" : ""} selected`}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-30 bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] rounded-lg shadow-xl p-2 max-h-60 overflow-y-auto space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded pl-8 pr-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-primary placeholder-zinc-500"
            />
          </div>

          <div className="space-y-1">
            {filteredItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              const isHighlighted = highlightItems.some((h) => {
                const hId = typeof h === "string" ? h : h.itemId;
                return hId === item.id;
              });

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleSelect(item.id)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary/10 text-white"
                      : "hover:bg-zinc-900/50 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-zinc-600"
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">${Number(item.price).toFixed(2)}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleHighlight(item.id, e)}
                      className={`p-1 rounded hover:bg-zinc-800/50 transition-colors shrink-0 ${
                        isHighlighted ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isHighlighted ? "fill-current" : ""}`} />
                    </button>
                  )}
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center text-[10px] text-zinc-500 p-2 font-mono">No items found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
