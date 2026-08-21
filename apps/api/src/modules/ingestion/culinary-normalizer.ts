import { Logger } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";

export const CULINARY_DICTIONARY: Record<string, string> = {
  // Oils & Fats
  evoo: "Oil, olive, extra virgin",
  "e.v.o.o.": "Oil, olive, extra virgin",
  "extra virgin olive oil": "Oil, olive, extra virgin",
  "olive oil": "Oil, olive, salad or cooking",
  "pure olive oil": "Oil, olive, salad or cooking",
  "canola oil": "Oil, canola",
  "vegetable oil": "Oil, vegetable, soybean",
  "sesame oil": "Oil, sesame, salad or cooking",
  "toasted sesame oil": "Oil, sesame, salad or cooking",
  "peanut oil": "Oil, peanut, salad or cooking",
  "coconut oil": "Oil, coconut",
  "avocado oil": "Oil, avocado",
  "corn oil": "Oil, corn, salad or cooking",
  "sunflower oil": "Oil, sunflower, linoleic (approx. 65%)",
  lard: "Lard",
  shortening: "Shortening, vegetable, household, composite",
  ghee: "Butter oil, anhydrous",
  "clarified butter": "Butter oil, anhydrous",

  // Dairy & Eggs
  "unsalted butter": "Butter, without salt",
  "sweet butter": "Butter, without salt",
  "salted butter": "Butter, with salt",
  butter: "Butter, with salt",
  "heavy cream": "Cream, fluid, heavy whipping",
  "heavy whipping cream": "Cream, fluid, heavy whipping",
  "whipping cream": "Cream, fluid, heavy whipping",
  "half and half": "Cream, fluid, half and half",
  "half & half": "Cream, fluid, half and half",
  "light cream": "Cream, fluid, light (coffee cream or table cream)",
  "whole milk": "Milk, whole, 3.25% milkfat",
  milk: "Milk, whole, 3.25% milkfat",
  "full fat milk": "Milk, whole, 3.25% milkfat",
  "skim milk": "Milk, nonfat, fluid",
  "nonfat milk": "Milk, nonfat, fluid",
  "2% milk": "Milk, reduced fat, fluid, 2% milkfat",
  "reduced fat milk": "Milk, reduced fat, fluid, 2% milkfat",
  "1% milk": "Milk, lowfat, fluid, 1% milkfat",
  "low fat milk": "Milk, lowfat, fluid, 1% milkfat",
  buttermilk: "Milk, buttermilk, fluid, cultured, lowfat",
  "evaporated milk":
    "Milk, canned, evaporated, with added vitamin D and without added vitamin A",
  "sweetened condensed milk": "Milk, canned, condensed, sweetened",
  "condensed milk": "Milk, canned, condensed, sweetened",
  "sour cream": "Sour cream, regular",
  "cream cheese": "Cheese, cream",
  "cheddar cheese": "Cheese, cheddar",
  cheddar: "Cheese, cheddar",
  "mozzarella cheese": "Cheese, mozzarella, whole milk",
  mozzarella: "Cheese, mozzarella, whole milk",
  "parmesan cheese": "Cheese, parmesan, grated",
  parmesan: "Cheese, parmesan, grated",
  "parmigiano reggiano": "Cheese, parmesan, grated",
  "feta cheese": "Cheese, feta",
  feta: "Cheese, feta",
  "ricotta cheese": "Cheese, ricotta, whole milk",
  ricotta: "Cheese, ricotta, whole milk",
  "goat cheese": "Cheese, goat, soft type",
  chevre: "Cheese, goat, soft type",
  "swiss cheese": "Cheese, swiss",
  provolone: "Cheese, provolone",
  "monterey jack": "Cheese, monterey",
  "pepper jack": "Cheese, monterey",
  "greek yogurt": "Yogurt, Greek, plain, whole milk",
  "plain yogurt": "Yogurt, plain, whole milk",
  egg: "Egg, whole, raw, fresh",
  eggs: "Egg, whole, raw, fresh",
  "large egg": "Egg, whole, raw, fresh",
  "large eggs": "Egg, whole, raw, fresh",
  "egg white": "Egg, white, raw, fresh",
  "egg whites": "Egg, white, raw, fresh",
  "egg yolk": "Egg, yolk, raw, fresh",
  "egg yolks": "Egg, yolk, raw, fresh",

  // Flours & Grains & Starches
  "ap flour": "Flour, wheat, all-purpose",
  "a.p. flour": "Flour, wheat, all-purpose",
  "all purpose flour": "Flour, wheat, all-purpose",
  "all-purpose flour": "Flour, wheat, all-purpose",
  "bread flour": "Flour, bread, white, enriched",
  "cake flour": "Flour, cake, white, enriched",
  "pastry flour": "Flour, pastry, white, enriched",
  "whole wheat flour": "Wheat flour, whole-grain",
  "almond flour": "Nuts, almond flour",
  "coconut flour": "Flour, coconut",
  "rice flour": "Flour, rice, white",
  "semolina flour": "Semolina, enriched",
  semolina: "Semolina, enriched",
  cornstarch: "Cornstarch",
  "corn starch": "Cornstarch",
  cornmeal: "Cornmeal, yellow, whole-grain",
  "rolled oats": "Cereals, oats, regular and quick, not fortified, dry",
  "old fashioned oats": "Cereals, oats, regular and quick, not fortified, dry",
  oats: "Cereals, oats, regular and quick, not fortified, dry",
  "white rice": "Rice, white, long-grain, regular, raw, unenriched",
  "brown rice": "Rice, brown, long-grain, raw",
  "jasmine rice": "Rice, white, long-grain, regular, raw, unenriched",
  "basmati rice": "Rice, white, long-grain, regular, raw, unenriched",
  "arborio rice": "Rice, white, medium-grain, raw, unenriched",
  quinoa: "Quinoa, uncooked",
  breadcrumbs: "Bread, crumbs, dry, grated, plain",
  panko: "Bread, crumbs, dry, grated, plain",
  "panko breadcrumbs": "Bread, crumbs, dry, grated, plain",

  // Sugars & Sweeteners
  "granulated sugar": "Sugars, granulated",
  "white sugar": "Sugars, granulated",
  sugar: "Sugars, granulated",
  "brown sugar": "Sugars, brown",
  "light brown sugar": "Sugars, brown",
  "dark brown sugar": "Sugars, brown",
  "powdered sugar": "Sugars, powdered",
  "confectioners sugar": "Sugars, powdered",
  "icing sugar": "Sugars, powdered",
  "10x sugar": "Sugars, powdered",
  honey: "Honey",
  "maple syrup": "Syrups, maple",
  "pure maple syrup": "Syrups, maple",
  molasses: "Molasses",
  agave: "Syrups, agave",
  "agave nectar": "Syrups, agave",
  "corn syrup": "Syrups, corn, light",

  // Seasonings & Spices & Leaveners
  "kosher salt": "Salt, table",
  "sea salt": "Salt, table",
  "table salt": "Salt, table",
  salt: "Salt, table",
  "black pepper": "Spices, pepper, black",
  "ground black pepper": "Spices, pepper, black",
  "cracked black pepper": "Spices, pepper, black",
  "white pepper": "Spices, pepper, white",
  "ground white pepper": "Spices, pepper, white",
  cayenne: "Spices, pepper, red or cayenne",
  "cayenne pepper": "Spices, pepper, red or cayenne",
  paprika: "Spices, paprika",
  "smoked paprika": "Spices, paprika",
  "sweet paprika": "Spices, paprika",
  cumin: "Spices, cumin seed",
  "ground cumin": "Spices, cumin seed",
  coriander: "Spices, coriander seed",
  "ground coriander": "Spices, coriander seed",
  cinnamon: "Spices, cinnamon, ground",
  "ground cinnamon": "Spices, cinnamon, ground",
  nutmeg: "Spices, nutmeg, ground",
  "ground nutmeg": "Spices, nutmeg, ground",
  cloves: "Spices, cloves, ground",
  "ground cloves": "Spices, cloves, ground",
  allspice: "Spices, allspice, ground",
  cardamom: "Spices, cardamom",
  turmeric: "Spices, turmeric, ground",
  "ground turmeric": "Spices, turmeric, ground",
  "garlic powder": "Spices, garlic powder",
  "onion powder": "Spices, onion powder",
  "chili powder": "Spices, chili powder",
  "baking powder":
    "Leavening agents, baking powder, double-acting, sodium aluminum sulfate",
  "baking soda": "Leavening agents, baking soda",
  "active dry yeast": "Leavening agents, yeast, baker's, active dry",
  "instant yeast": "Leavening agents, yeast, baker's, active dry",
  "dry yeast": "Leavening agents, yeast, baker's, active dry",
  "vanilla extract": "Vanilla extract",
  "pure vanilla extract": "Vanilla extract",
  vanilla: "Vanilla extract",
  "almond extract": "Flavoring extracts, almond",
  "cocoa powder": "Cocoa, dry powder, unsweetened",
  "unsweetened cocoa powder": "Cocoa, dry powder, unsweetened",

  // Produce & Aromatics
  "yellow onion": "Onions, yellow, raw",
  "yellow onions": "Onions, yellow, raw",
  onion: "Onions, yellow, raw",
  onions: "Onions, yellow, raw",
  "sweet onion": "Onions, yellow, raw",
  "red onion": "Onions, red, raw",
  "red onions": "Onions, red, raw",
  "white onion": "Onions, white, raw",
  "white onions": "Onions, white, raw",
  scallions: "Onions, spring or scallions (includes tops and bulb), raw",
  scallion: "Onions, spring or scallions (includes tops and bulb), raw",
  "green onion": "Onions, spring or scallions (includes tops and bulb), raw",
  "green onions": "Onions, spring or scallions (includes tops and bulb), raw",
  "spring onion": "Onions, spring or scallions (includes tops and bulb), raw",
  shallot: "Shallots, raw",
  shallots: "Shallots, raw",
  leek: "Leeks, (bulb and lower leaf-portion), raw",
  leeks: "Leeks, (bulb and lower leaf-portion), raw",
  "garlic clove": "Garlic, raw",
  "garlic cloves": "Garlic, raw",
  garlic: "Garlic, raw",
  "fresh garlic": "Garlic, raw",
  "minced garlic": "Garlic, raw",
  ginger: "Ginger root, raw",
  "ginger root": "Ginger root, raw",
  "fresh ginger": "Ginger root, raw",
  "minced ginger": "Ginger root, raw",
  carrot: "Carrots, raw",
  carrots: "Carrots, raw",
  celery: "Celery, raw",
  "celery stalk": "Celery, raw",
  "celery stalks": "Celery, raw",
  potato: "Potatoes, russet, flesh and skin, raw",
  potatoes: "Potatoes, russet, flesh and skin, raw",
  "russet potatoes": "Potatoes, russet, flesh and skin, raw",
  "russet potato": "Potatoes, russet, flesh and skin, raw",
  "yukon gold potatoes": "Potatoes, gold, flesh and skin, raw",
  "sweet potato": "Sweet potato, raw, unprepared",
  "sweet potatoes": "Sweet potato, raw, unprepared",
  tomato: "Tomatoes, red, ripe, raw, year round average",
  tomatoes: "Tomatoes, red, ripe, raw, year round average",
  "roma tomatoes": "Tomatoes, red, ripe, raw, year round average",
  "cherry tomatoes": "Tomatoes, red, ripe, raw, year round average",
  "bell pepper": "Peppers, sweet, green, raw",
  "green bell pepper": "Peppers, sweet, green, raw",
  "red bell pepper": "Peppers, sweet, red, raw",
  "yellow bell pepper": "Peppers, sweet, yellow, raw",
  jalapeno: "Peppers, jalapeno, raw",
  jalapenos: "Peppers, jalapeno, raw",
  "jalapeno pepper": "Peppers, jalapeno, raw",
  serrano: "Peppers, serrano, raw",
  poblano: "Peppers, ancho, dried",
  habanero: "Peppers, hot chili, red, raw",
  cilantro: "Coriander (cilantro) leaves, raw",
  "fresh cilantro": "Coriander (cilantro) leaves, raw",
  "coriander leaves": "Coriander (cilantro) leaves, raw",
  parsley: "Parsley, fresh",
  "fresh parsley": "Parsley, fresh",
  "flat leaf parsley": "Parsley, fresh",
  "italian parsley": "Parsley, fresh",
  basil: "Basil, fresh",
  "fresh basil": "Basil, fresh",
  rosemary: "Rosemary, fresh",
  "fresh rosemary": "Rosemary, fresh",
  thyme: "Thyme, fresh",
  "fresh thyme": "Thyme, fresh",
  oregano: "Oregano, fresh",
  "fresh oregano": "Oregano, fresh",
  dill: "Dill weed, fresh",
  "fresh dill": "Dill weed, fresh",
  mint: "Peppermint, fresh",
  "fresh mint": "Peppermint, fresh",
  "bay leaf": "Spices, bay leaf",
  "bay leaves": "Spices, bay leaf",
  lemon: "Lemons, raw, without peel",
  lemons: "Lemons, raw, without peel",
  "lemon juice": "Lemon juice, raw",
  "fresh lemon juice": "Lemon juice, raw",
  "lemon zest": "Lemon peel, raw",
  lime: "Limes, raw",
  limes: "Limes, raw",
  "lime juice": "Lime juice, raw",
  "fresh lime juice": "Lime juice, raw",
  "lime zest": "Lime peel, raw",
  orange: "Oranges, raw, all commercial varieties",
  "orange juice": "Orange juice, raw",
  "orange zest": "Orange peel, raw",

  // Meats & Seafood
  "chicken breast": "Chicken, broiler or fryers, breast, meat only, raw",
  "chicken breasts": "Chicken, broiler or fryers, breast, meat only, raw",
  "boneless skinless chicken breast":
    "Chicken, broiler or fryers, breast, meat only, raw",
  "chicken thigh": "Chicken, broiler or fryers, thigh, meat only, raw",
  "chicken thighs": "Chicken, broiler or fryers, thigh, meat only, raw",
  "boneless skinless chicken thigh":
    "Chicken, broiler or fryers, thigh, meat only, raw",
  "chicken wings": "Chicken, broiler or fryers, wing, meat only, raw",
  "chicken wing": "Chicken, broiler or fryers, wing, meat only, raw",
  "whole chicken": "Chicken, broiler or fryers, meat and skin, raw",
  "ground beef": "Beef, ground, 80% lean meat / 20% fat, raw",
  "ground chuck": "Beef, ground, 80% lean meat / 20% fat, raw",
  "ground sirloin": "Beef, ground, 90% lean meat / 10% fat, raw",
  "beef ribeye":
    "Beef, rib eye steak, boneless, lip off, separable lean only, raw",
  ribeye: "Beef, rib eye steak, boneless, lip off, separable lean only, raw",
  "beef tenderloin": "Beef, tenderloin, steak, separable lean only, raw",
  "filet mignon": "Beef, tenderloin, steak, separable lean only, raw",
  "beef sirloin": "Beef, top sirloin, steak, separable lean only, raw",
  "pork chop": "Pork, fresh, loin, chop, bone-in, raw",
  "pork chops": "Pork, fresh, loin, chop, bone-in, raw",
  "pork loin": "Pork, fresh, loin, whole, separable lean only, raw",
  "pork belly": "Pork, fresh, composite of trimmed wholesale cuts: belly, raw",
  "pork shoulder": "Pork, fresh, shoulder, whole, separable lean and fat, raw",
  "pork butt": "Pork, fresh, shoulder, whole, separable lean and fat, raw",
  bacon: "Pork, cured, bacon, raw",
  pancetta: "Pork, cured, bacon, raw",
  prosciutto:
    "Pork, cured, ham -- water added, slice, bone removed, separable lean only",
  salmon: "Fish, salmon, Atlantic, wild, raw",
  "salmon fillet": "Fish, salmon, Atlantic, wild, raw",
  cod: "Fish, cod, Atlantic, raw",
  shrimp: "Crustaceans, shrimp, raw",
  tuna: "Fish, tuna, fresh, yellowfin, raw",
  scallops: "Mollusks, scallop, (mixed species), raw",

  // Condiments & Canned Goods & Stocks
  mayo: "Salad dressing, mayonnaise, regular",
  mayonnaise: "Salad dressing, mayonnaise, regular",
  "dijon mustard": "Mustard, prepared, yellow",
  dijon: "Mustard, prepared, yellow",
  "yellow mustard": "Mustard, prepared, yellow",
  "wholegrain mustard": "Mustard, prepared, yellow",
  "soy sauce": "Soy sauce made from soy (tamari)",
  shoyu: "Soy sauce made from soy (tamari)",
  tamari: "Soy sauce made from soy (tamari)",
  "fish sauce": "Fish sauce",
  worcestershire: "Sauce, worcestershire",
  "worcestershire sauce": "Sauce, worcestershire",
  "hot sauce": "Sauce, hot chili, sriracha",
  sriracha: "Sauce, hot chili, sriracha",
  "apple cider vinegar": "Vinegar, cider",
  acv: "Vinegar, cider",
  "white vinegar": "Vinegar, distilled",
  "distilled vinegar": "Vinegar, distilled",
  "balsamic vinegar": "Vinegar, balsamic",
  "red wine vinegar": "Vinegar, red wine",
  "white wine vinegar": "Vinegar, white wine",
  "rice vinegar": "Vinegar, rice",
  "tomato paste": "Tomato products, canned, paste, without salt added",
  "tomato sauce": "Tomato products, canned, sauce",
  "crushed tomatoes": "Tomatoes, red, ripe, canned, whole, regular pack",
  "diced tomatoes": "Tomatoes, red, ripe, canned, diced",
  "canned tomatoes": "Tomatoes, red, ripe, canned, whole, regular pack",
  "chicken stock": "Soup, stock, chicken, home-prepared",
  "chicken broth":
    "Soup, chicken broth, canned, prepared with equal volume water",
  "beef stock": "Soup, stock, beef, home-prepared",
  "beef broth":
    "Soup, beef broth, bouillon, consomme, prepared with equal volume water",
  "vegetable stock": "Soup, vegetable broth",
  "vegetable broth": "Soup, vegetable broth",
};

