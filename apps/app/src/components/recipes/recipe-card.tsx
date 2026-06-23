"use client";

import React from "react";
import { Recipe } from "@soustools/api-types";
import { Play, Edit3, Trash2, Scale } from "lucide-react";
import Link from "next/link";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

/**
 * RecipeCard renders a single recipe's preview details and action buttons.
 * Uses kitchen-focused design system components.
 * @tenant-docs-export
 */
export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onDelete }) => {
  return (
    <div className="p-5 rounded-2xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] flex flex-col justify-between shadow-xl transition-all hover:scale-[1.01] hover:border-slate-700">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base font-bold text-slate-200 line-clamp-1">{recipe.title}</h3>
          {recipe.status === "PENDING_REVIEW" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
              Pending
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Yield: {recipe.yieldCount} {recipe.yieldUnit}
        </p>
        
        {recipe.sourceBook && (
          <p className="text-[10px] text-slate-500 mt-1">
            Source: <span className="text-slate-400">{recipe.sourceBook}</span>
            {recipe.sourcePageStart && ` (p. ${recipe.sourcePageStart})`}
          </p>
        )}

        {recipe.vessel && (
          <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1 font-semibold">
            <Scale className="w-3.5 h-3.5" /> Pan: {recipe.vessel.name}
          </p>
        )}
        <div className="text-xs text-slate-500 mt-3 line-clamp-2">
          {recipe.instructions.length} step{recipe.instructions.length !== 1 ? "s" : ""}:{" "}
          {recipe.instructions.map((step) => step.text).join(", ")}
        </div>
      </div>
      <div className="flex gap-2 mt-6 border-t border-slate-800/60 pt-4">
        <Link href={`/recipes/${recipe.id}`} className="flex-1">
          <button className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-slate-200 font-semibold cursor-pointer transition-colors">
            View & Scale
          </button>
        </Link>
        <Link href={`/recipes/${recipe.id}/kitchen`}>
          <button className="py-1.5 px-3 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 hover:text-emerald-300 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors">
            <Play className="w-3.5 h-3.5 fill-current" /> Run
          </button>
        </Link>
        <Link href={`/recipes/${recipe.id}/edit`}>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </Link>
        <button onClick={() => onDelete(recipe.id)} className="p-2 bg-red-950/20 hover:bg-red-900/30 rounded-lg text-red-400 cursor-pointer transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
