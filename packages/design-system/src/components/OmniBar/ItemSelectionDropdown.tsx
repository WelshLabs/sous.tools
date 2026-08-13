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
    <div className="absolute z-[100] mt-1 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-60">
      <div className="p-1.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-900/50">
        <input
          type="text"
          placeholder="Search master items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none text-slate-900 dark:text-white"
          autoFocus
        />
      </div>
      <div className="overflow-y-auto flex-1 py-1 text-xs">
        {suggestions && suggestions.length > 0 && !search && (
          <div className="border-b border-slate-100 dark:border-zinc-900 pb-1 mb-1 animate-fadeIn">
            {suggestions.map((sug) => (
              <div
                key={sug.itemId}
                onClick={() => onSelectItem(sug.itemId, sug.similarity)}
                className="px-3 py-1.5 cursor-pointer hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 flex items-center justify-between"
              >
                <span className="truncate mr-2 font-medium">{sug.name}</span>
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${getB(sug.matchColor)}`}
                >
                  {Math.round(sug.similarity * 100)}% Match
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="px-3 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
          All Items
        </div>
        {filteredItems.length > 0 ? (
          filteredItems.map((opt) => (
            <div
              key={opt.id}
              onClick={() => onSelectItem(opt.id, 1.0)}
              className={`px-3 py-1.5 cursor-pointer hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 flex items-center justify-between ${opt.id === currentItemId ? "bg-slate-100 dark:bg-zinc-800 text-emerald-500 font-semibold" : ""}`}
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
              className="px-3 py-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white font-semibold cursor-pointer border-t border-slate-100 dark:border-zinc-900 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create "{search.trim()}"</span>
            </div>
          )}
      </div>
    </div>
  );
}
