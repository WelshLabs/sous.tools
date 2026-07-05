"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeBuilder } from "@soustools/domain-recipes";
import { Recipe, VesselProfile, MasterIngredient } from "@soustools/api-types";
import { toast } from "sonner";

export interface RecipeBuilderClientProps {
  initialData?: Recipe | null;
  vessels: VesselProfile[];
  masterIngredients: MasterIngredient[];
}

export function RecipeBuilderClient({
  initialData,
  vessels,
  masterIngredients,
}: RecipeBuilderClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload: any) => {
    setSaving(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/recipes/${initialData.id}` : "/api/recipes";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? "Recipe updated" : "Recipe created");
        router.push("/recipes");
      } else {
        const error = await res.json();
        toast.error(`Failed to save: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving recipe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RecipeBuilder
      initialData={initialData}
      vessels={vessels}
      masterIngredients={masterIngredients}
      loading={saving}
      onSave={handleSave}
      backHref="/recipes"
    />
  );
}
