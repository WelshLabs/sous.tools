"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "@soustools/api-client";
import { Search, Plus, Loader2, X, ChevronDown } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TenantMatch {
  id: string;
  name: string;
}

export interface UsdaMatch {
  fdcId: number;
  description: string;
  score?: number;
}

export interface IngredientMappingRowProps {
  /** Raw name from the document */
  rawName: string;
  /** AI-guessed canonical name */
  guessName?: string;
  quantity?: number;
  unit?: string;
  tenantMatches: TenantMatch[];
  usdaMatches: UsdaMatch[];
  selectedTenantId?: string;
  selectedUsdaId?: number;
  onMappingChange: (tenantId: string, usdaId?: number) => void;
  /** Optional extra info in the right gutter (e.g. price for invoices) */
  metaRight?: React.ReactNode;
}

// ── Ingredient combobox ───────────────────────────────────────────────────────

interface IngredientComboboxProps {
  matches: TenantMatch[];
  value: string;
  guessName?: string;
  onChange: (id: string) => void;
  onCreateNew: (name: string) => void;
}

function IngredientCombobox({
  matches,
  value,
  guessName,
  onChange,
  onCreateNew,
}: IngredientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedName = matches.find((m) => m.id === value)?.name;

  const filtered = query.trim()
    ? matches.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()),
      )
    : matches;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    try {
      onCreateNew(name);
    } finally {
      setCreating(false);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-left text-xs transition hover:border-zinc-600"
      >
        <span
          className={
            selectedName ? "text-zinc-200" : "text-zinc-600 italic"
          }
        >
          {selectedName ?? (guessName ? `Suggested: ${guessName}` : "Select ingredient")}
        </span>
        <ChevronDown className="ml-1 h-3 w-3 shrink-0 text-zinc-600" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[220px] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
            <Search className="h-3 w-3 shrink-0 text-zinc-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && filtered.length === 0) handleCreate();
              }}
              placeholder="Search or create…"
              className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <X className="h-3 w-3 text-zinc-600" />
              </button>
            )}
          </div>

          {/* AI suggestion chip */}
          {guessName && !value && (
            <div className="border-b border-zinc-800 px-3 py-1.5">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wide">AI suggestion</span>
              <button
                type="button"
                onClick={() => {
                  // try to match against existing, else prompt create
                  const match = matches.find((m) =>
                    m.name.toLowerCase() === guessName.toLowerCase(),
                  );
                  if (match) {
                    handleSelect(match.id);
                  } else {
                    setQuery(guessName);
                  }
                }}
                className="mt-0.5 flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                {guessName}
              </button>
            </div>
          )}

          {/* Options list */}
          <ul className="max-h-48 overflow-y-auto py-1" role="listbox">
            {filtered.map((m) => (
              <li key={m.id} role="option" aria-selected={m.id === value}>
                <button
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs transition hover:bg-zinc-800 ${
                    m.id === value
                      ? "text-white font-medium"
                      : "text-zinc-300"
                  }`}
                >
                  {m.id === value && (
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                  {m.name}
                </button>
              </li>
            ))}

            {filtered.length === 0 && !query && (
              <li className="px-3 py-3 text-xs text-zinc-600 italic">
                No ingredients yet
              </li>
            )}

            {/* Create new */}
            {query.trim() && (
              <li className="border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-cyan-400 transition hover:bg-zinc-800"
                >
                  {creating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3 shrink-0" />
                  )}
                  Create &ldquo;{query.trim()}&rdquo;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── USDA search ───────────────────────────────────────────────────────────────

interface UsdaSearchFieldProps {
  matches: UsdaMatch[];
  value: number | string;
  initialQuery: string;
  onChange: (fdcId: number) => void;
  onMatchesUpdate: (matches: UsdaMatch[]) => void;
}

function UsdaSearchField({
  matches,
  value,
  initialQuery,
  onChange,
  onMatchesUpdate,
}: UsdaSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [localMatches, setLocalMatches] = useState<UsdaMatch[]>(matches);

  useEffect(() => {
    setLocalMatches(matches);
  }, [matches]);

  const handleSearch = useCallback(async () => {
    const q = query.trim() || initialQuery;
    if (!q) return;
    setSearching(true);
    try {
      const { data } = await api.GET("/nutrition/usda/search" as never, {
        params: { query: { query: q } },
      } as any);
      const results: UsdaMatch[] = (data as any)?.data
        ? [
            {
              fdcId: (data as any).data.fdcId ?? 0,
              description: (data as any).data.description ?? q,
            },
          ]
        : [];
      setLocalMatches(results);
      onMatchesUpdate(results);
    } catch (err) {
      console.error("USDA search failed:", err);
    } finally {
      setSearching(false);
    }
  }, [query, initialQuery, onMatchesUpdate]);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Inline search bar */}
      <div className="flex items-center gap-1.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={`Search USDA… (e.g. "${initialQuery}")`}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-50"
          aria-label="Search USDA"
        >
          {searching ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Search className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Results select */}
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-600"
      >
        <option value="">Select USDA</option>
        {localMatches.map((u) => (
          <option key={u.fdcId} value={u.fdcId}>
            {u.description}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main row component ────────────────────────────────────────────────────────

export function IngredientMappingRow({
  rawName,
  guessName,
  quantity,
  unit,
  tenantMatches,
  usdaMatches,
  selectedTenantId,
  selectedUsdaId,
  onMappingChange,
  metaRight,
}: IngredientMappingRowProps) {
  const [currentUsdaMatches, setCurrentUsdaMatches] =
    useState<UsdaMatch[]>(usdaMatches);
  const [currentTenantId, setCurrentTenantId] = useState(
    selectedTenantId ?? "",
  );
  const [currentUsdaId, setCurrentUsdaId] = useState<number | undefined>(
    selectedUsdaId,
  );

  const handleTenantChange = (id: string) => {
    setCurrentTenantId(id);
    onMappingChange(id, currentUsdaId);
  };

  const handleUsdaChange = (fdcId: number) => {
    setCurrentUsdaId(fdcId);
    onMappingChange(currentTenantId, fdcId);
  };

  const handleCreateIngredient = (name: string) => {
    // Optimistic: set the name as a temporary placeholder
    // The parent or a future container can wire this to a POST /items
    console.info("Create ingredient requested:", name);
  };

  return (
    <div className="flex flex-col gap-2.5 py-3">
      {/* Name + quantity */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-100 leading-snug">
          {rawName}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {metaRight}
          {(quantity || unit) && (
            <span className="text-xs tabular-nums text-zinc-500">
              {quantity} {unit}
            </span>
          )}
        </div>
      </div>

      {/* Mapping controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
            Ingredient
          </label>
          <IngredientCombobox
            matches={tenantMatches}
            value={currentTenantId}
            guessName={guessName}
            onChange={handleTenantChange}
            onCreateNew={handleCreateIngredient}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
            USDA
          </label>
          <UsdaSearchField
            matches={currentUsdaMatches}
            value={currentUsdaId ?? ""}
            initialQuery={guessName ?? rawName}
            onChange={handleUsdaChange}
            onMatchesUpdate={setCurrentUsdaMatches}
          />
        </div>
      </div>
    </div>
  );
}
