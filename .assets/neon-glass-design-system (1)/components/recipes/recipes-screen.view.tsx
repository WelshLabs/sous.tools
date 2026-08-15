"use client"

import { motion } from "framer-motion"
import { Pin, Radio, Star, UtensilsCrossed, Plus } from "lucide-react"
import type { Recipe, RecipeFilter, RecipeGroups } from "@/lib/recipes/types"
import { Button } from "@/components/ui/button"
import { RecipesToolbar } from "./organisms/recipes-toolbar"
import { RecipesSection, type RecipeHandlers } from "./organisms/recipes-section"
import { RecipesEmptyState } from "./molecules/recipes-empty-state"

const FILTER_META: Record<
  Exclude<RecipeFilter, "all">,
  { title: string; icon: React.ReactNode; tone: string }
> = {
  "on-menu": { title: "On the menu", icon: <Radio className="h-4 w-4" />, tone: "--success" },
  pinned: { title: "Pinned", icon: <Pin className="h-4 w-4" />, tone: "--primary" },
  favorites: { title: "Favorites", icon: <Star className="h-4 w-4" />, tone: "--warning" },
}

export interface RecipesScreenViewProps {
  query: string
  onQueryChange: (value: string) => void
  filter: RecipeFilter
  onFilterChange: (filter: RecipeFilter) => void
  counts: Record<RecipeFilter, number>
  resultCount: number
  totalOnMenu: number
  /** true → grouped browse layout; false → single filtered grid. */
  grouped: boolean
  groups: RecipeGroups
  flat: Recipe[]
  handlers: RecipeHandlers
  onNewRecipe: () => void
  onResetFilters: () => void
}

/**
 * View: pure layout for the recipes screen. Holds zero state — it renders
 * whatever the container computes and forwards every interaction upward.
 */
export function RecipesScreenView({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
  resultCount,
  totalOnMenu,
  grouped,
  groups,
  flat,
  handlers,
  onNewRecipe,
  onResetFilters,
}: RecipesScreenViewProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 pb-20 pt-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Recipes</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{counts.all}</span> recipes in your library ·{" "}
            <span className="inline-flex items-center gap-1 font-medium text-success">
              {totalOnMenu} live on the menu
            </span>
          </p>
        </div>
        <Button variant="gradient" onClick={onNewRecipe}>
          <Plus className="h-4 w-4" />
          New recipe
        </Button>
      </motion.header>

      <RecipesToolbar
        query={query}
        onQueryChange={onQueryChange}
        filter={filter}
        counts={counts}
        onFilterChange={onFilterChange}
        resultCount={resultCount}
      />

      {resultCount === 0 ? (
        <RecipesEmptyState onReset={onResetFilters} />
      ) : grouped ? (
        <div className="flex flex-col gap-10">
          <RecipesSection
            title="Pinned"
            description="Your daily go-to recipes, always one tap away."
            icon={<Pin className="h-4 w-4" />}
            accentTone="--primary"
            recipes={groups.pinned}
            emphasis="featured"
            density="featured"
            handlers={handlers}
          />
          <RecipesSection
            title="On the menu"
            description="Live on the POS right now — orders are streaming in."
            icon={<Radio className="h-4 w-4" />}
            accentTone="--success"
            recipes={groups.onMenu}
            emphasis="featured"
            density="featured"
            handlers={handlers}
          />
          <RecipesSection
            title="Favorites"
            description="Recipes you've starred for quick access."
            icon={<Star className="h-4 w-4" />}
            accentTone="--warning"
            recipes={groups.favorites}
            handlers={handlers}
          />
          <RecipesSection
            title="All recipes"
            description="The rest of your library — searchable and always available."
            icon={<UtensilsCrossed className="h-4 w-4" />}
            accentTone="--violet"
            recipes={groups.others}
            handlers={handlers}
          />
        </div>
      ) : (
        <RecipesSection
          title={query ? `Results for "${query}"` : FILTER_META[filter as Exclude<RecipeFilter, "all">].title}
          icon={
            query ? (
              <UtensilsCrossed className="h-4 w-4" />
            ) : (
              FILTER_META[filter as Exclude<RecipeFilter, "all">].icon
            )
          }
          accentTone={query ? "--primary" : FILTER_META[filter as Exclude<RecipeFilter, "all">].tone}
          recipes={flat}
          handlers={handlers}
        />
      )}
    </div>
  )
}
