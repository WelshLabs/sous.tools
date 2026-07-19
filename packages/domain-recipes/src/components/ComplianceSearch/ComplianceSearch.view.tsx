"use client";

import React from "react";
import { X, Search, Loader2 } from "lucide-react";
import type { OpenFoodFactsProduct } from "./ComplianceSearch.container";

export interface ComplianceSearchViewProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: OpenFoodFactsProduct[];
  loading: boolean;
  error: string;
  onSearch: (e: React.FormEvent) => void;
  onSelectProduct: (prod: OpenFoodFactsProduct) => void;
}

export function ComplianceSearchView({
  isOpen,
  onClose,
  query,
  setQuery,
  results,
  loading,
  error,
  onSearch,
  onSelectProduct,
}: ComplianceSearchViewProps) {
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

        <form onSubmit={onSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food ingredients (e.g. Milk, Butter, Flour)..."
            className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--color-input)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}{" "}
            Search
          </button>
        </form>

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
              <button
                key={prod.code || Math.random().toString()}
                onClick={() => onSelectProduct(prod)}
                className="w-full text-left p-3 rounded-lg transition-all cursor-pointer flex justify-between items-center gap-4"
                style={{
                  backgroundColor: "rgb(30 41 59 / 0.50)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <h4
                    className="text-sm font-bold line-clamp-1"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {prod.product_name || prod.product_name_en || "Unnamed Product"}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {prod.brands || "Unknown Brand"}
                  </p>
                </div>
                <div
                  className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: "rgb(76 201 240 / 0.10)",
                    border: "1px solid rgb(76 201 240 / 0.20)",
                    color: "var(--color-primary)",
                  }}
                >
                  Select &amp; Auto-fill
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
