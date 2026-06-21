"use client";

import React, { useState } from "react";
import { PosItem } from "@soustools/api-types";
import { Search } from "lucide-react";

interface PosItemPickerProps {
  items: PosItem[];
  value: string | undefined;
  onChange: (itemId: string) => void;
  placeholder?: string;
}

export function PosItemPicker({ items, value, onChange, placeholder = "Search items..." }: PosItemPickerProps) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500 text-zinc-100"
        />
      </div>
      <div className="max-h-48 overflow-y-auto border border-white/5 rounded-lg bg-zinc-950 p-1 space-y-0.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-xs text-zinc-500 italic p-2 text-center">No items found.</div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex justify-between items-center ${
                value === item.id 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                  : "text-zinc-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="truncate">{item.name}</span>
              <span className="shrink-0 ml-2 font-mono opacity-60">${Number(item.price).toFixed(2)}</span>
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

export function PosItemMultiPicker({ items, selectedIds, onChange, placeholder = "Search upgrades...", renderExtra }: PosItemMultiPickerProps) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500 text-zinc-100"
        />
      </div>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-white/5 p-2 rounded bg-zinc-950">
        {filtered.length === 0 ? (
          <div className="text-xs text-zinc-500 italic p-2 text-center">No items found.</div>
        ) : (
          filtered.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div key={item.id} className="flex flex-col gap-1 p-1 rounded hover:bg-white/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isSelected} onChange={(e) => {
                    if (e.target.checked) onChange([...selectedIds, item.id]);
                    else onChange(selectedIds.filter(id => id !== item.id));
                  }} className="w-3 h-3 text-cyan-500 bg-zinc-900 border-white/10 rounded" />
                  <span className="text-xs text-zinc-300 truncate flex-1">{item.name}</span>
                  <span className="shrink-0 ml-2 font-mono text-[10px] opacity-60 text-zinc-500">${Number(item.price).toFixed(2)}</span>
                </label>
                {renderExtra && renderExtra(item, isSelected)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
