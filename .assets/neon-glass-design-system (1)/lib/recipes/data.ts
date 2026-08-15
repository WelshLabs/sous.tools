import type { Recipe, RecipeFilter, RecipeGroups } from "./types"

/**
 * Mock service data. In production this is fed by the recipe service + live
 * POS socket; the shape is all the view layer depends on.
 */
export const RECIPES: Recipe[] = [
  {
    id: "r-001",
    name: "House Marinara",
    description: "Slow-simmered San Marzano base used across the pasta and pizza lines.",
    station: "saute",
    category: "Sauces",
    yield: "6 qt",
    prepMinutes: 90,
    costPerPortion: 0.82,
    menuPrice: null,
    isPinned: true,
    isFavorite: false,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "2h ago",
    allergens: [],
    updatedAt: "3 days ago",
  },
  {
    id: "r-002",
    name: "Brioche Burger Bun",
    description: "Enriched dough, egg-washed and baked in-house every morning.",
    station: "pastry",
    category: "Bakery",
    yield: "24 buns",
    prepMinutes: 240,
    costPerPortion: 0.41,
    menuPrice: null,
    isPinned: true,
    isFavorite: true,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "5h ago",
    allergens: ["Gluten", "Egg", "Dairy"],
    updatedAt: "1 week ago",
  },
  {
    id: "r-003",
    name: "Dry-Aged Ribeye",
    description: "16oz center-cut, reverse-seared with bone-marrow butter.",
    station: "grill",
    category: "Entrées",
    yield: "1 portion",
    prepMinutes: 25,
    costPerPortion: 18.4,
    menuPrice: 58,
    isPinned: false,
    isFavorite: true,
    isOnMenu: true,
    ordersToday: 34,
    lastRun: "8 min ago",
    allergens: ["Dairy"],
    updatedAt: "2 days ago",
  },
  {
    id: "r-004",
    name: "Truffle Tagliatelle",
    description: "Hand-cut pasta, parmesan cream, shaved black truffle.",
    station: "saute",
    category: "Pasta",
    yield: "1 portion",
    prepMinutes: 14,
    costPerPortion: 6.2,
    menuPrice: 32,
    isPinned: false,
    isFavorite: false,
    isOnMenu: true,
    ordersToday: 27,
    lastRun: "3 min ago",
    allergens: ["Gluten", "Dairy", "Egg"],
    updatedAt: "yesterday",
  },
  {
    id: "r-005",
    name: "Charred Octopus",
    description: "Spanish octopus, smoked paprika, salsa verde, fingerling potato.",
    station: "grill",
    category: "Starters",
    yield: "1 portion",
    prepMinutes: 40,
    costPerPortion: 7.9,
    menuPrice: 24,
    isPinned: false,
    isFavorite: false,
    isOnMenu: true,
    ordersToday: 18,
    lastRun: "22 min ago",
    allergens: ["Shellfish"],
    updatedAt: "4 days ago",
  },
  {
    id: "r-006",
    name: "Heirloom Tomato Salad",
    description: "Local heirlooms, burrata, basil oil, aged balsamic pearls.",
    station: "cold",
    category: "Salads",
    yield: "1 portion",
    prepMinutes: 8,
    costPerPortion: 4.1,
    menuPrice: 19,
    isPinned: false,
    isFavorite: true,
    isOnMenu: true,
    ordersToday: 12,
    lastRun: "35 min ago",
    allergens: ["Dairy"],
    updatedAt: "2 days ago",
  },
  {
    id: "r-007",
    name: "Negroni Sbagliato",
    description: "Campari, sweet vermouth, prosecco, flamed orange.",
    station: "bar",
    category: "Cocktails",
    yield: "1 drink",
    prepMinutes: 4,
    costPerPortion: 3.3,
    menuPrice: 16,
    isPinned: false,
    isFavorite: false,
    isOnMenu: true,
    ordersToday: 41,
    lastRun: "1 min ago",
    allergens: ["Sulfites"],
    updatedAt: "5 days ago",
  },
  {
    id: "r-008",
    name: "Confit Garlic Aioli",
    description: "Emulsified aioli built on slow-confit garlic and lemon.",
    station: "cold",
    category: "Sauces",
    yield: "1 qt",
    prepMinutes: 30,
    costPerPortion: 0.55,
    menuPrice: null,
    isPinned: true,
    isFavorite: false,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "1h ago",
    allergens: ["Egg"],
    updatedAt: "yesterday",
  },
  {
    id: "r-009",
    name: "Dark Chocolate Ganache",
    description: "70% Valrhona ganache for plated desserts and bonbons.",
    station: "pastry",
    category: "Desserts",
    yield: "2 qt",
    prepMinutes: 20,
    costPerPortion: 1.15,
    menuPrice: null,
    isPinned: false,
    isFavorite: true,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "6h ago",
    allergens: ["Dairy"],
    updatedAt: "3 days ago",
  },
  {
    id: "r-010",
    name: "Beef Demi-Glace",
    description: "48-hour roasted bone stock reduced to a silky demi.",
    station: "saute",
    category: "Sauces",
    yield: "3 qt",
    prepMinutes: 180,
    costPerPortion: 1.9,
    menuPrice: null,
    isPinned: false,
    isFavorite: false,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "yesterday",
    allergens: [],
    updatedAt: "1 week ago",
  },
  {
    id: "r-011",
    name: "Miso-Glazed Cod",
    description: "Black cod marinated 48h in white miso, sake, mirin.",
    station: "grill",
    category: "Entrées",
    yield: "1 portion",
    prepMinutes: 18,
    costPerPortion: 9.6,
    menuPrice: 38,
    isPinned: false,
    isFavorite: false,
    isOnMenu: true,
    ordersToday: 21,
    lastRun: "12 min ago",
    allergens: ["Fish", "Soy"],
    updatedAt: "2 days ago",
  },
  {
    id: "r-012",
    name: "Sourdough Starter Feed",
    description: "Daily levain maintenance for the bread program.",
    station: "prep",
    category: "Bakery",
    yield: "Batch",
    prepMinutes: 10,
    costPerPortion: 0.12,
    menuPrice: null,
    isPinned: true,
    isFavorite: false,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "7h ago",
    allergens: ["Gluten"],
    updatedAt: "today",
  },
  {
    id: "r-013",
    name: "Pickled Shallots",
    description: "Quick-pickle for garnish across cold and grill stations.",
    station: "prep",
    category: "Garnish",
    yield: "2 qt",
    prepMinutes: 15,
    costPerPortion: 0.2,
    menuPrice: null,
    isPinned: false,
    isFavorite: false,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "2 days ago",
    allergens: [],
    updatedAt: "4 days ago",
  },
  {
    id: "r-014",
    name: "Espresso Martini",
    description: "Vodka, cold-brew, coffee liqueur, shaken to a tight foam.",
    station: "bar",
    category: "Cocktails",
    yield: "1 drink",
    prepMinutes: 3,
    costPerPortion: 2.8,
    menuPrice: 17,
    isPinned: false,
    isFavorite: false,
    isOnMenu: true,
    ordersToday: 29,
    lastRun: "6 min ago",
    allergens: [],
    updatedAt: "6 days ago",
  },
  {
    id: "r-015",
    name: "Lemon Curd",
    description: "Silky curd for tarts, cakes, and plated desserts.",
    station: "pastry",
    category: "Desserts",
    yield: "1.5 qt",
    prepMinutes: 25,
    costPerPortion: 0.7,
    menuPrice: null,
    isPinned: false,
    isFavorite: false,
    isOnMenu: false,
    ordersToday: 0,
    lastRun: "3 days ago",
    allergens: ["Egg", "Dairy"],
    updatedAt: "1 week ago",
  },
  {
    id: "r-016",
    name: "Crispy Duck Confit",
    description: "Leg confit in duck fat, crisped à la minute, cherry gastrique.",
    station: "saute",
    category: "Entrées",
    yield: "1 portion",
    prepMinutes: 30,
    costPerPortion: 8.2,
    menuPrice: 42,
    isPinned: false,
    isFavorite: true,
    isOnMenu: true,
    ordersToday: 16,
    lastRun: "18 min ago",
    allergens: [],
    updatedAt: "yesterday",
  },
]

