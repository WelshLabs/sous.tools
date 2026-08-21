/* eslint-disable max-lines */
"use client";

import { useMemo } from "react";
import {
  Input,
  Card,
  CardContent,
  CardTitle,
  Button,
} from "@soustools/design-system";
import {
  Search,
  ArrowLeft,
  PlusCircle,
  MoreVertical,
  Layers,
} from "lucide-react";
import { type CatalogItem, type CategoryItem } from "../pos.types";
import { getCategoryFallbackImage } from "../pos.helpers";

export interface POSCatalogProps {
  items: CatalogItem[];
  categories: string[];
  categoryItems?: CategoryItem[];
  selectedCategory: string;
  searchQuery: string;
  layoutGrid?: "compact" | "standard" | "large";
  onSearchChange: (value: string) => void;
  onCategorySelect: (category: string) => void;
  onItemClick: (item: CatalogItem) => void;
  onOpenCustomAmount?: () => void;
  onItemAction?: (item: CatalogItem) => void;
}

export function POSCatalog({
  items,
  categories: _categories,
  categoryItems = [],
  selectedCategory,
  searchQuery,
  layoutGrid = "standard",
  onSearchChange,
  onCategorySelect,
  onItemClick,
  onOpenCustomAmount,
  onItemAction,
}: POSCatalogProps) {
  // Filter active and unique items
  const sanitizedItems = useMemo(() => {
    const seen = new Set<string>();
    return (items || []).filter((item) => {
      if (!item || !item.name) return false;
      const key = item.id ? String(item.id) : item.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  // Derive categories list with counts & images
  const displayCategoryItems = useMemo(() => {
    if (categoryItems && categoryItems.length > 0) return categoryItems;
    const map = new Map<string, number>();
    sanitizedItems.forEach((it) => {
      const cat = it.category || "Other";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      image: getCategoryFallbackImage(name),
      itemCount: count,
      isActive: true,
    }));
  }, [categoryItems, sanitizedItems]);

  const isBrowsingRootCategories =
    selectedCategory === "" && searchQuery === "";

  const gridClass = {
    compact: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3",
    standard: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5",
  }[layoutGrid];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Search & Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search all items (e.g. Burger, IPA, Fries)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="text-muted-foreground h-4 w-4" />}
          />
        </div>

        {onOpenCustomAmount && (
          <Button
            variant="outline"
            onClick={onOpenCustomAmount}
            className="border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary flex shrink-0 items-center gap-1.5 font-bold"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Custom Amount</span>
          </Button>
        )}
      </div>

      {/* VIEW 1: SQUARE-STYLE CATEGORY GRID (When root category is chosen) */}
      {isBrowsingRootCategories ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-sm font-bold tracking-wider uppercase opacity-70">
              Categories
            </h2>
            <span className="text-muted-foreground text-xs font-semibold">
              {displayCategoryItems.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {displayCategoryItems.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category.name)}
                className="group relative flex aspect-[4/3] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-5 text-left shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/50 hover:shadow-[0_0_24px_rgba(76,201,240,0.25)] active:scale-95"
              >
                {/* Background Image with Dark Tint Gradient */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${
                      category.image || getCategoryFallbackImage(category.name)
                    })`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <span className="text-lg font-black tracking-tight text-white drop-shadow-md sm:text-xl">
                    {category.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-white/20 bg-black/40 px-2 py-0.5 text-[11px] font-bold text-sky-400 backdrop-blur-sm">
                      {category.itemCount || 0} items
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: ITEMS GRID (When category is selected or user is searching) */
        <div className="space-y-4">
          {/* Subheader with Back Button and Current Category */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCategorySelect("");
                  onSearchChange("");
                }}
                className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Categories
              </Button>
              <span className="text-foreground text-sm font-black">
                {searchQuery !== ""
                  ? `Search: "${searchQuery}"`
                  : selectedCategory}
              </span>
            </div>

            <span className="text-muted-foreground text-xs font-semibold">
              {sanitizedItems.length} items found
            </span>
          </div>

          {sanitizedItems.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <p className="text-foreground text-base font-bold">
                No menu items found
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Try searching for another term or return to all categories.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  onCategorySelect("");
                  onSearchChange("");
                }}
              >
                View All Categories
              </Button>
            </div>
          ) : (
            <div className={`grid ${gridClass}`}>
              {sanitizedItems.map((item, index) => {
                const isSoldOut = Boolean(item.isSoldOut);
                const hasModifiers =
                  item.modifierGroupIds && item.modifierGroupIds.length > 0;
                const compositeKey = `${item.id || item.name}-${index}`;

                return (
                  <div
                    key={compositeKey}
                    className="group relative flex flex-col"
                  >
                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => onItemClick(item)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (onItemAction) onItemAction(item);
                      }}
                      className="h-full w-full cursor-pointer text-left transition-transform duration-150 hover:scale-[1.01] active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <Card className="border-border bg-card group-hover:border-primary/50 relative flex h-full flex-col overflow-hidden border p-3.5 shadow-md transition-all">
                        {item.image && (
                          <div className="bg-muted relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {hasModifiers && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-sky-400 backdrop-blur-md">
                                <Layers className="h-3 w-3" />
                                <span>Options</span>
                              </div>
                            )}
                          </div>
                        )}

                        <CardContent className="flex flex-1 flex-col justify-between gap-2 p-0">
                          <div>
                            <CardTitle className="text-foreground line-clamp-2 text-sm font-bold">
                              {item.name}
                            </CardTitle>
                            {item.description && (
                              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between pt-1">
                            <span className="text-accent text-sm font-black">
                              ${item.price.toFixed(2)}
                            </span>
                            {isSoldOut ? (
                              <span className="border-destructive/30 bg-destructive/10 text-destructive rounded px-2 py-0.5 text-[10px] font-extrabold uppercase">
                                Sold Out
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[11px] font-medium">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </button>

                    {/* 3-Dots Quick Action Button (Out of Stock / Edit) */}
                    {onItemAction && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item);
                        }}
                        title="Item options"
                        className="text-muted-foreground hover:text-foreground absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-white/20"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
POSCatalog.displayName = "POSCatalog";
