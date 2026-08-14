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
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
          Recipe & 3-Way Ingredient Mapping
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-zinc-400">Recipe Title</label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Yield</label>
          <div className="mt-1 flex gap-1">
            <input
              type="number"
              value={yieldCount || 1}
              onChange={(e) =>
                onYieldChange(Number(e.target.value), yieldUnit || "servings")
              }
              className="w-16 rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-100"
            />
            <input
              type="text"
              value={yieldUnit || "servings"}
              onChange={(e) => onYieldChange(yieldCount || 1, e.target.value)}
              className="flex-1 rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-100"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-300">
          3-Way Mapping UI: [Raw Item] &lt;-&gt; [Tenant master_items] &lt;-&gt;
          [USDA Item]
        </span>
        {ingredients.map((ing, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-900/80 p-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300">
                {ing.rawName}
              </span>
              <span className="text-zinc-400">
                {ing.quantity || 1} {ing.unit || "unit"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
              <div>
                <label className="text-[10px] text-zinc-400">
                  Tenant master_items (Top 5)
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
                  className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-zinc-100"
                >
                  <option value="">-- Select Master Item --</option>
                  {ing.tenantMatches?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400">
                  USDA FDC Matches (Top 5)
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
                  className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-zinc-100"
                >
                  <option value="">-- Select USDA Item --</option>
                  {ing.usdaMatches?.map((u) => (
                    <option key={u.fdcId} value={u.fdcId}>
                      {u.description} (FDC #{u.fdcId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-zinc-400">
          Instructions ({instructions.length} steps)
        </label>
        <div className="mt-1 flex max-h-32 flex-col gap-1 overflow-y-auto rounded border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-300">
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="font-bold text-amber-500">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