/* ── Pure selectors ──────────────────────────────────────────────────────── */

/** Case-insensitive match across the fields a chef would search by. */
export function matchesQuery(recipe: Recipe, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    recipe.name.toLowerCase().includes(q) ||
    recipe.category.toLowerCase().includes(q) ||
    recipe.station.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q)
  )
}

/** Flat list for an explicit filter (used when a filter/search is active). */
export function filterRecipes(recipes: Recipe[], filter: RecipeFilter, query: string): Recipe[] {
  return recipes.filter((r) => {
    if (!matchesQuery(r, query)) return false
    switch (filter) {
      case "on-menu":
        return r.isOnMenu
      case "pinned":
        return r.isPinned
      case "favorites":
        return r.isFavorite
      default:
        return true
    }
  })
}

/**
 * Prioritized grouping for the default view. Each recipe lands in exactly one
 * bucket by priority: pinned → on-menu → favorite → everything else. This is
 * what keeps daily/live recipes prominent and the long tail "accessible but
 * not in your face".
 */
export function groupRecipes(recipes: Recipe[], query: string): RecipeGroups {
  const visible = recipes.filter((r) => matchesQuery(r, query))
  const groups: RecipeGroups = { pinned: [], onMenu: [], favorites: [], others: [] }
  for (const r of visible) {
    if (r.isPinned) groups.pinned.push(r)
    else if (r.isOnMenu) groups.onMenu.push(r)
    else if (r.isFavorite) groups.favorites.push(r)
    else groups.others.push(r)
  }
  return groups
}

export function countByFilter(recipes: Recipe[]): Record<RecipeFilter, number> {
  return {
    all: recipes.length,
    "on-menu": recipes.filter((r) => r.isOnMenu).length,
    pinned: recipes.filter((r) => r.isPinned).length,
    favorites: recipes.filter((r) => r.isFavorite).length,
  }
}
