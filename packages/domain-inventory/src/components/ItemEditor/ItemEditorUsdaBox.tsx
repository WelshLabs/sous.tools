"use client";

import { Search, Loader2 } from "lucide-react";

interface UsdaBoxProps {
  usdaQuery: string;
  usdaLoading: boolean;
  fdcId: number | null;
  hasSearchHandler: boolean;
  onQueryChange: (val: string) => void;
  onSearch: () => void;
}

export function ItemEditorUsdaBox({
  usdaQuery,
  usdaLoading,
  fdcId,
  hasSearchHandler,
  onQueryChange,
  onSearch,
}: UsdaBoxProps) {
  return (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400">
        <Search size={16} /> USDA Database Auto-Fill
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search USDA (e.g. 'All Purpose Flour')"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
          className="flex items-center rounded-lg bg-sky-500/20 px-4 py-2 font-medium text-sky-300 transition-colors hover:bg-sky-500/30"
        >
          {usdaLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>
      {fdcId && (
        <p className="text-xs text-emerald-400">Linked to FDC ID: {fdcId}</p>
      )}
    </div>
  );
}
