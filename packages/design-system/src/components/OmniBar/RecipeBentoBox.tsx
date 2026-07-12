"use client";

import React from "react";
import { Check, Clock, Scaling } from "lucide-react";
import { type RecipeExtractionDTO } from "@soustools/api-types";
import { CreatableSelect } from "./CreatableSelect";

export interface RecipeBentoBoxProps {
  recipe: RecipeExtractionDTO;
  masterIngredients: Array<{ id: string; name: string }>;
  disabled?: boolean;
  onConfirmAlias?: (rawString: string, masterId: string) => void;
  onUpdateIngredient?: (
    index: number,
    updates: Partial<RecipeExtractionDTO["ingredients"][number]>
  ) => void;
  onSaveRecipe?: (payload: RecipeExtractionDTO) => void;
}

export function RecipeBentoBox({
  recipe,
  masterIngredients,
  disabled = false,
  onConfirmAlias,
  onUpdateIngredient,
  onSaveRecipe,
}: RecipeBentoBoxProps) {
  const isSaveDisabled = React.useMemo(() => !recipe.ingredients || recipe.ingredients.length === 0 || recipe.ingredients.some((ing) => !ing.itemId), [recipe.ingredients]);

  const renderIngredientRow = (ing: RecipeExtractionDTO["ingredients"][number], index: number) => {
    const isExact = ing.confidence === 1.0;
    const isSuggested = ing.confidence !== undefined && ing.confidence !== null && ing.confidence >= 0.6 && ing.confidence < 1.0;

    return (
      <div
        key={index}
        className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-zinc-800/80"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Column: Ingredient Info */}
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">
              {ing.baseIngredient}
            </span>
            {ing.preparationNote && (
              <span className="text-xs text-muted-foreground italic">
                {ing.preparationNote}
              </span>
            )}
            <span className="text-xs font-mono text-cyan-400 mt-0.5">
              Qty: {ing.quantity || ""} {ing.unit || ""}
            </span>
          </div>

          {/* Right Column: Mapping Select & Match State */}
          <div className="flex items-center gap-2 min-w-[200px] max-w-[250px] relative">
            <div className="flex-1">
              <CreatableSelect
                disabled={disabled}
                value={isExact ? (ing.itemId || "") : ""}
                options={masterIngredients}
                onChange={(val) => {
                  if (onUpdateIngredient) {
                    onUpdateIngredient(index, { itemId: val, confidence: val ? 1.0 : 0.0 });
                  }
                  if (val) {
                    onConfirmAlias?.(ing.baseIngredient, val);
                  }
                }}
                onCreate={() => {}}
                placeholder="⚠️ Map to Internal Item..."
              />
            </div>
            {isExact && ing.itemId && (
              <div
                className="flex items-center justify-center bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg border border-emerald-500/20"
                title="Exact Match (1.0 Confidence)"
              >
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Click to Confirm Suggestion Chip */}
        {isSuggested && ing.itemId && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (onUpdateIngredient) {
                onUpdateIngredient(index, { confidence: 1.0 });
              }
              onConfirmAlias?.(ing.baseIngredient, ing.itemId || "");
            }}
            className="self-start flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 text-amber-600 dark:text-amber-400 text-[11px] font-semibold px-2 py-1 rounded-lg border border-amber-500/25 cursor-pointer transition-all active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Suggested: {masterIngredients.find((opt) => opt.id === ing.itemId)?.name || "Ingredient"}</span>
            <span className="text-[9px] opacity-75 font-normal ml-1 border-l border-amber-500/30 pl-1.5 font-sans">Click to Confirm</span>
          </button>
        )}
      </div>
    );
  };
  const groupedIngredients = React.useMemo(() => {
    const groups: Record<string, Array<{ ing: RecipeExtractionDTO["ingredients"][number]; index: number }>> = {};
    recipe.ingredients?.forEach((ing, index) => {
      const section = ing.sectionGroup?.trim() || "Ingredients";
      if (!groups[section]) groups[section] = [];
      groups[section].push({ ing, index });
    });
    return groups;
  }, [recipe.ingredients]);

  return (
    <div className="flex flex-col gap-4 w-full text-left">
      <div className="backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            EXTRACTED RECIPE
          </span>
          <h2 className="text-xl font-bold text-foreground mt-0.5">
            {recipe.recipeName || "Untitled Recipe"}
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground font-mono">
          {recipe.yieldAmount && (
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
              <Scaling className="w-4 h-4 text-cyan-400" />
              <span>Yield: {recipe.yieldAmount} {recipe.yieldUnit || ""}</span>
            </div>
          )}
          {recipe.prepTimeMinutes && (
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Prep: {recipe.prepTimeMinutes} mins</span>
            </div>
          )}
        </div>
      </div>
      <div className="backdrop-blur-md bg-white/5 dark:bg-zinc-950/20 border border-white/10 dark:border-zinc-900/60 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-300 font-mono uppercase border-b border-white/10 pb-2">
          Ingredients
        </h3>
        <div className="flex flex-col gap-5 pr-1">
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            Object.entries(groupedIngredients).map(([sectionName, items]) => (
              <div key={sectionName} className="flex flex-col gap-2">
                <div className="text-[11px] font-bold tracking-widest text-cyan-400 font-mono uppercase bg-white/5 dark:bg-black/20 border border-white/10 dark:border-zinc-800/50 px-3 py-1 rounded-lg w-fit">
                  {sectionName}
                </div>
                <div className="flex flex-col gap-2 pl-3 border-l border-cyan-500/10 dark:border-cyan-500/5">
                  {items.map(({ ing, index }) => renderIngredientRow(ing, index))}
                </div>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">No ingredients found.</span>
          )}
        </div>
      </div>
      <div className="backdrop-blur-md bg-white/5 dark:bg-zinc-950/20 border border-white/10 dark:border-zinc-900/60 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-300 font-mono uppercase border-b border-white/10 pb-2">
          Instructions
        </h3>
        <div className="flex flex-col gap-3 pr-1">
          {recipe.instructions && recipe.instructions.length > 0 ? (
            recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start text-sm">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 font-mono">
                  {idx + 1}
                </span>
                <p className="text-muted-foreground leading-relaxed mt-0.5">{step}</p>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">No instructions found.</span>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          type="button"
          disabled={isSaveDisabled || disabled}
          onClick={() => {
            if (onSaveRecipe) onSaveRecipe(recipe);
          }}
          className="w-full md:w-auto px-6 py-3 font-semibold text-sm rounded-xl text-zinc-950 dark:text-white bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:bg-cyan-400/20 disabled:text-muted-foreground/60 dark:disabled:bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] cursor-pointer disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-98"
        >
          Confirm & Save Recipe
        </button>
      </div>
    </div>
  );
}
