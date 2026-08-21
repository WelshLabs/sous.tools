/* eslint-disable max-lines */
"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { type PosItem } from "@soustools/api-types";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";

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
    <div className="flex w-full flex-col gap-2">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border-border text-foreground w-full rounded-lg border py-1.5 pr-3 pl-9 text-xs focus:border-cyan-500 focus:outline-none"
        />
      </div>
      <div className="border-border bg-background custom-scrollbar max-h-48 space-y-0.5 overflow-y-auto rounded-lg border p-1">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground p-2 text-center text-xs italic">
            No items found.
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors ${
                value === item.id
                  ? "border border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                  : "text-muted-foreground hover:bg-muted/50 border border-transparent"
              }`}
            >
              <span className="truncate">{item.name}</span>
              <span className="ml-2 shrink-0 font-mono opacity-60">
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
  placeholder = "Search items...",
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

  // Preserve explicit selectedIds order
  const selectedItems = selectedIds
    .map((id) => items.find((i) => i.id === id || i.externalId === id))
    .filter((i): i is PosItem => Boolean(i));

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedIds.includes(i.id) &&
      (!i.externalId || !selectedIds.includes(i.externalId)),
  );

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIds = [...selectedIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;
    const temp = newIds[index];
    newIds[index] = newIds[targetIndex];
    newIds[targetIndex] = temp;
    onChange(newIds);
  };

  return (
    <div className="flex w-full flex-col gap-2" ref={containerRef}>
      {/* Selected Items Pills with Reordering */}
      {selectedItems.length > 0 && (
        <div className="mb-1 flex flex-col gap-1.5">
          {selectedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex w-full flex-col gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-950/60 font-mono text-[9px] font-bold text-cyan-400">
                    {index + 1}
                  </span>
                  <span className="truncate text-xs font-semibold text-cyan-400">
                    {item.name}
                  </span>
                  <span className="font-mono text-[10px] text-cyan-500/70">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Move Up"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "up");
                    }}
                    className="rounded p-1 text-cyan-500 transition-colors hover:bg-cyan-500/20 hover:text-cyan-300 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move Down"
                    disabled={index === selectedItems.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "down");
                    }}
                    className="rounded p-1 text-cyan-500 transition-colors hover:bg-cyan-500/20 hover:text-cyan-300 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(
                        selectedIds.filter(
                          (id) => id !== item.id && id !== item.externalId,
                        ),
                      );
                    }}
                    className="ml-1 rounded p-1 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {renderExtra && renderExtra(item, true)}
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="bg-card border-border text-foreground w-full rounded-lg border py-1.5 pr-3 pl-9 text-xs transition-colors placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
        />

        {/* Dropdown Options */}
        {isOpen && (
          <div className="bg-card border-border custom-scrollbar absolute top-full z-50 mt-1.5 max-h-48 w-full overflow-y-auto rounded-lg border shadow-2xl">
            {filtered.length === 0 ? (
              <div className="text-muted-foreground bg-background/50 p-3 text-center text-xs italic">
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
                    className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex w-full items-center justify-between rounded px-2 py-2 text-left text-xs transition-colors"
                  >
                    <span className="truncate pr-4">{item.name}</span>
                    <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
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
