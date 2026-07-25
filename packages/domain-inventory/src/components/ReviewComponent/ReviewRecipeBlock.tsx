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
  onIngredientMappingChange: (index: number, tenantId: string, usdaId?: number) => void;
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
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Recipe & 3-Way Ingredient Mapping
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-zinc-400">Recipe Title</label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full mt-1 p-2 text-sm rounded bg-zinc-900 border border-zinc-800 text-zinc-100"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Yield</label>
          <div className="flex gap-1 mt-1">
            <input
              type="number"
              value={yieldCount || 1}
              onChange={(e) => onYieldChange(Number(e.target.value), yieldUnit || "servings")}
              className="w-16 p-2 text-sm rounded bg-zinc-900 border border-zinc-800 text-zinc-100"
            />
            <input
              type="text"
              value={yieldUnit || "servings"}
              onChange={(e) => onYieldChange(yieldCount || 1, e.target.value)}
              className="flex-1 p-2 text-sm rounded bg-zinc-900 border border-zinc-800 text-zinc-100"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-300">3-Way Mapping UI: [Raw Item] &lt;-&gt; [Tenant master_items] &lt;-&gt; [USDA Item]</span>
        {ingredients.map((ing, idx) => (
          <div key={idx} className="p-3 rounded bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-300">{ing.rawName}</span>
              <span className="text-zinc-400">{ing.quantity || 1} {ing.unit || "unit"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400">Tenant master_items (Top 5)</label>
                <select
                  value={ing.selectedTenantId || ""}
                  onChange={(e) => onIngredientMappingChange(idx, e.target.value, ing.selectedUsdaId)}
                  className="w-full mt-0.5 p-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs"
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
                <label className="text-[10px] text-zinc-400">USDA FDC Matches (Top 5)</label>
                <select
                  value={ing.selectedUsdaId || ""}
                  onChange={(e) => onIngredientMappingChange(idx, ing.selectedTenantId || "", Number(e.target.value))}
                  className="w-full mt-0.5 p-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs"
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
        <label className="text-xs text-zinc-400">Instructions ({instructions.length} steps)</label>
        <div className="mt-1 p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex flex-col gap-1 max-h-32 overflow-y-auto">
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-amber-500 font-bold">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
