"use client";

import React from "react";
import { RecipeCategory, RecipeTag } from "@soustools/api-types";
import { Folder, Tag, Sparkles } from "lucide-react";

interface RecipeFilterProps {
  categories: RecipeCategory[];
  tags: RecipeTag[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (id: string | null) => void;
  selectedStatus: string;
  onSelectStatus: (status: "ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED") => void;
}

/**
 * RecipeFilter provides filtering UI for recipe list, supporting
 * categories, tags, and workflow status (Verification Queue).
 * @tenant-docs-export
 */
export const RecipeFilter: React.FC<RecipeFilterProps> = ({
  categories,
  tags,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Status Queue
          </label>
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
            {(["APPROVED", "PENDING_REVIEW", "ARCHIVED", "ALL"] as const).map((status) => (
              <button
                key={status}
                onClick={() => onSelectStatus(status)}
                className={`px-3 py-1 text-xs rounded-md font-semibold cursor-pointer transition-colors ${
                  selectedStatus === status
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status === "PENDING_REVIEW" ? "Verification Queue" : status === "ALL" ? "All Recipes" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Folder className="w-3 h-3 text-sky-400" /> Category
            </label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => onSelectCategory(e.target.value ? e.target.value : null)}
              className="text-xs bg-slate-950 text-slate-300 border border-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-slate-700 min-w-[140px] cursor-pointer"
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
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-400" /> Tag
            </label>
            <select
              value={selectedTag || ""}
              onChange={(e) => onSelectTag(e.target.value ? e.target.value : null)}
              className="text-xs bg-slate-950 text-slate-300 border border-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-slate-700 min-w-[140px] cursor-pointer"
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
      </div>
    </div>
  );
};
