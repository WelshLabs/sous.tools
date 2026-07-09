export interface CreateItemDto {
  name: string;
  category?: string;
  purchase_unit?: string;
  units_per_case?: number;
  each_weight_g?: number | null;
  density_g_ml?: number;
  shelf_life_days?: number;
  allergens?: string[];
  is_animal_product?: boolean;
  is_meat?: boolean;
  is_seafood?: boolean;
  is_dairy?: boolean;
  is_egg?: boolean;
  is_gluten_source?: boolean;
  fdc_id?: number;
  nutrition_macros?: Record<string, unknown>;
}

export type UpdateItemDto = Partial<CreateItemDto> & { force_usda_sync?: boolean; usda_query?: string };

export interface ClassifiedDietInfo {
  is_dairy: boolean;
  is_egg: boolean;
  is_gluten_source: boolean;
  is_seafood: boolean;
  is_meat: boolean;
  is_animal_product: boolean;
  allergens: string[];
}

export function classifyItemDietAndAllergens(
  name: string,
  fdcFoodName: string,
  initialAllergens: string[],
  initialStates: {
    is_dairy: boolean;
    is_egg: boolean;
    is_gluten_source: boolean;
    is_seafood: boolean;
    is_meat: boolean;
    is_animal_product: boolean;
  }
): ClassifiedDietInfo {
  const allergens = [...initialAllergens];
  let is_dairy = initialStates.is_dairy;
  let is_egg = initialStates.is_egg;
  let is_gluten_source = initialStates.is_gluten_source;
  let is_seafood = initialStates.is_seafood;
  let is_meat = initialStates.is_meat;
  let is_animal_product = initialStates.is_animal_product;

  const fullName = `${name.toLowerCase()} ${(fdcFoodName || "").toLowerCase()}`;

  if (fullName.match(/milk|cheese|butter|cream|whey|yogurt/)) {
    is_dairy = true;
    is_animal_product = true;
    if (!allergens.includes("dairy")) allergens.push("dairy");
  }
  if (fullName.match(/egg|mayo/)) {
    is_egg = true;
    is_animal_product = true;
    if (!allergens.includes("egg")) allergens.push("egg");
  }
  if (fullName.match(/wheat|flour|bread|pasta|cracker|dough/)) {
    is_gluten_source = true;
    if (!allergens.includes("wheat")) allergens.push("wheat");
  }
  if (fullName.match(/peanut/)) {
    if (!allergens.includes("peanuts")) allergens.push("peanuts");
  }
  if (fullName.match(/almond|walnut|pecan|cashew|pistachio|macadamia|hazelnut/)) {
    if (!allergens.includes("tree_nuts")) allergens.push("tree_nuts");
  }
  if (fullName.match(/soy|edamame|tofu|tempeh/)) {
    if (!allergens.includes("soy")) allergens.push("soy");
  }
  if (fullName.match(/fish|salmon|tuna|cod|tilapia|halibut|trout/)) {
    is_seafood = true;
    is_animal_product = true;
    if (!allergens.includes("fish")) allergens.push("fish");
  }
  if (fullName.match(/shrimp|crab|lobster|shellfish|clam|oyster/)) {
    is_seafood = true;
    is_animal_product = true;
    if (!allergens.includes("shellfish")) allergens.push("shellfish");
  }
  if (fullName.match(/beef|pork|chicken|turkey|lamb|bacon|sausage|meat|steak|veal/)) {
    is_meat = true;
    is_animal_product = true;
  }

  return {
    is_dairy,
    is_egg,
    is_gluten_source,
    is_seafood,
    is_meat,
    is_animal_product,
    allergens,
  };
}
