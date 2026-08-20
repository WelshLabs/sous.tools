import { z } from "zod";

export const OrderTypeSchema = z.enum(["for_here", "to_go"]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const CartItemModifierSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable().optional(),
  name: z.string(),
  price: z.number(),
});

export const CartItemSchema = z.object({
  id: z.string(),
  baseItemId: z.string().optional(),
  external_id: z.string().nullable().optional(),
  name: z.string(),
  basePrice: z.number(),
  price: z.number(),
  quantity: z.number().min(1),
  modifiers: z.array(CartItemModifierSchema),
  notes: z.string().optional(),
});

export const CartSchema = z.array(CartItemSchema);

export const CatalogItemSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable().optional(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  category_id: z.string().optional(),
  image: z.string().optional(),
  isSoldOut: z.boolean().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  modifierGroupIds: z.array(z.string()).optional(),
});

export const CategoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().optional(),
  itemCount: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const SavedCheckSchema = z.object({
  id: z.string(),
  checkName: z.string(),
  orderType: OrderTypeSchema,
  items: CartSchema,
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  createdAt: z.string(),
  tableNumber: z.string().optional(),
});

export const POSSettingsSchema = z.object({
  taxRate: z.number(), // e.g. 0.06 for 6%
  defaultOrderType: OrderTypeSchema,
  printerIp: z.string().optional(),
  cashDrawerEnabled: z.boolean().optional(),
  pinRequired: z.boolean().optional(),
  pinCode: z.string().optional(),
  layoutGrid: z.enum(["compact", "standard", "large"]),
});

export const POSUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  role: z.enum(["admin", "manager", "cashier"]),
  pin: z.string(),
});

export const PastOrderSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  state: z.string(),
  total_money: z.number(),
  order_type: z.string().optional(),
  created_at: z.string(),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        modifiers: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export type CartItemModifier = z.infer<typeof CartItemModifierSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type CatalogItem = z.infer<typeof CatalogItemSchema>;
export type CategoryItem = z.infer<typeof CategoryItemSchema>;
export type SavedCheck = z.infer<typeof SavedCheckSchema>;
export type POSSettings = z.infer<typeof POSSettingsSchema>;
export type POSUser = z.infer<typeof POSUserSchema>;
export type PastOrder = z.infer<typeof PastOrderSchema>;
