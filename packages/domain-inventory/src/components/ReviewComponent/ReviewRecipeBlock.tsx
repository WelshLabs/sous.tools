"use client";

export interface RecipeIngredientData {
  rawName: string;
  guessName: string;
  quantity?: number;
  unit?: string;
  tenantMatches: Array<{ id: string; name: string }>;
  usdaMatches: Array<{ fdcId: number; description: string }>;
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
      {/* ── Recipe header row: title + yield ── */}
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
              className="w-16 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
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
              className="w-28 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* ── Ingredients ── */}
      {ingredients.length > 0 && (
        <div className="flex flex-col gap-0 divide-y divide-zinc-800/40 pt-4">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 py-3 first:pt-0">
              {/* Name + amount */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-zinc-100 leading-snug">
                  {ing.rawName}
                </span>
                {(ing.quantity || ing.unit) && (
                  <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                    {ing.quantity} {ing.unit}
                  </span>
                )}
              </div>

              {/* Mapping selects */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    Ingredient
                  </label>
                  <select
                    value={ing.selectedTenantId || ""}
                    onChange={(e) =>
                      onIngredientMappingChange(
                        idx,
                        e.target.value,
                        ing.selectedUsdaId,
                      )
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-600"
                  >
                    <option value="">Select ingredient</option>
                    {ing.tenantMatches?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    USDA
                  </label>
                  <select
                    value={ing.selectedUsdaId || ""}
                    onChange={(e) =>
                      onIngredientMappingChange(
                        idx,
                        ing.selectedTenantId || "",
                        Number(e.target.value),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-600"
                  >
                    <option value="">Select USDA</option>
                    {ing.usdaMatches?.map((u) => (
                      <option key={u.fdcId} value={u.fdcId}>
                        {u.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
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
