import { SignageDisplay, PosItem } from "@soustools/api-types";

/**
 * Mock signage displays for the DisplayManager component.
 */
export const MOCK_DISPLAYS: SignageDisplay[] = [
  {
    id: "disp-1",
    organizationId: "org-1",
    name: "Main Menu Board - Left",
    layoutId: "layout-1",
    pairingCode: null,
    isPaired: true,
    lastSeenAt: new Date(Date.now() - 5000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "disp-2",
    organizationId: "org-1",
    name: "Beverage Signage - Right",
    layoutId: "layout-2",
    pairingCode: null,
    isPaired: true,
    lastSeenAt: new Date(Date.now() - 120000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "disp-3",
    organizationId: "org-1",
    name: "Waiting Area TV",
    layoutId: null,
    pairingCode: "A7B9",
    isPaired: false,
    lastSeenAt: null,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Mock POS items for the PosSimulator component.
 */
export const MOCK_POS_ITEMS: PosItem[] = [
  {
    id: "item-1",
    organizationId: "org-1",
    squareId: "sq-truffle-burger",
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
    squareId: "sq-lobster-roll",
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
    squareId: "sq-caesar-salad",
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
    squareId: "sq-chocolate-lava",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate center, vanilla bean gelato",
    price: 12.0,
    imageUrl: null,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
