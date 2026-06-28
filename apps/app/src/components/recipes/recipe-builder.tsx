"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RecipeBuilderIngredients } from "./recipe-builder-ingredients";
import { RecipeBuilderInstructions } from "./recipe-builder-instructions";

interface RecipeBuilderProps {
  recipeId?: string;
}

export const RecipeBuilder: React.FC<RecipeBuilderProps> = ({ recipeId }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [yieldCount, setYieldCount] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("Portions");
  const [vesselId, setVesselId] = useState("");
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [vessels, setVessels] = useState<VesselProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("APPROVED");

  useEffect(() => {
    // Fetch vessels
    fetch("/api/recipes/vessels")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setVessels(payload.data || []);
      });

    if (recipeId) {
      setLoading(true);
      fetch(`/api/recipes/${recipeId}`)
        .then((res) => res.json())
        .then((payload) => {
          if (payload.success && payload.data) {
            const rec = payload.data;
            setTitle(rec.title);
            setYieldCount(rec.yieldCount);
            setYieldUnit(rec.yieldUnit);
            setVesselId(rec.vesselId || "");
            setIngredients(rec.recipeIngredients || []);
            setSteps(rec.instructions || []);
            setStatus(rec.status || "APPROVED");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        recipe: { title, yieldCount, yieldUnit, vesselId: vesselId || null, instructions: steps, status },
        recipeIngredients: ingredients.map((ing) => ({
          masterIngredientId: ing.masterIngredientId,
          calculationType: ing.calculationType,
          baseCalculationGroup: ing.baseCalculationGroup,
          amount: ing.amount,
          unit: ing.unit,
          prepNotes: ing.prepNotes,
        })),
      };

      const method = recipeId ? "PUT" : "POST";
      const url = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) router.push("/recipes");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-5xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/recipes" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" /> {recipeId ? "Edit Recipe" : "Create Recipe"}
            </h2>
            <p className="text-xs text-slate-400">Configure yields, baseline flour groups, and step durations.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/recipes"><button type="button" className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer">Cancel</button></Link>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Recipe"}</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-400 font-medium mb-1">Recipe Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Traditional Sourdough Bread" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200" required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 font-medium mb-1">Default Yield</label>
          <input type="number" step="any" min="0.01" value={yieldCount} onChange={(e) => setYieldCount(parseFloat(e.target.value) || 1)} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200" required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 font-medium mb-1">Yield Unit</label>
          <input type="text" value={yieldUnit} onChange={(e) => setYieldUnit(e.target.value)} placeholder="e.g. loaves, portions" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200" required />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 font-medium mb-1">Default Vessel Profile (Optional)</label>
        <select value={vesselId} onChange={(e) => setVesselId(e.target.value)} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200">
          <option value="">None (Standard Yield Scaling only)</option>
          {vessels.map((v) => (
            <option key={v.id} value={v.id}>{v.name} ({v.volumeMl} ml)</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 font-medium mb-1">Recipe Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200">
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <RecipeBuilderIngredients lines={ingredients} onChange={setIngredients} />
      <RecipeBuilderInstructions steps={steps} onChange={setSteps} />
    </form>
  );
};
