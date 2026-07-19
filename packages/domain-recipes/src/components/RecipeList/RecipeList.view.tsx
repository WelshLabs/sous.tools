/* eslint-disable max-lines */
"use client";

import React from "react";
import { type Recipe, type RecipeCategory, type RecipeTag } from "@soustools/api-types";
import { Loader2, Play, Edit3, Trash2, Scale, Link as LinkIcon, Folder, Tag, Sparkles } from "lucide-react";
import Link from "next/link";
import { type RecipeListProps } from "./RecipeList.container";

// -----------------------------------------------------------------------------
// RecipeCard
// -----------------------------------------------------------------------------
export interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  return (
    <div
      className="p-5 rounded-2xl flex flex-col justify-between shadow-xl transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base font-bold line-clamp-1" style={{ color: "var(--color-foreground)" }}>
            {recipe.title}
          </h3>
          {recipe.status === "PENDING_REVIEW" && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "rgb(245 158 11 / 0.10)",
                color: "#f59e0b",
                border: "1px solid rgb(245 158 11 / 0.20)",
              }}
            >
              Pending
            </span>
          )}
        </div>

        <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
          Yield: {recipe.yieldCount} {recipe.yieldUnit}
        </p>

        {recipe.sourceBook && (
          <p className="text-[10px] mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Source: <span style={{ color: "var(--color-foreground)" }}>{recipe.sourceBook}</span>
            {recipe.sourcePageStart && ` (p. ${recipe.sourcePageStart})`}
          </p>
        )}

        {recipe.vessel && (
          <p className="text-[11px] mt-1 flex items-center gap-1 font-semibold" style={{ color: "var(--color-primary)" }}>
            <Scale className="w-3.5 h-3.5" /> Pan: {recipe.vessel.name}
          </p>
        )}

        {recipe.posItemId ? (
          <p className="text-[11px] mt-1 flex items-center gap-1 font-semibold" style={{ color: "var(--color-success, #10b981)" }}>
            <LinkIcon className="w-3.5 h-3.5" /> Linked POS Item
          </p>
        ) : (
          <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--color-muted-foreground)" }}>
            <LinkIcon className="w-3.5 h-3.5" /> Unlinked POS
          </p>
        )}

        <div className="text-xs mt-3 line-clamp-2" style={{ color: "var(--color-muted-foreground)" }}>
          {recipe.instructions.length} step{recipe.instructions.length !== 1 ? "s" : ""}:{" "}
          {recipe.instructions.map((step) => step.text).join(", ")}
        </div>
      </div>

      <div className="flex gap-2 mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Link href={`/recipes/${recipe.id}`} className="flex-1">
          <button
            className="w-full py-1.5 px-3 text-xs rounded-lg font-semibold cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-secondary-foreground)" }}
          >
            View &amp; Scale
          </button>
        </Link>
        <Link href={`/recipes/${recipe.id}/kitchen`}>
          <button
            className="py-1.5 px-3 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
            style={{ backgroundColor: "rgb(16 185 129 / 0.10)", color: "#10b981" }}
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run
          </button>
        </Link>
        <Link href={`/recipes/${recipe.id}/edit`}>
          <button
            className="p-2 rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-secondary-foreground)" }}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(recipe.id)}
          className="p-2 rounded-lg cursor-pointer transition-colors"
          style={{ backgroundColor: "rgb(244 63 94 / 0.10)", color: "var(--color-destructive)" }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// RecipeFilter
// -----------------------------------------------------------------------------
export interface RecipeFilterProps {
  categories: RecipeCategory[];
  tags: RecipeTag[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (id: string | null) => void;
  selectedStatus: string;
  onSelectStatus: (status: "ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const STATUS_LABELS = {
  APPROVED: "Approved",
  PENDING_REVIEW: "Pending Review",
  ARCHIVED: "Archived",
  ALL: "All Recipes",
};

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
  const labelStyle: React.CSSProperties = { color: "var(--color-muted-foreground)" };
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: "rgb(30 41 59 / 0.50)", border: "1px solid var(--color-border)" }}>
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1" style={labelStyle}>
            <Sparkles className="w-3 h-3 text-amber-500" /> Status Queue
          </label>
          <div className="flex gap-1.5 p-1 rounded-lg" style={{ backgroundColor: "var(--color-secondary)", border: "1px solid var(--color-border)" }}>
            {(["APPROVED", "PENDING_REVIEW", "ARCHIVED", "ALL"] as const).map((status) => (
              <button
                key={status}
                onClick={() => onSelectStatus(status)}
                className="px-3 py-1 text-xs rounded-md font-semibold cursor-pointer transition-colors"
                style={
                  selectedStatus === status
                    ? { backgroundColor: "var(--color-card)", color: "var(--color-foreground)", boxShadow: "0 1px 2px rgb(0 0 0 / 0.2)" }
                    : { color: "var(--color-muted-foreground)" }
                }
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1" style={labelStyle}>
              <Folder className="w-3 h-3" style={{ color: "var(--color-primary)" }} /> Category
            </label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => onSelectCategory(e.target.value ? e.target.value : null)}
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

        {tags.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1" style={labelStyle}>
              <Tag className="w-3 h-3 text-emerald-400" /> Tag
            </label>
            <select
              value={selectedTag || ""}
              onChange={(e) => onSelectTag(e.target.value ? e.target.value : null)}
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

        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1" style={labelStyle}>
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

// -----------------------------------------------------------------------------
// RecipeListView
// -----------------------------------------------------------------------------
export function RecipeListView({
  recipes,
  loading = false,
  onDelete,
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
  showFilter = false,
}: RecipeListProps) {
  return (
    <div className="space-y-6">
      {showFilter && categories && tags && onSelectCategory && onSelectTag && onSelectStatus && onSearchQueryChange && (
        <RecipeFilter
          categories={categories}
          tags={tags}
          selectedCategory={selectedCategory ?? null}
          onSelectCategory={onSelectCategory}
          selectedTag={selectedTag ?? null}
          onSelectTag={onSelectTag}
          selectedStatus={selectedStatus ?? "ALL"}
          onSelectStatus={onSelectStatus}
          searchQuery={searchQuery ?? ""}
          onSearchQueryChange={onSearchQueryChange}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          No recipes found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
