"use client";

import React, { useState, useEffect } from "react";
import { Recipe } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { ChefHat, Plus, Trash2, Edit3, Play, Loader2, Scale } from "lucide-react";
import Link from "next/link";

export const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const payload = await res.json();
        if (payload.success) setRecipes(payload.data || []);
      }
    } catch (err) {
      console.error("Failed to load recipes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecipes();
  };

  return (
    <div className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-5xl mx-auto animate-fade-in">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" /> Recipe Inventory
          </h2>
          <p className="text-xs text-slate-400">Scale yields, toggle vessel profiles, and run Active Kitchen timers.</p>
        </div>
        <Link href="/recipes/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1 inline" /> Create Recipe
          </Button>
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No recipes found. Click 'Create Recipe' to begin.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((rec) => (
            <div key={rec.id} className="p-5 rounded-2xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] flex flex-col justify-between shadow-xl transition-all hover:scale-[1.01] hover:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-200 line-clamp-1">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Yield: {rec.yieldCount} {rec.yieldUnit}
                </p>
                {rec.vessel && (
                  <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1 font-semibold">
                    <Scale className="w-3.5 h-3.5" /> Pan: {rec.vessel.name}
                  </p>
                )}
                <div className="text-xs text-slate-500 mt-3 line-clamp-2">
                  {rec.instructions.length} step{rec.instructions.length !== 1 ? "s" : ""}:{" "}
                  {rec.instructions.map((step) => step.text).join(", ")}
                </div>
              </div>
              <div className="flex gap-2 mt-6 border-t border-slate-800/60 pt-4">
                <Link href={`/recipes/${rec.id}`} className="flex-1">
                  <button className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-slate-200 font-semibold cursor-pointer transition-colors">
                    View & Scale
                  </button>
                </Link>
                <Link href={`/recipes/${rec.id}/kitchen`}>
                  <button className="py-1.5 px-3 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 hover:text-emerald-300 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors">
                    <Play className="w-3 h-3 fill-current" /> Run
                  </button>
                </Link>
                <Link href={`/recipes/${rec.id}/edit`}>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button onClick={() => handleDelete(rec.id)} className="p-2 bg-red-950/20 hover:bg-red-900/30 rounded-lg text-red-400 cursor-pointer transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
