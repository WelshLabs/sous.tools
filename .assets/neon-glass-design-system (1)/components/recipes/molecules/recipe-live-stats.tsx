import { Receipt, Tag } from "lucide-react"
import type { Recipe } from "@/lib/recipes/types"
import { MetaStat } from "../atoms/meta-stat"
import { LiveDot } from "../atoms/live-dot"

/**
 * Molecule: live POS figures shown only for on-menu recipes — menu price,
 * gross margin, and today's ticket count streaming from the POS feed.
 */
export function RecipeLiveStats({ recipe }: { recipe: Recipe }) {
  if (!recipe.isOnMenu || recipe.menuPrice == null) return null

  const margin = Math.round(((recipe.menuPrice - recipe.costPerPortion) / recipe.menuPrice) * 100)

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-border/70 bg-[color-mix(in_srgb,var(--success)_7%,transparent)] px-3 py-2"
      style={{ borderColor: "color-mix(in srgb, var(--success) 26%, transparent)" }}
    >
      <div className="flex items-center gap-4">
        <MetaStat icon={<Tag className="h-4 w-4" />} value={`$${recipe.menuPrice}`} tone="--success" />
        <MetaStat value={`${margin}%`} icon={<span className="text-xs font-semibold">GM</span>} tone="--success" label="margin" />
      </div>
      <div className="flex items-center gap-1.5">
        <LiveDot tone="--success" />
        <span className="text-sm font-semibold text-foreground">{recipe.ordersToday}</span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Receipt className="h-3.5 w-3.5" /> today
        </span>
      </div>
    </div>
  )
}
