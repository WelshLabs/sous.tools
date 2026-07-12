import { createAdminClient } from "@soustools/supabase";
import { config } from "@soustools/config";

const STAPLES = [
  "Bread Flour",
  "All-Purpose Flour",
  "Whole Wheat Flour",
  "Cake Flour",
  "Pastry Flour",
  "Active Dry Yeast",
  "Instant Dry Yeast",
  "Fresh Yeast",
  "Fine Sea Salt",
  "Kosher Salt",
  "Unsalted Butter",
  "Salted Butter",
  "Heavy Cream",
  "Whole Milk",
  "Buttermilk",
  "Eggs",
  "Granulated Sugar",
  "Caster Sugar",
  "Brown Sugar",
  "Powdered Sugar",
  "Honey",
  "Maple Syrup",
  "Vanilla Extract",
  "Baking Powder",
  "Baking Soda",
  "Yellow Onion",
  "Red Onion",
  "Garlic Cloves",
  "Olive Oil",
  "Vegetable Oil",
  "Water",
  "Cocoa Powder",
  "Dark Chocolate Chips",
  "Milk Chocolate Chips",
  "White Chocolate Chips",
  "Cream Cheese",
  "Sour Cream",
  "Cornstarch",
  "Ground Cinnamon",
  "Ground Nutmeg",
  "Ground Ginger",
  "Ground Cloves",
  "Whole Star Anise",
  "Lemon Juice",
  "Lemon Zest",
  "Orange Juice",
  "Orange Zest",
  "Golden Raisins",
  "Dried Currants",
  "Pecan Halves",
  "Walnut Halves"
];

async function getEmbedding(text: string): Promise<number[] | null> {
  const host = config.OLLAMA_HOST || "http://127.0.0.1:11434";
  try {
    const response = await fetch(`${host}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text,
      }),
    });

    if (!response.ok) {
      console.warn(`Ollama embedding call failed with status ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding || null;
  } catch (err) {
    console.warn(`Ollama is unresponsive at ${host}. Proceeding without vector embedding. Error:`, err);
    return null;
  }
}

async function main() {
  console.log("Initializing Supabase Admin Client...");
  const supabase = createAdminClient();
  const orgId = "d0000000-0000-0000-0000-000000000000";

  console.log(`Seeding ${STAPLES.length} GlobalMaster staples into master_items...`);

  for (const name of STAPLES) {
    // 1. Check if item already exists
    const { data: existing } = await supabase
      .from("master_items")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      console.log(`- "${name}" already exists. Skipping.`);
      continue;
    }

    // 2. Generate embedding (graceful if Ollama is unresponsive)
    const embedding = await getEmbedding(name);

    const lowerName = name.toLowerCase();
    const isGluten = lowerName.includes("flour") || lowerName.includes("wheat");
    const isDairy = lowerName.includes("butter") || lowerName.includes("milk") || lowerName.includes("cream") || lowerName.includes("cheese");
    const isEgg = lowerName.includes("egg");
    const isMeat = lowerName.includes("beef") || lowerName.includes("pork") || lowerName.includes("chicken") || lowerName.includes("bacon");
    const isSeafood = lowerName.includes("salmon") || lowerName.includes("shrimp") || lowerName.includes("fish");
    const isAnimal = isDairy || isEgg || isMeat || isSeafood;

    // 3. Insert new master item
    const { error } = await supabase.from("master_items").insert({
      organization_id: orgId,
      name,
      density_g_ml: 1.0,
      nutrition_macros: { calories: 0, fatG: 0, carbsG: 0, proteinG: 0 },
      allergens: [],
      is_animal_product: isAnimal,
      is_dairy: isDairy,
      is_egg: isEgg,
      is_meat: isMeat,
      is_seafood: isSeafood,
      is_gluten_source: isGluten,
      embedding: embedding as any
    });

    if (error) {
      console.error(`X Failed to seed "${name}":`, error.message);
    } else {
      console.log(`+ Seeded "${name}" ${embedding ? "(with embedding)" : "(without embedding)"}`);
    }
  }

  console.log("Seeding complete!");
}

main().catch(console.error);
