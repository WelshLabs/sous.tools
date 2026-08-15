import { Soup, Timer, Coins } from "lucide-react"
import type { Recipe } from "@/lib/recipes/types"
import { MetaStat } from "../atoms/meta-stat"

/**
 * Molecule: the core production stats every recipe shares — batch yield,
 * prep time, and plate cost. POS/live figures are handled separately by
 * <RecipeLiveStats /> so off-menu cards stay clean.
 */
export function RecipeMeta({ recipe }: { recipe: Recipe }) {
  const prep =
    recipe.prepMinutes >= 60
      ? `${Math.floor(recipe.prepMinutes / 60)}h${recipe.prepMinutes % 60 ? ` ${recipe.prepMinutes % 60}m` : ""}`
      : `${recipe.prepMinutes}m`

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <MetaStat icon={<Soup className="h-4 w-4" />} value={recipe.yield} tone="--muted-foreground" />
      <MetaStat icon={<Timer className="h-4 w-4" />} value={prep} tone="--muted-foreground" />
      <MetaStat
        icon={<Coins className="h-4 w-4" />}
        value={`$${recipe.costPerPortion.toFixed(2)}`}
        label="cost"
        tone="--muted-foreground"
      />
    </div>
  )
}
