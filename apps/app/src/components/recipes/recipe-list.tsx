"use client";

import React, { useState, useEffect } from "react";
import { Recipe, RecipeCategory, RecipeTag } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { ChefHat, Plus, Loader2, Scale } from "lucide-react";
import Link from "next/link";
import { UploadDropdown } from "../integrations/upload-dropdown";
import { VesselManager } from "./vessel-manager";
import { RecipeCard } from "./recipe-card";
import { RecipeFilter } from "./recipe-filter";

/**
 * RecipeList manages recipe collection state, filtering controls, and ingestion options.
 * @tenant-docs-export
 */
export const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [tags, setTags] = useState<RecipeTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVesselManagerOpen, setIsVesselManagerOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED">("APPROVED");
  const [searchQuery, setSearchQuery] = useState("");

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

  const fetchMetadata = async () => {
    try {
      const [catRes, tagRes, statusRes] = await Promise.all([
        fetch("/api/recipes-meta/categories"),
        fetch("/api/recipes-meta/tags"),
        fetch("/api/integrations/status"),
      ]);
      if (catRes.ok) {
        const payload = await catRes.json();
        if (payload.success) setCategories(payload.data || []);
      }
      if (tagRes.ok) {
        const payload = await tagRes.json();
        if (payload.success) setTags(payload.data || []);
      }
      if (statusRes.ok) {
        const payload = await statusRes.json();
        if (payload.success && Array.isArray(payload.data)) {
          const google = payload.data.find((i: any) => i.provider === "GOOGLE");
          setIsGoogleConnected(!!google?.connected);
        }
      }
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchMetadata();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecipes();
  };


  const filteredRecipes = recipes.filter((rec) => {
    if (selectedStatus !== "ALL" && (rec.status || "PENDING_REVIEW") !== selectedStatus) return false;
    if (selectedCategory && rec.categoryId !== selectedCategory) return false;
    if (selectedTag && (!rec.tagIds || !rec.tagIds.includes(selectedTag))) return false;
    if (searchQuery && !rec.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-zinc-900 dark:text-slate-100 max-w-5xl mx-auto animate-fade-in">
      <header className="flex flex-wrap gap-4 justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" /> Recipes
          </h2>
          <p className="text-xs text-slate-400">Scale yields, toggle vessel profiles, and run Active Kitchen timers.</p>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setIsVesselManagerOpen(true)} className="text-sm font-semibold h-9 px-3 rounded-md border border-white/20 bg-transparent text-white hover:bg-black/10 dark:bg-white/10 flex items-center transition-colors cursor-pointer">
            <Scale className="w-4 h-4 mr-1.5" /> Manage Vessels
          </button>
          <UploadDropdown documentType="RECIPE" isGoogleConnected={isGoogleConnected} />
          <Link href="/recipes/new"><Button size="sm"><Plus className="w-4 h-4 mr-1 inline" /> Create Recipe</Button></Link>
        </div>
      </header>

      <RecipeFilter 
        categories={categories} 
        tags={tags} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        selectedTag={selectedTag} 
        onSelectTag={setSelectedTag} 
        selectedStatus={selectedStatus} 
        onSelectStatus={setSelectedStatus} 
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No recipes match current filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((rec) => (
            <RecipeCard key={rec.id} recipe={rec} onDelete={handleDelete} />
          ))}
        </div>
      )}
      
      <VesselManager isOpen={isVesselManagerOpen} onClose={() => setIsVesselManagerOpen(false)} />
    </div>
  );
};
