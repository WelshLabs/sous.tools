/* eslint-disable max-lines */
import {
  type ModifierGroup,
  type ModifierOption,
} from "./components/pos-modifiers-modal";
import {
  type CatalogItem,
  type CartItem,
  type CategoryItem,
} from "./pos.types";

export const DEFAULT_TAX_RATE = 0.06; // 6.0% default tax rate

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  mains:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  entrees:
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  burgers:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  "sides/salads":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  sides:
    "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
  salads:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  appetizers:
    "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop&q=80",
  beverages:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80",
  drinks:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80",
  desserts:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
  cocktails:
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
  beer: "https://images.unsplash.com/photo-1608270191599-52822a1068aa?w=600&auto=format&fit=crop&q=80",
  coffee:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
  specials:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
  other:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
};

export function getCategoryFallbackImage(categoryName: string): string {
  const key = categoryName.trim().toLowerCase();
  for (const [catKey, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (key.includes(catKey) || catKey.includes(key)) {
      return url;
    }
  }
  return CATEGORY_IMAGE_MAP.other;
}

export const getCategory = (itemName: string): string => {
  const name = itemName.toLowerCase();
  if (
    name.includes("burger") ||
    name.includes("sandwich") ||
    name.includes("steak") ||
    name.includes("salmon") ||
    name.includes("chicken") ||
    name.includes("taco")
  ) {
    return "Mains";
  }
  if (
    name.includes("salad") ||
    name.includes("fries") ||
    name.includes("soup") ||
    name.includes("tater") ||
    name.includes("rings") ||
    name.includes("chip")
  ) {
    return "Sides/Salads";
  }
  if (
    name.includes("beer") ||
    name.includes("ipa") ||
    name.includes("drink") ||
    name.includes("soda") ||
    name.includes("water") ||
    name.includes("coffee") ||
    name.includes("tea") ||
    name.includes("cocktail") ||
    name.includes("cider")
  ) {
    return "Beverages";
  }
  if (
    name.includes("cake") ||
    name.includes("pie") ||
    name.includes("ice cream") ||
    name.includes("cookie") ||
    name.includes("brownie")
  ) {
    return "Desserts";
  }
  return "Other";
};

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function playAudioChime(
  type: "success" | "drawer" | "item" | "clear" = "success",
) {
  try {
    const audioCtx = new (
      window.AudioContext ||
      (window as WindowWithAudioContext).webkitAudioContext
    )();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "success") {
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.24); // C6
      osc.type = "sine";
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } else if (type === "drawer") {
      // Bell ding + mechanical drawer latch chime
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.05); // A6
      osc.type = "triangle";
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === "item") {
      // Quick subtle tap
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.frequency.setValueAtTime(700, audioCtx.currentTime);
      osc.type = "sine";
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } else if (type === "clear") {
      // Down tone
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      osc.frequency.setValueAtTime(320, audioCtx.currentTime + 0.1);
      osc.type = "sine";
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }
  } catch {
    // ignore audio errors in headless / non-browser environments
  }
}

export function calculateTotals(
  cart: CartItem[],
  taxRate: number = DEFAULT_TAX_RATE,
) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    taxRate,
  };
}

export function buildCartWithAddedItem(
  prevCart: CartItem[],
  item: CatalogItem,
  selectedMods: ModifierOption[],
  notes?: string,
): CartItem[] {
  const basePrice = item.price;
  const modSum = selectedMods.reduce((s, m) => s + m.price, 0);
  const unitPrice = basePrice + modSum;

  const modKey = selectedMods
    .map((m) => m.id)
    .sort()
    .join("-");
  const cartItemKey = notes
    ? `${item.id}-${modKey}-${encodeURIComponent(notes)}`
    : `${item.id}-${modKey}`;

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
      baseItemId: item.id,
      external_id: item.external_id || null,
      name: item.name,
      basePrice,
      price: unitPrice,
      quantity: 1,
      notes,
      modifiers: selectedMods.map((m) => ({
        id: m.id,
        external_id: null,
        name: m.name,
        price: m.price,
      })),
    },
  ];
}

export function getFilteredItems(
  items: CatalogItem[],
  searchQuery: string,
  selectedCategory: string,
): CatalogItem[] {
  const cleanQuery = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    // If searching, search across all items
    const matchesSearch =
      cleanQuery === "" ||
      item.name.toLowerCase().includes(cleanQuery) ||
      (item.description && item.description.toLowerCase().includes(cleanQuery));

    // If searching globally, category filter can be bypassed if query is set, or filtered if specified
    const matchesCategory =
      cleanQuery !== ""
        ? true
        : selectedCategory === "" ||
          (item.category &&
            item.category.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase());

    return matchesSearch && matchesCategory;
  });
}

