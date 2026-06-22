import { PosItem } from "@soustools/api-types";

export interface RawDbPosItem {
  id: string;
  organization_id: string;
  pos_provider: "SQUARE" | "TOAST" | "MANUAL";
  external_id: string | null;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
}

export function mapDbItemToPosItem(item: RawDbPosItem): PosItem {
  return {
    id: item.id,
    organizationId: item.organization_id,
    posProvider: item.pos_provider,
    externalId: item.external_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.image_url,
    isSoldOut: item.is_sold_out,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export const MOCK_POS_ITEMS: PosItem[] = [
  {
    id: "item-1",
    organizationId: "org-1",
    posProvider: "SQUARE",
    externalId: "sq-truffle-burger",
    name: "Truffle Burger",
    description: "Wagyu beef, black truffle aioli, gruyère cheese",
    price: 24.0,
    imageUrl: null,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    organizationId: "org-1",
    posProvider: "SQUARE",
    externalId: "sq-lobster-roll",
    name: "Maine Lobster Roll",
    description: "Fresh lobster, butter, toasted brioche bun",
    price: 32.0,
    imageUrl: null,
    isSoldOut: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-3",
    organizationId: "org-1",
    posProvider: "SQUARE",
    externalId: "sq-caesar-salad",
    name: "Caesar Salad",
    description: "Romaine lettuce, house dressing, sourdough croutons",
    price: 14.0,
    imageUrl: null,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-4",
    organizationId: "org-1",
    posProvider: "SQUARE",
    externalId: "sq-chocolate-lava",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate center, vanilla bean gelato",
    price: 12.0,
    imageUrl: null,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
