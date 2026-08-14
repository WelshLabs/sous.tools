"use client";

import { Plus } from "lucide-react";

interface ItemSelectionDropdownProps {
  search: string;
  setSearch: (search: string) => void;
  suggestions:
    | Array<{
        itemId: string;
        name: string;
        similarity: number;
        matchColor: string;
      }>
    | undefined;
  filteredItems: Array<{ id: string; name: string }>;
  onSelectItem: (id: string, confidence: number) => void;
  onCreateItem: (name: string) => void;
  currentItemId: string | null;
}

export function ItemSelectionDropdown({
  search,
  setSearch,
  suggestions,
  filteredItems,
  onSelectItem,
  onCreateItem,
  currentItemId,
}: ItemSelectionDropdownProps) {
  const getB = (c: string) =>
    c === "green"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : c === "yellow"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-orange-500/10 text-orange-400 border-orange-500/20";

  return (
    <div className="absolute z-[100] mt-1 flex max-h-60 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-slate-100 bg-slate-50 p-1.5 dark:border-zinc-900 dark:bg-zinc-900/50">
        <input
          type="text"
          placeholder="Search master items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          autoFocus
        />
      </div>
      <div className="flex-1 overflow-y-auto py-1 text-xs">
        {suggestions && suggestions.length > 0 && !search && (
          <div className="animate-fadeIn mb-1 border-b border-slate-100 pb-1 dark:border-zinc-900">
            {suggestions.map((sug) => (
              <div
                key={sug.itemId}
                onClick={() => onSelectItem(sug.itemId, sug.similarity)}
                className="flex cursor-pointer items-center justify-between px-3 py-1.5 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600"
              >
                <span className="mr-2 truncate font-medium">{sug.name}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold ${getB(sug.matchColor)}`}
                >
                  {Math.round(sug.similarity * 100)}% Match
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="px-3 py-1 font-mono text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
          All Items
        </div>
        {filteredItems.length > 0 ? (
          filteredItems.map((opt) => (
            <div
              key={opt.id}
              onClick={() => onSelectItem(opt.id, 1.0)}
              className={`flex cursor-pointer items-center justify-between px-3 py-1.5 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 ${opt.id === currentItemId ? "bg-slate-100 font-semibold text-emerald-500 dark:bg-zinc-800" : ""}`}
            >
              <span className="truncate">{opt.name}</span>
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-zinc-500 italic">
            No master items found
          </div>
        )}

        {search.trim() !== "" &&
          !filteredItems.some(
            (o) => o.name.toLowerCase() === search.trim().toLowerCase(),
          ) && (
            <div
              onClick={() => onCreateItem(search.trim())}
              className="flex cursor-pointer items-center gap-1.5 border-t border-slate-100 px-3 py-2 font-semibold text-sky-600 hover:bg-sky-500 hover:text-white dark:border-zinc-900 dark:text-sky-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create "{search.trim()}"</span>
            </div>
          )}
      </div>
    </div>
  );
}
