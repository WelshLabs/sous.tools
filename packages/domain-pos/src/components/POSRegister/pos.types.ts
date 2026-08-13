import { z } from "zod";

export const CartItemModifierSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  price: z.number(),
});

export const CartItemSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  modifiers: z.array(CartItemModifierSchema),
});

export const CartSchema = z.array(CartItemSchema);

export const CatalogItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  image: z.string().optional(),
  isSoldOut: z.boolean().optional(),
  description: z.string().optional(),
  modifierGroupIds: z.array(z.string()).optional(),
});

export type CartItemModifier = z.infer<typeof CartItemModifierSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type CatalogItem = z.infer<typeof CatalogItemSchema>;
