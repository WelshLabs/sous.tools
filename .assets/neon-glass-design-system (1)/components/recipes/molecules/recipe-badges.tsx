import { TriangleAlert } from "lucide-react"
import type { Recipe } from "@/lib/recipes/types"
import { STATION_LABEL } from "@/lib/recipes/types"
import { RecipeBadge } from "../atoms/recipe-badge"
import { LiveDot } from "../atoms/live-dot"
import { stationColor } from "../atoms/station-glyph"

/**
 * Molecule: the row of status badges for a recipe — live "On menu" state,
 * station label, and an allergen flag. Composition only; no logic.
 */
export function RecipeBadges({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {recipe.isOnMenu && (
        <RecipeBadge tone="--success" icon={<LiveDot tone="--success" />}>
          On menu
        </RecipeBadge>
      )}
      <span style={{ ["--station" as string]: stationColor(recipe.station) }}>
        <RecipeBadge tone="--station">{STATION_LABEL[recipe.station]}</RecipeBadge>
      </span>
      <RecipeBadge plain>{recipe.category}</RecipeBadge>
      {recipe.allergens.length > 0 && (
        <RecipeBadge tone="--warning" icon={<TriangleAlert className="h-3 w-3" />}>
          {recipe.allergens.length} allergen{recipe.allergens.length > 1 ? "s" : ""}
        </RecipeBadge>
      )}
    </div>
  )
}
