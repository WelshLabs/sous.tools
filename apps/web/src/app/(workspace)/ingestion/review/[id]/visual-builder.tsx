"use client";

import React, { useState } from "react";
import { RecipeSection } from "./recipe-section";
import { VendorSection } from "./vendor-section";
import { toast } from "sonner";
import { type VisualBuilderProps } from "./visual-builder.types";
import { useAutoMapping } from "./use-auto-mapping";
import { useVisualBuilderData } from "./use-visual-builder-data";

export function VisualBuilder({
  editedData,
  onChange,
  disabled,
  organizationId,
}: VisualBuilderProps) {
  const { items, setItems, vendors } = useVisualBuilderData(organizationId);
  const [expandedRecipes, setExpandedRecipes] = useState<Record<number, boolean>>({});

  const handleCreateItem = async (name: string, index: number) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create item");
      const payload = await res.json();
      if (payload.success && payload.data) {
        const newItem = {
          id: payload.data.id,
          name: payload.data.name,
          each_weight_g: payload.data.each_weight_g || null,
        };
        setItems((prev) => [...prev, newItem]);

        const newData = { ...parsed };
        newData.items[index].itemId = newItem.id;
        newData.items[index]._requiresWeightInput = true;
        onChange(JSON.stringify(newData, null, 2));

        // @ts-expect-error - no types
        toast.success(`Created and mapped master item "${name}"`);
      } else {
        // @ts-expect-error - no types
        toast.error(payload.error || "Failed to create item");
      }
    } catch (err) {
      // @ts-expect-error - no types
      toast.error("Failed to create master item");
      console.error(err);
    }
  };

  const handleCreateRecipeItem = async (name: string, recipeIndex: number, ingIndex: number) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create item");
      const payload = await res.json();
      if (payload.success && payload.data) {
        const newItem = {
          id: payload.data.id,
          name: payload.data.name,
          each_weight_g: payload.data.each_weight_g || null,
        };
        setItems((prev) => [...prev, newItem]);

        const newData = { ...parsed };
        const targetRecipe = newData.recipes ? newData.recipes[recipeIndex] : newData;
        targetRecipe.ingredients[ingIndex].itemId = newItem.id;
        onChange(JSON.stringify(newData, null, 2));

        // @ts-expect-error - no types
        toast.success(`Created and mapped master ingredient "${name}"`);
      } else {
        // @ts-expect-error - no types
        toast.error(payload.error || "Failed to create item");
      }
    } catch (err) {
      // @ts-expect-error - no types
      toast.error("Failed to create master ingredient");
      console.error(err);
    }
  };

  let parsed: Record<string, unknown> = {};
  let parseError = false;
  try {
    parsed = JSON.parse(editedData) as Record<string, unknown>;
  } catch {
    parseError = true;
  }

  useAutoMapping({ parsed, parseError, items, disabled, onChange });

  if (parseError) {
    return (
      <div className="p-4 text-red-400">
        Invalid JSON data. Use JSON Editor to fix.
      </div>
    );
  }

  const recipes = (parsed.recipes
    ? parsed.recipes
    : parsed.title && parsed.ingredients
      ? [parsed]
      : []) as Array<Record<string, unknown>>;

  const handleIngredientUpdate = (
    recipeIndex: number,
    ingIndex: number,
    field: string,
    value: string | number | boolean | null,
  ) => {
    const newData = { ...parsed };
    const targetRecipe = (newData.recipes ? (newData.recipes as Record<string, unknown>[])[recipeIndex] : newData) as Record<string, unknown>;
    targetRecipe.ingredients[ingIndex][field] = value;
    onChange(JSON.stringify(newData, null, 2));
  };

  const toggleExpand = (i: number) => {
    setExpandedRecipes((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  if (parsed.vendorName && parsed.items) {
    return (
      <VendorSection
        parsed={parsed}
        disabled={disabled}
        items={items}
        handleCreateVendor={handleCreateVendor}
        handleInvoiceItemUpdate={handleInvoiceItemUpdate}
        handleCreateItem={handleCreateItem}
        onChange={onChange}
        vendors={vendors}
      />
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="p-4 text-zinc-500 dark:text-muted-foreground">
        No recipes or invoices found in data.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black/40 p-4 space-y-4">
      <RecipeSection
        recipes={recipes}
        expandedRecipes={expandedRecipes}
        toggleExpand={toggleExpand}
        disabled={disabled}
        items={items}
        handleIngredientUpdate={handleIngredientUpdate}
        handleCreateRecipeItem={handleCreateRecipeItem}
      />
    </div>
  );
}
