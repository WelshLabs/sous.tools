"use client"

import type { RecipeFilter } from "@/lib/recipes/types"
import { RecipesSearch } from "../molecules/recipes-search"
import { RecipesFilterBar } from "../molecules/recipes-filter-bar"

/**
 * Organism: the sticky recipes toolbar — search + filter chips + result count.
 * Pure composition; all state lives in the container.
 */
export function RecipesToolbar({
  query,
  onQueryChange,
  filter,
  counts,
  onFilterChange,
  resultCount,
}: {
  query: string
  onQueryChange: (value: string) => void
  filter: RecipeFilter
  counts: Record<RecipeFilter, number>
  onFilterChange: (filter: RecipeFilter) => void
  resultCount: number
}) {
  return (
    <div className="ds-glass-strong sticky top-3 z-30 flex flex-col gap-4 rounded-[var(--radius-lg)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="lg:max-w-md lg:flex-1">
          <RecipesSearch value={query} onChange={onQueryChange} />
        </div>
        <div className="flex flex-1 items-center justify-between gap-4 lg:justify-end">
          <RecipesFilterBar active={filter} counts={counts} onChange={onFilterChange} />
          <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
            <span className="font-semibold tabular-nums text-foreground">{resultCount}</span> shown
          </span>
        </div>
      </div>
    </div>
  )
}
