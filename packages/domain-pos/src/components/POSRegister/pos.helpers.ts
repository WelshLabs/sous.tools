import { type ModifierGroup, type ModifierOption } from "./components/pos-modifiers-modal";
import { type CatalogItem, type CartItem } from "./pos.types";

export const MOCK_BURGER_MODIFIERS: ModifierGroup[] = [
  {
    id: "g1",
    name: "Choose Cheese",
    required: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: "o1", name: "Cheddar", price: 0 },
      { id: "o2", name: "Swiss", price: 0.5 },
      { id: "o3", name: "Provolone", price: 0.5 },
    ],
  },
  {
    id: "g2",
    name: "Add-ons",
    required: false,
    minSelections: 0,
    maxSelections: 3,
    options: [
      { id: "o4", name: "Bacon", price: 1.5 },
      { id: "o5", name: "Avocado", price: 2.0 },
      { id: "o6", name: "Extra Patty", price: 3.0 },
    ],
  },
];

export const getCategory = (itemName: string): string => {
  const name = itemName.toLowerCase();
  if (name.includes("burger") || name.includes("sandwich") || name.includes("steak") || name.includes("salmon")) {
    return "Mains";
  }
  if (name.includes("salad") || name.includes("fries") || name.includes("soup") || name.includes("tater")) {
    return "Sides/Salads";
  }
  if (name.includes("beer") || name.includes("ipa") || name.includes("drink") || name.includes("soda") || name.includes("water")) {
    return "Beverages";
  }
  return "Other";
};

export const CATEGORIES = ["Mains", "Sides/Salads", "Beverages", "Other"];

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
    osc.type = "sine";
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch {
    // ignore
  }
}

export function getFilteredItems(items: CatalogItem[], searchQuery: string, selectedCategory: string): CatalogItem[] {
  const mapped: CatalogItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category: getCategory(item.name),
    description: item.description || undefined,
    isSoldOut: item.is_sold_out || false,
    image: item.image || undefined,
  }));

  return mapped.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
}

export function calculateTotals(cart: CartItem[]) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price + item.modifiers.reduce((mSum, m) => mSum + m.price, 0)) * item.quantity, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function buildCartWithAddedItem(prevCart: CartItem[], item: CatalogItem, selectedMods: ModifierOption[]): CartItem[] {
  const cartItemKey = `${item.id}-${selectedMods.map((m) => m.id).sort().join("-")}`;
  const existingIndex = prevCart.findIndex((ci) => ci.id === cartItemKey);
  if (existingIndex > -1) {
    const updated = [...prevCart];
    updated[existingIndex].quantity += 1;
    return updated;
  }
  return [
    ...prevCart,
    {
      id: cartItemKey,
      external_id: null,
      name: item.name,
      price: item.price,
      quantity: 1,
      modifiers: selectedMods.map((m) => ({
        id: m.id,
        external_id: null,
        name: m.name,
        price: m.price,
      })),
    },
  ];
}

