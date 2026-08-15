/**
 * Recipes domain model
 * ─────────────────────────────────────────────────────────────────────────
 * Pure data contracts for the Recipes feature. No React / view concerns here
 * (kept separate per our Container/View split).
 */

export type RecipeStation = "grill" | "saute" | "pastry" | "cold" | "prep" | "bar"

export type RecipeFilter = "all" | "on-menu" | "pinned" | "favorites"

export interface Recipe {
  id: string
  name: string
  description: string
  station: RecipeStation
  category: string
  /** Batch yield, e.g. "12 portions". */
  yield: string
  prepMinutes: number
  /** Plate cost used by the POS margin calc. */
  costPerPortion: number
  /** Live menu price when on the POS; null when off-menu. */
  menuPrice: number | null
  isPinned: boolean
  isFavorite: boolean
  isOnMenu: boolean
  /** Live count of tickets fired today (from the POS feed). */
  ordersToday: number
  /** Human-relative "last cooked" label. */
  lastRun: string
  allergens: string[]
  /** Human-relative "updated" label. */
  updatedAt: string
}

/** Grouped buckets used by the default (unfiltered) screen layout. */
export interface RecipeGroups {
  pinned: Recipe[]
  onMenu: Recipe[]
  favorites: Recipe[]
  others: Recipe[]
}

/** Display labels for stations (domain-level copy, not styling). */
export const STATION_LABEL: Record<RecipeStation, string> = {
  grill: "Grill",
  saute: "Sauté",
  pastry: "Pastry",
  cold: "Garde Manger",
  prep: "Prep",
  bar: "Bar",
}
