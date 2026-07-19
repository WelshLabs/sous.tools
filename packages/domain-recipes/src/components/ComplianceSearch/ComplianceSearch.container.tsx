"use client";

import React, { useState } from "react";
import { ComplianceSearchView } from "./ComplianceSearch.view";

/** Nutrition macro summary returned from a compliance search product. */
export interface ComplianceNutritionMacros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** The data emitted by the ComplianceSearch onSelect callback. */
export interface ComplianceSearchResult {
  name: string;
  nutritionMacros: ComplianceNutritionMacros;
  allergens: string[];
}

/**
 * Props for the ComplianceSearch component.
 */
export interface ComplianceSearchProps {
  /** Whether the modal is rendered. */
  isOpen: boolean;
  /** Called when the user dismisses the modal. */
  onClose: () => void;
  /**
   * Called when the user selects a product from the Open Food Facts results.
   * The app layer maps the result into the recipe ingredient form.
   */
  onSelect: (data: ComplianceSearchResult) => void;
}

/** A raw product result from the Open Food Facts API. */
export interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  nutriments?: Record<string, number>;
  allergens_tags?: string[];
}

/**
 * ComplianceSearch — a modal dialog for searching Open Food Facts to
 * auto-fill ingredient nutritional values.
 *
 * Uses the `--color-card` glass surface with a `--color-border` frame.
 * The search button uses `--color-primary` (cyan) to match the design system.
 *
 * **Presentation boundary**: HTTP calls go to the public Open Food Facts API
 * (not the sous.tools backend), which is acceptable for a public compliance
 * search. No Supabase or `process.env` usage.
 *
 * @tenant-docs-export
 * # ComplianceSearch
 * ```tsx
 * import { ComplianceSearch } from "@soustools/domain-recipes";
 *
 * <ComplianceSearch
 *   isOpen={isComplianceOpen}
 *   onClose={() => setComplianceOpen(false)}
 *   onSelect={handleComplianceSelect}
 * />
 * ```
 */
export function ComplianceSearch({
  isOpen,
  onClose,
  onSelect,
}: ComplianceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenFoodFactsProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query,
        )}&search_simple=1&action=process&json=1`,
      );
      if (res.ok) {
        const data = (await res.json()) as { products?: OpenFoodFactsProduct[] };
        setResults(data.products || []);
      } else {
        setError("Failed to fetch data from Open Food Facts.");
      }
    } catch {
      setError("Network error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (prod: OpenFoodFactsProduct) => {
    const nutriments = prod.nutriments || {};
    const calories = Math.round(
      Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0),
    );
    const proteinG =
      Math.round(
        Number(nutriments.proteins_100g || nutriments.proteins || 0) * 10,
      ) / 10;
    const carbsG =
      Math.round(
        Number(
          nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
        ) * 10,
      ) / 10;
    const fatG =
      Math.round(Number(nutriments.fat_100g || nutriments.fat || 0) * 10) / 10;

    const allergenTags = prod.allergens_tags || [];
    const cleanAllergens = allergenTags.map((tag) =>
      tag.replace("en:", "").toLowerCase().replace("-", " "),
    );

    onSelect({
      name: prod.product_name || prod.product_name_en || query,
      nutritionMacros: { calories, proteinG, carbsG, fatG },
      allergens: cleanAllergens,
    });
    onClose();
  };

  return (
    <ComplianceSearchView
      isOpen={isOpen}
      onClose={onClose}
      query={query}
      setQuery={setQuery}
      results={results}
      loading={loading}
      error={error}
      onSearch={handleSearch}
      onSelectProduct={handleSelectProduct}
    />
  );
}
