export interface MockPosItem {
  organization_id: string;
  pos_provider: "SQUARE" | "TOAST" | "MANUAL";
  external_id: string;
  name: string;
  description: string;
  price: number;
  is_sold_out: boolean;
}

export function getMockItems(organizationId: string): MockPosItem[] {
  return [
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_coffee",
      name: "Coffee",
      description: "Freshly brewed drip coffee",
      price: 3.5,
      is_sold_out: false,
    },
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_croissant",
      name: "Croissant",
      description: "Flaky butter croissant",
      price: 4.0,
      is_sold_out: false,
    },
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_avocado_toast",
      name: "Avocado Toast",
      description: "Sourdough toast with mashed avocado",
      price: 9.5,
      is_sold_out: false,
    },
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_latte",
      name: "Latte",
      description: "Espresso with steamed milk",
      price: 4.5,
      is_sold_out: false,
    },
  ];
}
