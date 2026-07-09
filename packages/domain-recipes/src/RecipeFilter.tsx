"use client";

import React from "react";
import { type RecipeCategory, type RecipeTag } from "@soustools/api-types";
import { Folder, Tag, Sparkles } from "lucide-react";

/**
 * Props for the RecipeFilter component.
 */
export interface RecipeFilterProps {
  categories: RecipeCategory[];
  tags: RecipeTag[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (id: string | null) => void;
  selectedStatus: string;
  onSelectStatus: (
    status: "ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED"
  ) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const STATUS_LABELS = {
  APPROVED: "Approved",
  PENDING_REVIEW: "Pending Review",
  ARCHIVED: "Archived",
  ALL: "All Recipes",
};

/**
 * RecipeFilter — provides filtering UI for recipe list, supporting
 * categories, tags, and workflow status (Pending Review).
 *
 * Uses the Neon-Glass `--color-card` surface and `--color-input` inputs.
 *
 * **Presentation boundary**: No data fetching. Receives filter options
 * and selection state via props.
 *
 * @tenant-docs-export
 * # RecipeFilter
 * ```tsx
 * import { RecipeFilter } from "@soustools/domain-recipes";
 *
 * <RecipeFilter
 *   categories={categories}
 *   tags={tags}
 *   selectedCategory={selectedCategory}
 *   onSelectCategory={setSelectedCategory}
 *   // ...
 * />
 * ```
 */
export function RecipeFilter({
  categories,
  tags,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchQueryChange,
}: RecipeFilterProps) {
  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <div
      className="p-4 rounded-xl space-y-4"
      style={{
        backgroundColor: "rgb(30 41 59 / 0.50)", // glass-panel
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Status Filter */}
        <div className="space-y-1">
          <label
            className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
            style={labelStyle}
          >
            <Sparkles className="w-3 h-3 text-amber-500" /> Status Queue
          </label>
          <div
            className="flex gap-1.5 p-1 rounded-lg"
            style={{
              backgroundColor: "var(--color-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {(["APPROVED", "PENDING_REVIEW", "ARCHIVED", "ALL"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => onSelectStatus(status)}
                  className="px-3 py-1 text-xs rounded-md font-semibold cursor-pointer transition-colors"
                  style={
                    selectedStatus === status
                      ? {
                          backgroundColor: "var(--color-card)",
                          color: "var(--color-foreground)",
                          boxShadow: "0 1px 2px rgb(0 0 0 / 0.2)",
                        }
                      : { color: "var(--color-muted-foreground)" }
                  }
                >
                  {STATUS_LABELS[status]}
                </button>
              )
            )}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-1">
            <label
              className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
              style={labelStyle}
            >
              <Folder className="w-3 h-3" style={{ color: "var(--color-primary)" }} /> Category
            </label>
            <select
              value={selectedCategory || ""}
              onChange={(e) =>
                onSelectCategory(e.target.value ? e.target.value : null)
              }
              className="text-xs border rounded-lg p-1.5 focus:outline-none min-w-[140px] cursor-pointer"
              style={inputStyle}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="space-y-1">
            <label
              className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
              style={labelStyle}
            >
              <Tag className="w-3 h-3 text-emerald-400" /> Tag
            </label>
            <select
              value={selectedTag || ""}
              onChange={(e) =>
                onSelectTag(e.target.value ? e.target.value : null)
              }
              className="text-xs border rounded-lg p-1.5 focus:outline-none min-w-[140px] cursor-pointer"
              style={inputStyle}
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Filter */}
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label
            className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
            style={labelStyle}
          >
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search recipes..."
            className="w-full text-xs border rounded-lg p-1.5 focus:outline-none"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
