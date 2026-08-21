/* eslint-disable max-lines */
"use client";
import { useState } from "react";
import { type PosItem, type HighlightItemConfig } from "@soustools/api-types";
import {
  Star,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface MenuItemSelectorProps {
  items: PosItem[];
  selectedItemIds: string[];
  highlightItems: (string | HighlightItemConfig)[];
  onChange: (
    itemIds: string[],
    highlightItems: (string | HighlightItemConfig)[],
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

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIds = [...selectedItemIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;
    const temp = newIds[index];
    newIds[index] = newIds[targetIndex];
    newIds[targetIndex] = temp;
    onChange(newIds, highlightItems);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedItemsList = selectedItemIds
    .map((id) => items.find((i) => i.id === id || i.externalId === id))
    .filter((i): i is PosItem => Boolean(i));

  return (
    <div className="relative w-full space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-background border-border text-foreground flex w-full cursor-pointer items-center justify-between rounded border px-2.5 py-1.5 text-xs hover:border-zinc-500"
      >
        <span>
          {selectedItemIds.length === 0
            ? "No items selected"
            : `${selectedItemIds.length} item${selectedItemIds.length > 1 ? "s" : ""} selected`}
        </span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Selected Items Reorder Strip */}
      {selectedItemsList.length > 0 && !isOpen && (
        <div className="border-border bg-card/30 space-y-1 rounded border p-1.5">
          <div className="text-muted-foreground px-1 text-[9px] font-bold tracking-wider uppercase">
            Order ({selectedItemsList.length})
          </div>
          {selectedItemsList.map((item, idx) => (
            <div
              key={item.id}
              className="bg-background/50 flex items-center justify-between gap-1 rounded px-2 py-1 text-xs"
            >
              <span className="flex-1 truncate font-medium">
                {idx + 1}. {item.name}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="text-muted-foreground p-0.5 hover:text-cyan-400 disabled:opacity-20"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === selectedItemsList.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="text-muted-foreground p-0.5 hover:text-cyan-400 disabled:opacity-20"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 left-0 z-30 mt-1 max-h-60 space-y-2 overflow-y-auto rounded-lg border border-[oklch(0.26_0.03_180)] bg-[oklch(0.16_0.02_180)] p-2 shadow-xl">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border-border text-foreground focus:border-primary w-full rounded border py-1.5 pr-2 pl-8 text-xs placeholder-zinc-500 focus:outline-none"
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
                  className={`flex cursor-pointer items-center justify-between rounded p-2 transition-all ${
                    isSelected
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-card/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-zinc-600"
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="truncate text-xs font-semibold">
                        {item.name}
                      </div>
                      <div className="text-muted-foreground font-mono text-[10px]">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleHighlight(item.id, e)}
                      className={`hover:bg-secondary/50 shrink-0 rounded p-1 transition-colors ${
                        isHighlighted
                          ? "text-amber-400"
                          : "text-muted-foreground hover:text-muted-foreground"
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${isHighlighted ? "fill-current" : ""}`}
                      />
                    </button>
                  )}
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-muted-foreground p-2 text-center font-mono text-[10px]">
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