const PACKAGING_AND_UNIT_PATTERNS = [
  /\b\d+(\.\d+)?\s*(lb|lbs|oz|kg|g|gal|gallon|gallons|qt|quart|quarts|pt|pint|pints|fl\s*oz|case|cs|ct|count|box|bag|pk|pack|bunch|ea|each)\b/gi,
  /\b(case of \d+|pack of \d+|box of \d+|bag of \d+)\b/gi,
  /\b\d+\/\d+(\.\d+)?\s*(lb|oz|gal|qt|pt|ct)\b/gi,
  /\b(sysco|us foods|gfs|chef'?s quality|gordon choice|kirkland|reinhart|shamrock)\b/gi,
  /[#*]/g,
];

const logger = new Logger("CulinaryNormalizer");

/**
 * Normalizes colloquial culinary terms and kitchen abbreviations into canonical
 * USDA FoodData Central Foundation food descriptions.
 */
export async function normalizeCulinaryTerms(
  rawItemName: string,
  options?: { useLlmFallback?: boolean },
): Promise<string> {
  if (!rawItemName || !rawItemName.trim()) {
    return "";
  }

  let cleaned = rawItemName.trim().toLowerCase();

  // Strip packaging, distributor prefixes, and package dimensions
  for (const pattern of PACKAGING_AND_UNIT_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ").trim();
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 1. Direct dictionary match
  if (CULINARY_DICTIONARY[cleaned]) {
    return CULINARY_DICTIONARY[cleaned];
  }

  // 2. Partial/singular lookup
  const words = cleaned.split(" ");
  if (words.length > 1) {
    // Try without trailing plural 's'
    const singular = cleaned.endsWith("s") ? cleaned.slice(0, -1) : cleaned;
    if (CULINARY_DICTIONARY[singular]) {
      return CULINARY_DICTIONARY[singular];
    }
  }

  // 3. Substring key matching
  for (const [colloquial, canonical] of Object.entries(CULINARY_DICTIONARY)) {
    if (colloquial.length > 3 && cleaned === colloquial) {
      return canonical;
    }
  }

  // 4. Optional LLM / Ollama Fallback if configured and requested
  if (options?.useLlmFallback) {
    try {
      // Try local Ollama first for culinary normalization
      const ollamaUrl = `${config.OLLAMA_HOST || "http://127.0.0.1:11434"}/api/chat`;
      const prompt = `Normalize this culinary ingredient name into a standard USDA FoodData Central food item description: "${rawItemName}". Output ONLY the canonical food description (e.g. "Oil, olive, extra virgin"). No explanation or quotes.`;

      const ollamaRes = await fetch(ollamaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.OLLAMA_MODEL || "qwen2.5-coder:3b",
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (ollamaRes.ok) {
        const resData = await ollamaRes.json();
        const content = resData?.message?.content?.trim();
        if (content && content.length < 80 && !content.includes("\n")) {
          return content.replace(/^["']|["']$/g, "");
        }
      }
    } catch (llmErr) {
      logger.debug(
        `LLM normalization fallback bypassed for "${rawItemName}": ${llmErr}`,
      );
    }
  }

  // Default to cleaned query string
  return cleaned || rawItemName;
}
