import { config } from "@soustools/config";
import { getSquareBaseUrl } from "./square-client.helper";

interface StaticSeedItem {
  name: string;
  description: string;
  price: number;
  squareId: string;
}

const STATIC_SEED_ITEMS: StaticSeedItem[] = [
  { name: "Truffle Burger", description: "Rich truffle burger", price: 1800, squareId: "item_truffle_burger" },
  { name: "Maine Lobster Roll", description: "Fresh Maine lobster roll", price: 2600, squareId: "item_lobster_roll" },
  { name: "Caesar Salad", description: "Classic caesar salad", price: 1200, squareId: "item_caesar_salad" },
  { name: "Latte", description: "Espresso with steamed milk", price: 450, squareId: "item_latte" },
  { name: "Croissant", description: "Flaky butter croissant", price: 400, squareId: "item_croissant" },
];

export async function seedSquareCatalog(accessToken: string): Promise<void> {
  const sandboxBaseUrl = getSquareBaseUrl();
  const prodToken = config.PRODUCTION_SQUARE_ACCESS_TOKEN;

  let objects: any[] = [];

  // Attempt to query the production catalog if the token is valid/present
  if (prodToken && !prodToken.includes("placeholder")) {
    console.log("[Square Seeding] Production token found. Querying production catalog...");
    try {
      // 1. Fetch production items
      const itemsRes = await fetch("https://connect.squareup.com/v2/catalog/list?types=ITEM", {
        headers: {
          Authorization: `Bearer ${prodToken}`,
          "Square-Version": "2024-03-20",
          "Content-Type": "application/json",
        },
      });

      if (itemsRes.ok) {
        const itemsData = (await itemsRes.json()) as { objects?: any[] };
        const prodItems = (itemsData.objects || []).slice(0, 8); // Seed a subset of 8 items

        if (prodItems.length > 0) {
          // Identify all modifier lists referenced by these items
          const referencedModListIds = new Set<string>();
          prodItems.forEach((item) => {
            (item.item_data?.modifier_list_info || []).forEach((info: any) => {
              if (info.modifier_list_id) {
                referencedModListIds.add(info.modifier_list_id);
              }
            });
          });

          // 2. Fetch those modifier lists from production
          const modLists: any[] = [];
          if (referencedModListIds.size > 0) {
            console.log(`[Square Seeding] Fetching ${referencedModListIds.size} referenced modifier lists...`);
            const modListsRes = await fetch("https://connect.squareup.com/v2/catalog/list?types=MODIFIER_LIST", {
              headers: {
                Authorization: `Bearer ${prodToken}`,
                "Square-Version": "2024-03-20",
                "Content-Type": "application/json",
              },
            });
            if (modListsRes.ok) {
              const modListsData = (await modListsRes.json()) as { objects?: any[] };
              (modListsData.objects || []).forEach((modList) => {
                if (referencedModListIds.has(modList.id)) {
                  modLists.push(modList);
                }
              });
            }
          }

          // 3. Map modifier lists into Sandbox format
          modLists.forEach((ml) => {
            objects.push({
              type: "MODIFIER_LIST",
              id: `#modlist_${ml.id}`,
              modifier_list_data: {
                name: ml.modifier_list_data?.name || "Modifiers",
                selection_type: ml.modifier_list_data?.selection_type || "SINGLE",
                modifiers: (ml.modifier_list_data?.modifiers || []).map((m: any) => ({
                  type: "MODIFIER",
                  id: `#modifier_${m.id}`,
                  modifier_data: {
                    name: m.modifier_data?.name || "Option",
                    price_money: m.modifier_data?.price_money || { amount: 0, currency: "USD" },
                  },
                })),
              },
            });
          });

          // 4. Map items into Sandbox format
          prodItems.forEach((item) => {
            const mappedModifierInfo = (item.item_data?.modifier_list_info || []).map((info: any) => ({
              modifier_list_id: `#modlist_${info.modifier_list_id}`,
              min_selected_modifiers: info.min_selected_modifiers,
              max_selected_modifiers: info.max_selected_modifiers,
              enabled: info.enabled,
            }));

            const mappedVariations = (item.item_data?.variations || []).map((v: any) => ({
              type: "ITEM_VARIATION",
              id: `#var_${v.id}`,
              item_variation_data: {
                name: v.item_variation_data?.name || "Regular",
                pricing_type: v.item_variation_data?.pricing_type || "FIXED_PRICING",
                price_money: v.item_variation_data?.price_money || { amount: 1000, currency: "USD" },
              },
            }));

            objects.push({
              type: "ITEM",
              id: `#item_${item.id}`,
              item_data: {
                name: item.item_data?.name || "Unnamed Item",
                description: item.item_data?.description || "",
                modifier_list_info: mappedModifierInfo,
                variations: mappedVariations,
              },
            });
          });

          console.log(`[Square Seeding] Successfully mapped ${objects.length} objects from production.`);
        }
      }
    } catch (err) {
      console.error("[Square Seeding] Failed to read production catalog. Falling back to static seed...", err);
    }
  }

  // Fallback to static seed items if production mapping failed or wasn't configured
  if (objects.length === 0) {
    console.log("[Square Seeding] Seeding static fallback items...");
    objects = STATIC_SEED_ITEMS.map((item) => ({
      type: "ITEM",
      id: `#${item.squareId}`,
      item_data: {
        name: item.name,
        description: item.description,
        variations: [
          {
            type: "ITEM_VARIATION",
            id: `#${item.squareId}_var`,
            item_variation_data: {
              name: "Regular",
              pricing_type: "FIXED_PRICING",
              price_money: { amount: item.price, currency: "USD" },
            },
          },
        ],
      },
    }));
  }

  console.log(`[Square Seeding] Sending batch-upsert with ${objects.length} objects to Sandbox...`);
  const res = await fetch(`${sandboxBaseUrl}/v2/catalog/batch-upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-03-20",
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      batches: [{ objects }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Square catalog seed failed: ${await res.text()}`);
  }

  console.log("[Square Seeding] Sandbox seeded successfully.");
}
