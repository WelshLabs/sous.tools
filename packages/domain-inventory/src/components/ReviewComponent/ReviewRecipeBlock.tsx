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
  instructions?: string[];
  ingredients?: RecipeIngredientData[];
  onTitleChange: (title: string) => void;
  onYieldChange: (count: number, unit: string) => void;
  onIngredientMappingChange: (
    index: number,
    tenantId: string,
    usdaId?: number,
  ) => void;
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
}: ReviewRecipeBlockProps) {
  return (
    <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
      {/* ── Header row: title + yield ── */}
      <div className="flex min-w-0 flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            Recipe title
          </label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled recipe"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        <div className="flex shrink-0 items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              Qty
            </label>
            <input
              type="number"
              value={yieldCount || 1}
              onChange={(e) =>
                onYieldChange(Number(e.target.value), yieldUnit || "servings")
              }
              className="w-16 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              Unit
            </label>
            <input
              type="text"
              value={yieldUnit || "servings"}
              onChange={(e) => onYieldChange(yieldCount || 1, e.target.value)}
              className="w-28 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
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
            />
          ))}
        </div>
      )}

      {/* ── Instructions ── */}
      {instructions.length > 0 && (
        <div className="flex flex-col gap-2 pt-4">
          <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            Instructions
          </span>
          <ol className="flex flex-col gap-2">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
