"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Check,
  Pencil,
  AlertTriangle,
  FlaskConical,
  Loader2,
  X,
  Plus,
} from "lucide-react";
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
  isHovered?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

// ── ConfidenceBadge ────────────────────────────────────────────────────────

function ConfidenceBadge({
  name,
  similarity,
  matchColor,
}: {
  name: string;
  similarity: number;
  matchColor: "green" | "yellow" | "orange";
}) {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    yellow: "bg-amber-500/15   text-amber-400   border-amber-500/30",
    orange: "bg-orange-500/15  text-orange-400  border-orange-500/30",
  }[matchColor];
  const dot = {
    green: "bg-emerald-400",
    yellow: "bg-amber-400",
    orange: "bg-orange-400",
  }[matchColor];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="truncate max-w-[160px]">{name}</span>
      <span className="font-mono text-[10px] opacity-70">
        {Math.round(similarity * 100)}%
      </span>
    </span>
  );
}

// ── UsdaBadge ──────────────────────────────────────────────────────────────

function UsdaBadge({ name, fdcId }: { name: string; fdcId: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-violet-500/15 text-violet-400 border-violet-500/30">
      <FlaskConical className="h-3 w-3 flex-shrink-0" />
      <span className="truncate max-w-[160px]">{name}</span>
      <span className="font-mono text-[10px] opacity-60">#{fdcId}</span>
    </span>
  );
}

// ── InlineDropdown — appears below the inline edit input ──────────────────

