"use client";

import { useMemo } from "react";
import {
  Input,
  Chip,
  Card,
  CardContent,
  CardTitle,
} from "@soustools/design-system";
import { Search } from "lucide-react";
import { type CatalogItem } from "../pos.types";

export interface POSCatalogProps {
  items: CatalogItem[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCategorySelect: (category: string) => void;
  onItemClick: (item: CatalogItem) => void;
}

export function POSCatalog({
  items,
  categories,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onCategorySelect,
  onItemClick,
}: POSCatalogProps) {
  // Deduplicate and filter out empty or non-string categories
  const sanitizedCategories = useMemo(() => {
    const validCats = (categories || []).filter(
      (cat): cat is string => typeof cat === "string" && cat.trim().length > 0,
    );
    return Array.from(new Set(validCats));
  }, [categories]);

  // Deduplicate items based on id/name and filter out corrupt items
  const sanitizedItems = useMemo(() => {
    const seenIds = new Set<string>();
    const validItems: CatalogItem[] = [];

    (items || []).forEach((item) => {
      if (!item || (!item.id && !item.name)) return;
      const dedupeKey = item.id ? String(item.id) : item.name;
      if (!seenIds.has(dedupeKey)) {
        seenIds.add(dedupeKey);
        validItems.push(item);
      }
    });

    return validItems;
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="w-full">
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="text-muted-foreground h-5 w-5" />}
        />
      </div>

      {/* Category Pills Slider/Container */}
      <div className="flex flex-wrap gap-2">
        <Chip
          selected={selectedCategory === ""}
          onClick={() => onCategorySelect("")}
        >
          All Items
        </Chip>
        {sanitizedCategories.map((category, index) => (
          <Chip
            key={`${category}-${index}`}
            selected={selectedCategory === category}
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </Chip>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sanitizedItems.map((item, index) => {
          const isSoldOut = item.isSoldOut ?? false;
          const compositeKey = `${item.id || item.name || "item"}-${index}`;
          return (
            <button
              key={compositeKey}
              disabled={isSoldOut}
              onClick={() => onItemClick(item)}
              className="group animate-in fade-in zoom-in-95 text-left transition-transform duration-100 hover:scale-[1.01] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <Card className="border-border bg-card group-hover:border-primary/50 relative flex h-full flex-col overflow-hidden border p-4 transition-colors">
                {item.image && (
                  <div className="bg-muted relative mb-3 aspect-video w-full overflow-hidden rounded-[var(--radius-sm)]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col gap-1 p-0">
                  <CardTitle className="text-foreground line-clamp-2 text-base font-semibold">
                    {item.name}
                  </CardTitle>
                  {item.description && (
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-accent text-sm font-bold">
                      ${item.price.toFixed(2)}
                    </span>
                    {isSoldOut ? (
                      <span className="border-destructive/30 bg-destructive/10 text-destructive rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium">
                        Sold Out
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {item.category}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
POSCatalog.displayName = "POSCatalog";
