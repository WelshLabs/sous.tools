"use client";

import { Search, Loader2 } from "lucide-react";
import type React from "react";

export interface ComplianceSearchFormProps {
  query: string;
  setQuery: (q: string) => void;
  loading: boolean;
  onSearch: (e: React.FormEvent) => void;
}

export function ComplianceSearchForm({
  query,
  setQuery,
  loading,
  onSearch,
}: ComplianceSearchFormProps) {
  return (
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
  );
}
