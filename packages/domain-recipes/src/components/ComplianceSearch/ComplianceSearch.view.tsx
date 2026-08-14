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
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 transition-colors"
          style={{ color: "var(--color-muted-foreground)" }}
          aria-label="Close compliance search"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Search
            className="h-5 w-5"
            style={{ color: "var(--color-primary)" }}
          />
          Compliance Search (Open Food Facts)
        </h3>

        <form onSubmit={onSearch} className="mb-4 flex gap-2">
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
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}{" "}
            Search
          </button>
        </form>

        {error && (
          <div
            className="mb-3 text-xs"
            style={{ color: "var(--color-destructive)" }}
          >
            {error}
          </div>
        )}

        <div className="min-h-[250px] flex-1 space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex h-full items-center justify-center py-16">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
          ) : results.length === 0 ? (
            <div
              className="py-16 text-center text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Search for ingredients to auto-fill nutritional values.
            </div>
          ) : (
            results.map((prod) => (
              <button
                key={prod.code || Math.random().toString()}
                onClick={() => onSelectProduct(prod)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg p-3 text-left transition-all"
                style={{
                  backgroundColor: "rgb(30 41 59 / 0.50)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <h4
                    className="line-clamp-1 text-sm font-bold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {prod.product_name ||
                      prod.product_name_en ||
                      "Unnamed Product"}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {prod.brands || "Unknown Brand"}
                  </p>
                </div>
                <div
                  className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase"
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
