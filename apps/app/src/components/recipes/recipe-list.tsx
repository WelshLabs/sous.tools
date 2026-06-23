"use client";

import React, { useState, useEffect } from "react";
import { Recipe, RecipeCategory, RecipeTag } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { ChefHat, Plus, Loader2, Scale, CloudDownload, Camera, Upload } from "lucide-react";
import Link from "next/link";
import { GoogleDriveBrowser } from "../integrations/google-drive-browser";
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
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isVesselManagerOpen, setIsVesselManagerOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED">("APPROVED");

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
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((device) => device.kind === "videoinput");
          setHasCamera(videoDevices.length > 0);
        })
        .catch(() => setHasCamera(false));
    } else {
      setHasCamera(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecipes();
  };

  const handleIngestUpload = async (e: React.ChangeEvent<HTMLInputElement>, source: "camera" | "upload") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const { supabase } = await import("../../lib/supabase");
        const session = await supabase.auth.getSession();
        await fetch("/api/ingestion/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: "d0000000-0000-0000-0000-000000000000",
            userId: session.data.session?.user?.id,
            source,
            documentType: "recipe",
            imagesBase64: [base64.split(",")[1]],
          }),
        });
        alert(`${source === "camera" ? "Photo" : "File"} uploaded to ingestion queue.`);
      } catch (err) {
        console.error(err);
        alert(`Failed to queue ${source === "camera" ? "photo" : "file"}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredRecipes = recipes.filter((rec) => {
    if (selectedStatus !== "ALL" && (rec.status || "PENDING_REVIEW") !== selectedStatus) return false;
    if (selectedCategory && rec.categoryId !== selectedCategory) return false;
    if (selectedTag && (!rec.tagIds || !rec.tagIds.includes(selectedTag))) return false;
    return true;
  });

  return (
    <div className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-5xl mx-auto animate-fade-in">
      <header className="flex flex-wrap gap-4 justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" /> Recipe Inventory
          </h2>
          <p className="text-xs text-slate-400">Scale yields, toggle vessel profiles, and run Active Kitchen timers.</p>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setIsVesselManagerOpen(true)} className="text-sm font-semibold h-9 px-3 rounded-md border border-white/20 bg-transparent text-white hover:bg-white/10 flex items-center transition-colors cursor-pointer">
            <Scale className="w-4 h-4 mr-1.5" /> Manage Vessels
          </button>
          <button onClick={() => setIsImportMenuOpen(!isImportMenuOpen)} className="text-sm font-semibold h-9 px-3 rounded-md border border-white/20 bg-transparent text-white hover:bg-white/10 flex items-center transition-colors cursor-pointer">
            <CloudDownload className="w-4 h-4 mr-1.5" /> Import
          </button>
          {isImportMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsImportMenuOpen(false)} />
              <div className="absolute top-10 left-0 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2">
                <button disabled={!isGoogleConnected} onClick={() => { if (!isGoogleConnected) return; setIsDriveOpen(true); setIsImportMenuOpen(false); }} className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 transition-colors text-left ${isGoogleConnected ? "hover:bg-white/5 hover:text-white cursor-pointer" : "opacity-40 cursor-not-allowed"}`}>
                  <CloudDownload className="w-4 h-4" /> Google Drive
                </button>
                <button disabled={!hasCamera} onClick={() => { if (!hasCamera) return; document.getElementById('camera-upload')?.click(); setIsImportMenuOpen(false); }} className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 transition-colors text-left ${hasCamera ? "hover:bg-white/5 hover:text-white cursor-pointer" : "opacity-40 cursor-not-allowed"}`}>
                  <Camera className="w-4 h-4" /> Take Photo
                </button>
                <button onClick={() => { document.getElementById('file-upload')?.click(); setIsImportMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload File
                </button>
              </div>
            </>
          )}
          <input type="file" accept="image/*" capture="environment" id="camera-upload" className="hidden" onChange={(e) => handleIngestUpload(e, "camera")} />
          <input type="file" accept="image/*,application/pdf" id="file-upload" className="hidden" onChange={(e) => handleIngestUpload(e, "upload")} />
          <Link href="/recipes/new"><Button size="sm"><Plus className="w-4 h-4 mr-1 inline" /> Create Recipe</Button></Link>
        </div>
      </header>

      <RecipeFilter categories={categories} tags={tags} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} selectedTag={selectedTag} onSelectTag={setSelectedTag} selectedStatus={selectedStatus} onSelectStatus={setSelectedStatus} />

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
      
      <GoogleDriveBrowser isOpen={isDriveOpen} onClose={() => setIsDriveOpen(false)} />
      <VesselManager isOpen={isVesselManagerOpen} onClose={() => setIsVesselManagerOpen(false)} />
    </div>
  );
};
