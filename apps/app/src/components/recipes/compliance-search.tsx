"use client";

import React, { useState } from "react";
import { X, Search, Loader2 } from "lucide-react";

interface ComplianceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: {
    name: string;
    nutritionMacros: { calories: number; proteinG: number; carbsG: number; fatG: number };
    allergens: string[];
  }) => void;
}

export const ComplianceSearch: React.FC<ComplianceSearchProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
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
          query
        )}&search_simple=1&action=process&json=1`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.products || []);
      } else {
        setError("Failed to fetch data from Open Food Facts.");
      }
    } catch (err) {
      setError("Network error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (prod: any) => {
    const nutriments = prod.nutriments || {};
    const calories = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0));
    const proteinG = Math.round(Number(nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10;
    const carbsG = Math.round(Number(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10;
    const fatG = Math.round(Number(nutriments.fat_100g || nutriments.fat || 0) * 10) / 10;

    // Map allergen tags to simple lowercase words
    const allergenTags = prod.allergens_tags || [];
    const cleanAllergens = allergenTags.map((tag: string) =>
      tag.replace("en:", "").toLowerCase().replace("-", " ")
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-400" /> Compliance Search (Open Food Facts)
        </h3>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food ingredients (e.g. Milk, Butter, Flour)..." className="flex-1 bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" required />
          <button type="submit" disabled={loading} className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
          </button>
        </form>

        {error && <div className="text-red-400 text-xs mb-3">{error}</div>}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
          {loading ? (
            <div className="flex justify-center items-center h-full py-16"><Loader2 className="w-8 h-8 animate-spin text-sky-400" /></div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500">Search for ingredients to auto-fill nutritional values.</div>
          ) : (
            results.map((prod) => (
              <button key={prod.code || Math.random()} onClick={() => handleSelectProduct(prod)} className="w-full text-left p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex justify-between items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{prod.product_name || prod.product_name_en || "Unnamed Product"}</h4>
                  <p className="text-xs text-slate-400">{prod.brands || "Unknown Brand"}</p>
                </div>
                <div className="text-[10px] bg-sky-950/40 border border-sky-900/30 text-sky-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
                  Select & Auto-fill
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
