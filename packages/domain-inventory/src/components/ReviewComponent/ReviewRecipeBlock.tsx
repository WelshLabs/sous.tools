"use client";

import { IngredientMappingRow } from "./IngredientMappingRow";

export interface RecipeIngredientData {
  rawName: string;
  guessName: string;
  quantity?: number;
  unit?: string;
  tenantMatches: Array<{ id: string; name: string }>;
  usdaMatches: Array<{ fdcId: number; description: string; score?: number }>;
  selectedTenantId?: string;
  selectedUsdaId?: number;
}

export interface ReviewRecipeBlockProps {
  title?: string;
  yieldCount?: number;
  yieldUnit?: string;
  instructions?: Array<string | { text: string; stepNumber?: number }>;
  ingredients?: RecipeIngredientData[];
  onTitleChange: (title: string) => void;
  onYieldChange: (count: number, unit: string) => void;
  onIngredientMappingChange: (
    index: number,
    tenantId: string,
    usdaId?: number,
  ) => void;
  onIngredientQuantityChange?: (index: number, quantity: number) => void;
  onIngredientUnitChange?: (index: number, unit: string) => void;
}

export function ReviewRecipeBlock({
  title,
  yieldCount,
  yieldUnit,
  instructions = [],
  ingredients = [],
  onTitleChange,
  onYieldChange,
  onIngredientMappingChange,
  onIngredientQuantityChange,
  onIngredientUnitChange,
}: ReviewRecipeBlockProps) {
  return (
    <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
      {/* ── Header row: title + yield in mobile-first row ── */}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
            Recipe Title
          </label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled recipe"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-500 transition outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        <div className="flex shrink-0 items-end gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Qty
            </label>
            <input
              type="number"
              value={yieldCount || 1}
              onChange={(e) =>
                onYieldChange(
                  Number(e.target.value) || 1,
                  yieldUnit || "servings",
                )
              }
              className="w-16 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-2 text-center text-sm font-medium text-zinc-100 transition outline-none focus:border-zinc-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Unit
            </label>
            <input
              type="text"
              value={yieldUnit || "servings"}
              onChange={(e) => onYieldChange(yieldCount || 1, e.target.value)}
              placeholder="servings"
              className="w-28 min-w-[80px] rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm font-medium text-zinc-100 transition outline-none focus:border-zinc-600 sm:w-36"
            />
          </div>
        </div>
      </div>

      {/* ── Ingredients ── */}
      {ingredients.length > 0 && (
        <div className="flex flex-col divide-y divide-zinc-800/40 pt-1">
          {ingredients.map((ing, idx) => (
            <IngredientMappingRow
              key={idx}
              rawName={ing.rawName}
              guessName={ing.guessName}
              quantity={ing.quantity}
              unit={ing.unit}
              tenantMatches={ing.tenantMatches}
              usdaMatches={ing.usdaMatches}
              selectedTenantId={ing.selectedTenantId}
              selectedUsdaId={ing.selectedUsdaId}
              onMappingChange={(tId, uId) =>
                onIngredientMappingChange(idx, tId, uId)
              }
              onQuantityChange={
                onIngredientQuantityChange
                  ? (qty) => onIngredientQuantityChange(idx, qty)
                  : undefined
              }
              onUnitChange={
                onIngredientUnitChange
                  ? (u) => onIngredientUnitChange(idx, u)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* ── Instructions ── */}
      {instructions.length > 0 && (
        <div className="flex flex-col gap-2 pt-4">
          <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
            Instructions
          </span>
          <ol className="flex flex-col gap-2">
            {instructions.map((step, i) => {
              const text =
                typeof step === "string"
                  ? step
                  : step.text || (step as any).instruction || "";
              return (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed whitespace-pre-wrap">
                    {text}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
