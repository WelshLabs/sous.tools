"use client"

import { motion } from "framer-motion"
import { Pin, Star, Clock } from "lucide-react"
import type { Recipe } from "@/lib/recipes/types"
import { cn } from "@/lib/utils"
import { StationGlyph } from "../atoms/station-glyph"
import { ToggleIconButton } from "../atoms/toggle-icon-button"
import { RecipeBadges } from "../molecules/recipe-badges"
import { RecipeMeta } from "../molecules/recipe-meta"
import { RecipeLiveStats } from "../molecules/recipe-live-stats"
import { RecipeCardActions, type RecipeActionHandlers } from "../molecules/recipe-card-actions"

export interface RecipeCardProps extends RecipeActionHandlers {
  recipe: Recipe
  /** Featured cards (pinned / on-menu) are roomier and carry a soft glow. */
  emphasis?: "featured" | "default"
  onTogglePin: () => void
  onToggleFavorite: () => void
}

/**
 * Organism: a single recipe card. Pure view — every piece of state and every
 * handler arrives via props from the container. Composes the station glyph,
 * toggle atoms, badge / meta / live-stat molecules, and the action row.
 */
export function RecipeCard({
  recipe,
  emphasis = "default",
  onView,
  onRun,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleFavorite,
}: RecipeCardProps) {
  const featured = emphasis === "featured"

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/72 shadow-sm backdrop-blur-xl transition-[border-color,box-shadow] duration-[--ds-duration] hover:border-primary/25 hover:shadow-md",
        featured && "border-primary/20 bg-card/88",
      )}
    >
      <span aria-hidden="true" className="absolute inset-y-5 left-0 w-0.5 rounded-r-full bg-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <StationGlyph station={recipe.station} size={featured ? "lg" : "md"} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-semibold tracking-tight text-foreground">
              {recipe.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated {recipe.updatedAt}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ToggleIconButton
              active={recipe.isPinned}
              onToggle={onTogglePin}
              label={recipe.isPinned ? "Unpin recipe" : "Pin recipe"}
              tone="--primary"
              activeIcon={<Pin className="h-4 w-4 fill-current" />}
              inactiveIcon={<Pin className="h-4 w-4" />}
            />
            <ToggleIconButton
              active={recipe.isFavorite}
              onToggle={onToggleFavorite}
              label={recipe.isFavorite ? "Remove favorite" : "Add favorite"}
              tone="--warning"
              activeIcon={<Star className="h-4 w-4 fill-current" />}
              inactiveIcon={<Star className="h-4 w-4" />}
            />
          </div>
        </div>

        <RecipeBadges recipe={recipe} />

        {featured && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
        )}

        <RecipeMeta recipe={recipe} />

        <RecipeLiveStats recipe={recipe} />

        {/* Push actions to the bottom so cards in a row align */}
        <div className="mt-auto flex flex-col gap-4 pt-1">
          <span className="h-px w-full bg-border" />
          <RecipeCardActions onView={onView} onRun={onRun} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </motion.article>
  )
}
