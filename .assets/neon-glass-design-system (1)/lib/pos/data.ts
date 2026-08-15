export type PosCategory = "Popular" | "Mains" | "Sides" | "Drinks" | "Dessert"
export type OrderType = "Dine in" | "Takeout"
export type PosItem = { id: string; name: string; description: string; price: number; category: PosCategory; available: boolean }
export type CartLine = PosItem & { quantity: number }

export const POS_CATEGORIES: PosCategory[] = ["Popular", "Mains", "Sides", "Drinks", "Dessert"]
export const POS_ITEMS: PosItem[] = [
  { id: "p1", name: "Smash Burger", description: "Double patty, house sauce, pickles", price: 15, category: "Popular", available: true },
  { id: "p2", name: "Crispy Chicken", description: "Buttermilk, slaw, hot honey", price: 14, category: "Popular", available: true },
  { id: "p3", name: "Market Bowl", description: "Grains, greens, avocado, tahini", price: 13, category: "Popular", available: true },
  { id: "m1", name: "Steak Frites", description: "Bistro steak, peppercorn jus", price: 24, category: "Mains", available: true },
  { id: "m2", name: "Roasted Salmon", description: "Spring peas, lemon beurre blanc", price: 22, category: "Mains", available: true },
  { id: "m3", name: "Mushroom Rigatoni", description: "Wild mushrooms, parmesan", price: 18, category: "Mains", available: true },
  { id: "s1", name: "Sea Salt Fries", description: "Crisp potatoes, herb salt", price: 6, category: "Sides", available: true },
  { id: "s2", name: "Charred Broccolini", description: "Garlic, chile, lemon", price: 8, category: "Sides", available: true },
  { id: "d1", name: "Sparkling Water", description: "750 ml", price: 5, category: "Drinks", available: true },
  { id: "d2", name: "House Lemonade", description: "Fresh lemon, mint", price: 6, category: "Drinks", available: true },
  { id: "x1", name: "Chocolate Tart", description: "Sea salt, crème fraîche", price: 9, category: "Dessert", available: true },
  { id: "x2", name: "Soft Serve", description: "Vanilla, olive oil, salt", price: 7, category: "Dessert", available: false },
]