export function parseCatalogPayload(data: unknown) {
  const payload = (data as Record<string, unknown>)?.data || data;
  const rawCategories =
    ((payload as Record<string, unknown>)?.categories as Record<
      string,
      unknown
    >[]) || [];
  const rawItems =
    ((payload as Record<string, unknown>)?.items as Record<
      string,
      unknown
    >[]) || [];
  const rawGroups =
    ((payload as Record<string, unknown>)?.modifierGroups as Record<
      string,
      unknown
    >[]) || [];

  const categoryMap = new Map<
    string,
    { id: string; name: string; image?: string }
  >();
  const categoryCountMap = new Map<string, number>();

  // Filter and index valid active categories
  rawCategories.forEach((c) => {
    const cid = String(c.id || "");
    const extId = String(c.external_id || "");
    const cname = String(c.name || "").trim();
    const isActive = c.is_active !== false && !c.is_deleted && !c.deleted_at;
    const img = c.image_url
      ? String(c.image_url)
      : getCategoryFallbackImage(cname);

    if (isActive && cname) {
      const catObj = { id: cid || extId || cname, name: cname, image: img };
      if (cid) categoryMap.set(cid, catObj);
      if (extId) categoryMap.set(extId, catObj);
      categoryMap.set(cname.toLowerCase(), catObj);
    }
  });

  // Map Modifier Groups
  const mappedGroups: ModifierGroup[] = rawGroups
    .filter((mg) => mg.is_active !== false && !mg.is_deleted && !mg.deleted_at)
    .map((mg) => {
      const minSel = Number(mg.min_selected_modifiers) || (mg.required ? 1 : 0);
      const maxSel = Number(mg.max_selected_modifiers) || 10;
      const isReq = minSel > 0 || Boolean(mg.required);

      return {
        id: String(mg.id || ""),
        name: String(mg.name || ""),
        required: isReq,
        minSelections: minSel,
        maxSelections: maxSel,
        options: ((mg.pos_modifier_options as Record<string, unknown>[]) || [])
          .filter(
            (mo) => mo.is_active !== false && !mo.is_deleted && !mo.deleted_at,
          )
          .map((mo) => ({
            id: String(mo.id || ""),
            name: String(mo.name || ""),
            price: Number(mo.price || 0),
          })),
      };
    });

  // Map and filter active Catalog Items
  const mappedItems: CatalogItem[] = [];

  rawItems.forEach((item) => {
    // Respect active and POS visibility flags
    const isActive =
      item.is_active !== false &&
      item.available_in_pos !== false &&
      item.present_at_all_locations !== false &&
      !item.is_deleted &&
      !item.deleted_at;

    if (!isActive) return;

    const itemName = String(item.name || "").trim();
    if (!itemName) return;

    let itemCatName: string | undefined;
    let itemCatId: string | undefined;

    if (item.category_id && categoryMap.has(String(item.category_id))) {
      const cat = categoryMap.get(String(item.category_id))!;
      itemCatName = cat.name;
      itemCatId = cat.id;
    } else if (
      item.category &&
      categoryMap.has(String(item.category).toLowerCase())
    ) {
      const cat = categoryMap.get(String(item.category).toLowerCase())!;
      itemCatName = cat.name;
      itemCatId = cat.id;
    } else if (item.category_name) {
      itemCatName = String(item.category_name);
    }

    if (!itemCatName || itemCatName === "Other") {
      const derived = getCategory(itemName);
      itemCatName = derived || "Other";
    }

    // Tally item counts per category
    categoryCountMap.set(
      itemCatName,
      (categoryCountMap.get(itemCatName) || 0) + 1,
    );

    // Modifier group IDs associated with this item
    const itemMgIds = (
      (item.pos_item_modifier_groups as Record<string, unknown>[]) || []
    ).map((g) => String(g.modifier_group_id));

    mappedItems.push({
      id: String(item.id || item.external_id || itemName),
      external_id: item.external_id ? String(item.external_id) : null,
      name: itemName,
      price: Number(item.price || 0),
      category: itemCatName,
      category_id: itemCatId,
      image: item.image_url ? String(item.image_url) : undefined,
      isSoldOut: Boolean(item.is_sold_out || false),
      isActive: true,
      description: item.description ? String(item.description) : undefined,
      modifierGroupIds: itemMgIds,
    });
  });

  // Build category list with item counts & images
  const categoryItems: CategoryItem[] = [];
  const processedCatNames = new Set<string>();

  // First add categories that came from rawCategories
  for (const [, catObj] of categoryMap.entries()) {
    if (!processedCatNames.has(catObj.name.toLowerCase())) {
      processedCatNames.add(catObj.name.toLowerCase());
      const count = categoryCountMap.get(catObj.name) || 0;
      if (count > 0 || rawCategories.length <= 10) {
        categoryItems.push({
          id: catObj.id,
          name: catObj.name,
          image: catObj.image || getCategoryFallbackImage(catObj.name),
          itemCount: count,
          isActive: true,
        });
      }
    }
  }

  // Then add any derived categories (e.g. Mains, Sides, etc.) if not already added
  for (const [catName, count] of categoryCountMap.entries()) {
    if (!processedCatNames.has(catName.toLowerCase()) && count > 0) {
      processedCatNames.add(catName.toLowerCase());
      categoryItems.push({
        id: catName.toLowerCase(),
        name: catName,
        image: getCategoryFallbackImage(catName),
        itemCount: count,
        isActive: true,
      });
    }
  }

  // Fallback if no categories found
  if (categoryItems.length === 0) {
    categoryItems.push({
      id: "all",
      name: "All Items",
      image: CATEGORY_IMAGE_MAP.specials,
      itemCount: mappedItems.length,
      isActive: true,
    });
  }

  return {
    categories: categoryItems.map((c) => c.name),
    categoryItems,
    modifierGroups: mappedGroups,
    items: mappedItems,
  };
}
