import { Flame, CookingPot, CakeSlice, Salad, ChefHat, Wine, type LucideIcon } from "lucide-react"
import type { RecipeStation } from "@/lib/recipes/types"
import { cn } from "@/lib/utils"

/**
 * Atom: station identity.
 * Maps each kitchen station to a lucide icon + a semantic color token. The
 * token name (never a raw hex) is exported so other view pieces (card accent
 * bar, badges) can stay perfectly in sync with the glyph.
 */
export const STATION_VISUAL: Record<RecipeStation, { icon: LucideIcon; token: string }> = {
  grill: { icon: Flame, token: "--warning" },
  saute: { icon: CookingPot, token: "--primary" },
  pastry: { icon: CakeSlice, token: "--violet" },
  cold: { icon: Salad, token: "--accent" },
  prep: { icon: ChefHat, token: "--success" },
  bar: { icon: Wine, token: "--destructive" },
}

export function stationColor(station: RecipeStation): string {
  return `var(${STATION_VISUAL[station].token})`
}

const sizes = {
  sm: { box: "h-9 w-9 rounded-[var(--radius-sm)]", icon: "h-4 w-4" },
  md: { box: "h-11 w-11 rounded-[var(--radius-md)]", icon: "h-5 w-5" },
  lg: { box: "h-14 w-14 rounded-[var(--radius-md)]", icon: "h-7 w-7" },
} as const

export function StationGlyph({
  station,
  size = "md",
  className,
}: {
  station: RecipeStation
  size?: keyof typeof sizes
  className?: string
}) {
  const { icon: Icon } = STATION_VISUAL[station]
  const color = stationColor(station)
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex items-center justify-center border", sizes[size].box, className)}
      style={{
        color,
        backgroundColor: "var(--muted)",
        borderColor: "var(--border)",
      }}
    >
      <Icon className={sizes[size].icon} strokeWidth={2} />
    </span>
  )
}
