"use client";
import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Plus, Loader2 } from "lucide-react";
import { api } from "@soustools/api-client";

import { type UnifiedLineItem } from "./UnifiedReviewPanel";

export interface UnifiedItemRowProps {
  item: UnifiedLineItem;
  index: number;
  disabled?: boolean;
  masterIngredients: Array<{ id: string; name: string }>;
  onConfirmAlias?: (rawString: string, masterId: string) => void;
  onUpdateItem?: (index: number, updates: Partial<UnifiedLineItem>) => void;
  onItemCreated?: (newItem: { id: string; name: string }) => void;
}

export function UnifiedItemRow({
  item,
  index,
  disabled = false,
  masterIngredients,
  onConfirmAlias,
  onUpdateItem,
  onItemCreated,
}: UnifiedItemRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isExact = item.confidence === 1.0;
  const currentSelected = masterIngredients.find((o) => o.id === item.itemId);

  useEffect(() => {
    if (!item.itemId && !item.isNonInventoryExpense && item.suggestions?.length) {
      const top = item.suggestions[0];
      if (top.similarity >= 0.90) {
        onUpdateItem?.(index, { itemId: top.itemId, confidence: top.similarity });
      }
    }
  }, [item.itemId, item.isNonInventoryExpense, item.suggestions, index, onUpdateItem]);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const hasHigh = item.suggestions?.some((s) => s.similarity >= 0.90);
  const filtered = masterIngredients.filter((opt) => 
    opt.name.toLowerCase().includes(search.toLowerCase()) && 
    !item.suggestions?.some((s) => s.itemId === opt.id)
  );

  const handleCreate = async (customName?: string) => {
    setIsCreating(true);
    try {
      const name = customName || item.suggestedInternalName || item.rawName;
      const { data, error } = await api.POST("/items", {
        body: { name, category: item.category || "INGREDIENT", purchase_unit: item.unit || "EACH", units_per_case: 1 }
      });
      if (error) throw new Error(String(error));
      if (data?.data) {
        const created = data.data as { id: string; name: string };
        onItemCreated?.(created);
        onUpdateItem?.(index, { itemId: created.id, confidence: 1.0 });
        onConfirmAlias?.(item.rawName, created.id);
        setSearch("");
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const getB = (c: string) => c === "green" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : c === "yellow" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20";
  const selectItem = (id: string, conf: number) => {
    onUpdateItem?.(index, { itemId: id, confidence: conf });
    onConfirmAlias?.(item.rawName, id);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-zinc-800/80 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col flex-1 min-w-[200px]">
          <span className="font-semibold text-sm text-foreground">{item.rawName}</span>
          {item.suggestedInternalName && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 italic mt-0.5">
              AI Suggestion: <strong className="text-cyan-400/80 font-medium not-italic">"{item.suggestedInternalName}"</strong> ({item.category})
            </span>
          )}
          <div className="flex gap-3 text-xs font-mono text-cyan-400 mt-1">
            <span>Qty: {item.amount || 1}</span>
            {item.price > 0 && <span>Price: ${item.price.toFixed(2)}</span>}
            {item.unit && <span>Unit: {item.unit}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={disabled}
                checked={!!item.isNonInventoryExpense}
                onChange={(e) => onUpdateItem?.(index, { isNonInventoryExpense: e.target.checked, itemId: e.target.checked ? null : item.itemId })}
                className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent text-cyan-500 w-3.5 h-3.5"
              />
              <span>Non-Inventory Expense</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[240px] max-w-[320px] relative" ref={containerRef}>
          <div className="flex-1 relative">
            <div
              onClick={() => !disabled && !item.isNonInventoryExpense && setIsOpen(!isOpen)}
              className={`w-full bg-white/60 dark:bg-black/40 border rounded px-2.5 py-1.5 text-xs outline-none flex items-center justify-between cursor-pointer ${
                disabled || item.isNonInventoryExpense ? "opacity-50 cursor-not-allowed" : ""
              } ${!item.itemId && !item.isNonInventoryExpense ? "border-red-500/70 text-red-600 dark:text-red-300" : "border-black/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400"}`}
            >
              <span className="truncate">{item.isNonInventoryExpense ? "Expense Bypassed" : currentSelected ? currentSelected.name : "⚠️ Map to Internal Item..."}</span>
              <ChevronDown size={14} className="text-zinc-500 dark:text-zinc-400 ml-2 flex-shrink-0" />
            </div>

            {isOpen && (
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
                  {item.suggestions && item.suggestions.length > 0 && !search && (
                    <div className="border-b border-slate-100 dark:border-zinc-900 pb-1 mb-1 animate-fadeIn">
                      {item.suggestions.map((sug) => (
                        <div key={sug.itemId} onClick={() => selectItem(sug.itemId, sug.similarity)} className="px-3 py-1.5 cursor-pointer hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 flex items-center justify-between">
                          <span className="truncate mr-2 font-medium">{sug.name}</span>
                          <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${getB(sug.matchColor)}`}>{Math.round(sug.similarity * 100)}% Match</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="px-3 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">All Items</div>
                  {filtered.length > 0 ? (
                    filtered.map((opt) => (
                      <div key={opt.id} onClick={() => selectItem(opt.id, 1.0)} className={`px-3 py-1.5 cursor-pointer hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 flex items-center justify-between ${opt.id === item.itemId ? "bg-slate-100 dark:bg-zinc-800 text-emerald-500 font-semibold" : ""}`}>
                        <span className="truncate">{opt.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-zinc-500 italic">No master items found</div>
                  )}

                  {search.trim() !== "" && !masterIngredients.some((o) => o.name.toLowerCase() === search.trim().toLowerCase()) && (
                    <div
                      onClick={() => handleCreate(search.trim())}
                      className="px-3 py-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white font-semibold cursor-pointer border-t border-slate-100 dark:border-zinc-900 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create "{search.trim()}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {isExact && item.itemId && !item.isNonInventoryExpense && (
            <div className="flex items-center justify-center bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      {!item.itemId && !item.isNonInventoryExpense && !hasHigh && item.suggestedInternalName && (
        <button
          type="button"
          disabled={disabled || isCreating}
          onClick={() => handleCreate()}
          className="self-start flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 text-cyan-600 dark:text-cyan-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-cyan-500/25 cursor-pointer transition-all active:scale-95"
        >
          {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>Create: {item.suggestedInternalName}</span>
        </button>
      )}
    </div>
  );
}
