import { getSquareBaseUrl } from "./square-client.helper";

const SEED_ITEMS = [
  { name: "Truffle Burger", description: "Rich truffle burger", price: 1800, squareId: "item_truffle_burger" },
  { name: "Maine Lobster Roll", description: "Fresh Maine lobster roll", price: 2600, squareId: "item_lobster_roll" },
  { name: "Caesar Salad", description: "Classic caesar salad", price: 1200, squareId: "item_caesar_salad" },
  { name: "Latte", description: "Espresso with steamed milk", price: 450, squareId: "item_latte" },
  { name: "Croissant", description: "Flaky butter croissant", price: 400, squareId: "item_croissant" },
];

export async function seedSquareCatalog(accessToken: string): Promise<void> {
  const baseUrl = getSquareBaseUrl();
  const objects = SEED_ITEMS.map((item) => ({
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

  const res = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      batches: [{ objects }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Square catalog seed failed: ${await res.text()}`);
  }
}
