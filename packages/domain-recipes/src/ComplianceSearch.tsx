"use client";

import React from "react";
import { useState } from "react";
import { X, Search, Loader2 } from "lucide-react";

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgb(0 0 0 / 0.75)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
          aria-label="Close compliance search"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          Compliance Search (Open Food Facts)
        </h3>

        <ComplianceSearchForm
          query={query}
          setQuery={setQuery}
          loading={loading}
          onSearch={handleSearch}
        />

        {error && (
          <div
            className="text-xs mb-3"
            style={{ color: "var(--color-destructive)" }}
          >
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
          {loading ? (
            <div className="flex justify-center items-center h-full py-16">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
          ) : results.length === 0 ? (
            <div
              className="text-center py-16 text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Search for ingredients to auto-fill nutritional values.
            </div>
          ) : (
            results.map((prod) => (
              <ComplianceSearchResultItem
                key={prod.code || Math.random().toString()}
                prod={prod}
                onSelectProduct={handleSelectProduct}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
