"use client";

import React, { useMemo } from "react";
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
      (cat): cat is string => typeof cat === "string" && cat.trim().length > 0
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
          icon={<Search className="h-5 w-5 text-muted-foreground" />}
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
              className="group text-left transition-transform duration-100 hover:scale-[1.01] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <Card className="relative flex h-full flex-col overflow-hidden border border-border bg-card p-4 transition-colors group-hover:border-primary/50">
                {item.image && (
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col gap-1 p-0">
                  <CardTitle className="line-clamp-2 text-base font-semibold text-foreground">
                    {item.name}
                  </CardTitle>
                  {item.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-accent">
                      ${item.price.toFixed(2)}
                    </span>
                    {isSoldOut ? (
                      <span className="rounded-[var(--radius-sm)] border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        Sold Out
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
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
