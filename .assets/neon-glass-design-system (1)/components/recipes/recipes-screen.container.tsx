"use client"

import * as React from "react"
import type { Recipe, RecipeFilter } from "@/lib/recipes/types"
import { RECIPES, countByFilter, filterRecipes, groupRecipes } from "@/lib/recipes/data"
import { RecipesScreenView } from "./recipes-screen.view"
import type { RecipeHandlers } from "./organisms/recipes-section"

/**
 * Container: owns all recipe state and app logic (filtering, grouping, POS-
 * backed mutations) and hands a fully-derived, presentational payload to
 * <RecipesScreenView />. This is the only place with behavior — the view and
 * every atom/molecule/organism below it stay pure.
 */
export function RecipesScreenContainer({ initialRecipes = RECIPES }: { initialRecipes?: Recipe[] }) {
  const [recipes, setRecipes] = React.useState<Recipe[]>(initialRecipes)
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<RecipeFilter>("all")

  const grouped = filter === "all"

  const counts = React.useMemo(() => countByFilter(recipes), [recipes])
  const groups = React.useMemo(() => groupRecipes(recipes, query), [recipes, query])
  const flat = React.useMemo(
    () => (grouped ? [] : filterRecipes(recipes, filter, query)),
    [grouped, recipes, filter, query],
  )

  const resultCount = grouped
    ? groups.pinned.length + groups.onMenu.length + groups.favorites.length + groups.others.length
    : flat.length

  /* ── Mutations (would hit the recipe service / POS in production) ──────── */
  const handlers = React.useMemo<RecipeHandlers>(
    () => ({
      onView: (id) => console.log("view recipe", id),
      onRun: (id) => console.log("run recipe", id),
      onEdit: (id) => console.log("edit recipe", id),
      onDelete: (id) => setRecipes((prev) => prev.filter((r) => r.id !== id)),
      onTogglePin: (id) =>
        setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isPinned: !r.isPinned } : r))),
      onToggleFavorite: (id) =>
        setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))),
    }),
    [],
  )

  const onResetFilters = React.useCallback(() => {
    setQuery("")
    setFilter("all")
  }, [])

  const onNewRecipe = React.useCallback(() => console.log("create recipe"), [])

  return (
    <RecipesScreenView
      query={query}
      onQueryChange={setQuery}
      filter={filter}
      onFilterChange={setFilter}
      counts={counts}
      resultCount={resultCount}
      totalOnMenu={counts["on-menu"]}
      grouped={grouped}
      groups={groups}
      flat={flat}
      handlers={handlers}
      onNewRecipe={onNewRecipe}
      onResetFilters={onResetFilters}
    />
  )
}
