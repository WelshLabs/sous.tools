"use client";

import React, { useState, useRef, useEffect } from "react";
import { PosItem } from "@soustools/api-types";
import { Search, X } from "lucide-react";

interface PosItemPickerProps {
  items: PosItem[];
  value: string | undefined;
  onChange: (itemId: string) => void;
  placeholder?: string;
}

export function PosItemPicker({
  items,
  value,
  onChange,
  placeholder = "Search items...",
}: PosItemPickerProps) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="max-h-48 overflow-y-auto border border-black/5 dark:border-white/5 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-1 space-y-0.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-xs text-zinc-400 dark:text-zinc-500 italic p-2 text-center">
            No items found.
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex justify-between items-center ${
                value === item.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5 border border-transparent"
              }`}
            >
              <span className="truncate">{item.name}</span>
              <span className="shrink-0 ml-2 font-mono opacity-60">
                ${Number(item.price).toFixed(2)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

interface PosItemMultiPickerProps {
  items: PosItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  renderExtra?: (item: PosItem, isSelected: boolean) => React.ReactNode;
}

export function PosItemMultiPicker({
  items,
  selectedIds,
  onChange,
  placeholder = "Search upgrades...",
  renderExtra,
}: PosItemMultiPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItems = items.filter((i) => selectedIds.includes(i.id));
  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedIds.includes(i.id),
  );

  return (
    <div className="flex flex-col gap-2 w-full" ref={containerRef}>
      {/* Selected Items Pills */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 w-full bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-cyan-400 truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-cyan-500/70 font-mono">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(selectedIds.filter((id) => id !== item.id));
                  }}
                  className="p-1 hover:bg-cyan-500/20 rounded text-cyan-500 hover:text-cyan-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {renderExtra && renderExtra(item, true)}
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-3 py-1.5 bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 transition-colors"
        />

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 top-full mt-1.5 w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="text-xs text-zinc-400 dark:text-zinc-500 italic p-3 text-center bg-zinc-950/50">
                No available items found.
              </div>
            ) : (
              <div className="flex flex-col p-1">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange([...selectedIds, item.id]);
                      setSearch("");
                    }}
                    className="flex items-center justify-between w-full text-left px-2 py-2 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5 hover:text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    <span className="truncate pr-4">{item.name}</span>
                    <span className="shrink-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
