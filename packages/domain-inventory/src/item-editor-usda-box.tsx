"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";

interface UsdaBoxProps {
  usdaQuery: string;
  usdaLoading: boolean;
  fdcId: number | null;
  hasSearchHandler: boolean;
  onQueryChange: (val: string) => void;
  onSearch: () => void;
}

/** Molecule: USDA Database autofill box with search input and FDC link status. */
export function ItemEditorUsdaBox({
  usdaQuery,
  usdaLoading,
  fdcId,
  hasSearchHandler,
  onQueryChange,
  onSearch,
}: UsdaBoxProps) {
  return (
    <div className="p-4 bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl space-y-3">
      <h3 className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-2">
        <Search size={16} /> USDA Database Auto-Fill
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search USDA (e.g. 'All Purpose Flour')"
          className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          value={usdaQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), onSearch())
          }
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={usdaLoading || !hasSearchHandler}
          className="px-4 py-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 font-medium rounded-lg transition-colors flex items-center"
        >
          {usdaLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>
      {fdcId && (
        <p className="text-xs text-emerald-400">
          Linked to FDC ID: {fdcId}
        </p>
      )}
    </div>
  );
}
