import type { OmnibarEvent } from "./types"

export const OMNIBAR_SUGGESTIONS = [
  "How did dinner service perform?",
  "Add this invoice to inventory",
  "Scale the mushroom recipe to 80",
  "Which menu items need attention?",
]

export const OMNIBAR_DEMO_EVENTS: OmnibarEvent[] = [
  { id: "u1", type: "user", text: "How did dinner service perform compared with last Friday?", createdAt: "8:42 PM" },
  { id: "a1", type: "activity", title: "Reviewing dinner service", detail: "Queried POS sales, labor, comps, and menu mix for 5–10 PM.", status: "complete" },
  { id: "m1", type: "metrics", title: "Dinner service snapshot", metrics: [
    { label: "Net sales", value: "$18,420", change: "+8.4%" },
    { label: "Covers", value: "312", change: "+21" },
    { label: "Avg. check", value: "$59.04", change: "+1.2%" },
  ] },
  { id: "r1", type: "agent", text: "Dinner finished ahead of last Friday. Sales grew faster than covers, driven by stronger beverage attachment and the mushroom entrée. Labor finished at 27.8%, just inside your target.", createdAt: "8:42 PM" },
]