function InlineDropdown({
  suggestions,
  filteredItems,
  search,
  currentItemId,
  onSelectItem,
  onCreateItem,
}: {
  suggestions: UnifiedLineItem["suggestions"];
  filteredItems: Array<{ id: string; name: string }>;
  search: string;
  currentItemId: string | null;
  onSelectItem: (id: string, conf: number) => void;
  onCreateItem: (name: string) => void;
}) {
  const getMatchColors = (c: string) =>
    c === "green"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : c === "yellow"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-orange-500/10 text-orange-400 border-orange-500/20";

  const hasSuggestions = !!suggestions?.length && !search;
  const hasFiltered = filteredItems.length > 0;
  const canCreate =
    !!search.trim() &&
    !filteredItems.some(
      (o) => o.name.toLowerCase() === search.trim().toLowerCase(),
    );

  if (!hasSuggestions && !hasFiltered && !canCreate) return null;

  return (
    <div className="absolute z-50 top-full left-0 mt-1.5 w-full min-w-[220px] max-w-xs bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-52 flex flex-col">
      <div className="overflow-y-auto flex-1 py-1 text-xs">
        {hasSuggestions && (
          <div className="border-b border-zinc-900 pb-1 mb-1">
            <div className="px-3 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              AI Suggestions
            </div>
            {suggestions!.map((sug) => (
              <button
                key={sug.itemId}
                type="button"
                onClick={() => onSelectItem(sug.itemId, sug.similarity)}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 flex items-center justify-between gap-2"
              >
                <span className="truncate font-medium text-zinc-200">
                  {sug.name}
                </span>
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${getMatchColors(sug.matchColor)}`}
                >
                  {Math.round(sug.similarity * 100)}%
                </span>
              </button>
            ))}
          </div>
        )}

        {hasFiltered && (
          <>
            <div className="px-3 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              {hasSuggestions ? "Other Items" : "Items"}
            </div>
            {filteredItems.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectItem(opt.id, 1.0)}
                className={`w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 flex items-center ${
                  opt.id === currentItemId
                    ? "text-emerald-400 font-semibold"
                    : "text-zinc-300"
                }`}
              >
                <span className="truncate">{opt.name}</span>
              </button>
            ))}
          </>
        )}

        {canCreate && (
          <button
            type="button"
            onClick={() => onCreateItem(search.trim())}
            className="w-full text-left px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 font-semibold border-t border-zinc-900 flex items-center gap-1.5"
          >
            <Plus className="h-3 w-3" />
            Create &ldquo;{search.trim()}&rdquo;
          </button>
        )}
      </div>
    </div>
  );
}

// ── UnifiedItemRow ─────────────────────────────────────────────────────────

export function UnifiedItemRow({
  item,
  index,
  disabled = false,
  masterIngredients,
  onConfirmAlias,
  onUpdateItem,
  onItemCreated,
  isHovered = false,
  onHoverChange,
}: UnifiedItemRowProps) {
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLinkingUsda, setIsLinkingUsda] = useState(false);
  const [localItems, setLocalItems] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pre-fetch tenant items for the inline override dropdown
  useEffect(() => {
    const fetchLocalItems = async () => {
      try {
        const { data, error } = await api.GET("/items", {
          params: { query: { search: "" } },
        });
        if (!error && data?.data) {
          setLocalItems(data.data as Array<{ id: string; name: string }>);
        }
      } catch (err) {
        console.error("Failed to load local items in UnifiedItemRow", err);
      }
    };
    fetchLocalItems();
  }, []);

  const mergedIngredients = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    masterIngredients.forEach((i) => map.set(i.id, i));
    localItems.forEach((i) => map.set(i.id, i));
    return Array.from(map.values());
  }, [masterIngredients, localItems]);

  const currentSelected = mergedIngredients.find((o) => o.id === item.itemId);
  const selectedSuggestion = item.suggestions?.find(
    (s) => s.itemId === item.itemId,
  );

  // Open the inline override editor, pre-filling the input with the best available name
  const openOverride = (prefill?: string) => {
    const initial =
      prefill !== undefined
        ? prefill
        : (currentSelected?.name ?? item.suggestedInternalName ?? "");
    setSearch(initial);
    setIsOverrideOpen(true);
    // Focus on next tick after state settles
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeOverride = () => {
    setIsOverrideOpen(false);
    setSearch("");
  };

  // Auto-select top suggestion if confidence ≥ 0.90 and nothing is mapped yet
  useEffect(() => {
    if (
      !item.itemId &&
      !item.isNonInventoryExpense &&
      item.suggestions?.length
    ) {
      const top = item.suggestions[0];
      if (top.similarity >= 0.9) {
        onUpdateItem?.(index, {
          itemId: top.itemId,
          confidence: top.similarity,
        });
      }
    }
  }, [
    item.itemId,
    item.isNonInventoryExpense,
    item.suggestions,
    index,
    onUpdateItem,
  ]);

  // Close inline edit on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeOverride();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = mergedIngredients.filter(
    (opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase()) &&
      !item.suggestions?.some((s) => s.itemId === opt.id),
  );

  // Selecting a tenant item — persists alias to vendor_item_aliases
  const selectItem = (id: string, conf: number) => {
    onUpdateItem?.(index, { itemId: id, confidence: conf });
    onConfirmAlias?.(item.rawName, id); // → POST /ingestion/alias
    closeOverride();
  };

  // Creating a new tenant item from scratch
  const handleCreate = async (name: string) => {
    setIsCreating(true);
    try {
      const { data, error } = await api.POST("/items", {
        body: {
          name,
          category: item.category || "INGREDIENT",
          purchase_unit: item.unit || "EACH",
          units_per_case: 1,
        },
      });
      if (error) throw new Error(String(error));
      if (data?.data) {
        const created = data.data as { id: string; name: string };
        onItemCreated?.(created);
        onUpdateItem?.(index, { itemId: created.id, confidence: 1.0 });
        onConfirmAlias?.(item.rawName, created.id); // save alias immediately
        closeOverride();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Persisting the user's USDA approval — writes fdc_id onto the tenant item
  const handleApproveUsda = async () => {
    if (!item.itemId || !item.usdaFdcId) return;
    setIsLinkingUsda(true);
    try {
      // @ts-expect-error — endpoint pending next schema regen
      const { error } = await api.POST("/ingestion/link-usda", {
        body: { itemId: item.itemId, fdcId: item.usdaFdcId },
      });
      if (error) throw new Error("Failed to persist USDA link");
      // Mark verified in local state so the approve button disappears
      onUpdateItem?.(index, { needsUsdaVerification: false });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLinkingUsda(false);
    }
  };

  // ── Derived display state ──────────────────────────────────────────────

  const isExpense = !!item.isNonInventoryExpense;
  const hasTenantMapping = !!item.itemId && !isExpense;
  const hasUsdaLink = !!item.usdaFdcId && !!item.usdaName;
  const needsUsdaStep = hasTenantMapping && item.needsUsdaVerification;
  const noHighConf = !item.suggestions?.some((s) => s.similarity >= 0.9);
  const isComplete =
    isExpense || (hasTenantMapping && (!needsUsdaStep || !item.usdaFdcId));

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={`flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-150 ${
        isHovered
          ? "bg-cyan-500/5 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
          : "bg-white/5 dark:bg-black/20 border-white/10 dark:border-zinc-800/80"
      }`}
    >
      {/* ── Raw name + completion indicator ── */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-foreground leading-snug">
          {item.rawName}
        </span>
        {isComplete && (
          <span className="flex-shrink-0 flex items-center justify-center bg-emerald-500/10 text-emerald-500 p-1 rounded-lg border border-emerald-500/20 mt-0.5">
            <Check className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* ── AI Suggestion label — preserved from original design ── */}
      {item.suggestedInternalName && (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
          AI Suggestion:{" "}
          <strong className="text-cyan-400/80 font-medium not-italic">
            &ldquo;{item.suggestedInternalName}&rdquo;
          </strong>
          {item.category && (
            <span className="text-zinc-600 ml-1 not-italic">
              ({item.category})
            </span>
          )}
        </span>
      )}

      {/* ── Quantity / unit / price row ── */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
        {item.amount != null && (
          <span>
            qty: <span className="text-zinc-300">{item.amount}</span>
          </span>
        )}
        {item.unit && (
          <span>
            unit: <span className="text-zinc-300">{item.unit}</span>
          </span>
        )}
        {item.price != null && (
          <span>
            price:{" "}
            <span className="text-zinc-300">
              ${Number(item.price).toFixed(2)}
            </span>
          </span>
        )}
      </div>

      {/* ── Mapping chain ── */}
      {!isExpense ? (
        <div className="flex flex-col gap-1.5">
          {/* Step 1 — Tenant mapping row */}
          <div
            ref={containerRef}
            className="flex items-center gap-2 flex-wrap relative"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              →
            </span>

            {isOverrideOpen ? (
              /* ── Inline edit mode: badge swaps to an input ── */
              <div className="relative flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeOverride();
                    if (e.key === "Enter" && filtered[0]) {
                      selectItem(filtered[0].id, 1.0);
                    }
                  }}
                  placeholder={
                    item.suggestedInternalName
                      ? `e.g. "${item.suggestedInternalName}"`
                      : "Search or type a name…"
                  }
                  className="flex-1 min-w-0 text-xs rounded-full border border-cyan-500/40 bg-zinc-900 px-3 py-1 text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={closeOverride}
                  className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Inline autocomplete dropdown */}
                <InlineDropdown
                  search={search}
                  suggestions={item.suggestions}
                  filteredItems={filtered}
                  currentItemId={item.itemId ?? null}
                  onSelectItem={selectItem}
                  onCreateItem={handleCreate}
                />
              </div>
            ) : (
              /* ── Normal view: badge + pencil override button ── */
              <>
                {hasTenantMapping ? (
                  selectedSuggestion ? (
                    <ConfidenceBadge
                      name={currentSelected?.name ?? selectedSuggestion.name}
                      similarity={selectedSuggestion.similarity}
                      matchColor={selectedSuggestion.matchColor}
                    />
                  ) : (
                    <ConfidenceBadge
                      name={currentSelected?.name ?? "Mapped"}
                      similarity={item.confidence ?? 1}
                      matchColor="green"
                    />
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border-red-500/20">
                    <AlertTriangle className="h-3 w-3" />
                    Unmapped
                  </span>
                )}

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => openOverride()}
                    className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                    title="Override mapping"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                    override
                  </button>
                )}
              </>
            )}
          </div>

          {/* Step 2 — USDA Double Match (only when needsUsdaVerification is set) */}
          {needsUsdaStep && (
            <div className="flex items-center gap-2 flex-wrap pl-4">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                →
              </span>

              {hasUsdaLink ? (
                <>
                  <UsdaBadge name={item.usdaName!} fdcId={item.usdaFdcId!} />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={handleApproveUsda}
                      disabled={isLinkingUsda}
                      className="flex items-center gap-1 rounded-full border border-emerald-700 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] text-emerald-400 hover:border-emerald-500 hover:text-emerald-300 transition-colors disabled:opacity-50"
                    >
                      {isLinkingUsda ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <Check className="h-2.5 w-2.5" />
                      )}
                      {isLinkingUsda ? "Saving…" : "Approve USDA"}
                    </button>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-500 border-zinc-700 italic">
                  <FlaskConical className="h-3 w-3" />
                  Searching USDA…
                </span>
              )}
            </div>
          )}

          {/* Create New fallback — when no mapping and no high-confidence suggestion */}
          {!hasTenantMapping && !isOverrideOpen && noHighConf && (
            <div className="pl-5 mt-0.5">
              <button
                type="button"
                disabled={disabled || isCreating}
                onClick={() =>
                  // Pre-fill with AI suggestion so user doesn't type from scratch
                  openOverride(item.suggestedInternalName || "")
                }
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                Create &ldquo;{item.suggestedInternalName || item.rawName}
                &rdquo;
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Expense bypass indicator */
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 italic">
          <Check className="h-3 w-3 text-zinc-600" />
          Non-inventory expense — bypassed
        </div>
      )}
    </div>
  );
}
