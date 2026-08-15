"use client"

import { LayoutGrid, Radio, Pin, Star } from "lucide-react"
import type { RecipeFilter } from "@/lib/recipes/types"
import { Chip } from "@/components/ui/chip"

const FILTERS: { value: RecipeFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: "on-menu", label: "On menu", icon: <Radio className="h-3.5 w-3.5" /> },
  { value: "pinned", label: "Pinned", icon: <Pin className="h-3.5 w-3.5" /> },
  { value: "favorites", label: "Favorites", icon: <Star className="h-3.5 w-3.5" /> },
]

/**
 * Molecule: filter chips with live counts. Controlled by the container.
 * Composition of the design-system <Chip /> atom only.
 */
export function RecipesFilterBar({
  active,
  counts,
  onChange,
}: {
  active: RecipeFilter
  counts: Record<RecipeFilter, number>
  onChange: (filter: RecipeFilter) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter recipes">
      {FILTERS.map((f) => (
        <Chip
          key={f.value}
          role="tab"
          aria-selected={active === f.value}
          selected={active === f.value}
          icon={f.icon}
          onClick={() => onChange(f.value)}
        >
          {f.label}
          <span className="ml-1 tabular-nums opacity-70">{counts[f.value]}</span>
        </Chip>
      ))}
    </div>
  )
}
