import { z } from "zod";

export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  order_method: 'EMAIL' | 'SMS' | 'MANUAL';
  email?: string;
  phone?: string;
  created_at: string;
}

export interface WhiteboardItem {
  id: string;
  organization_id: string;
  raw_name: string;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  vendor_id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RECONCILED';
  order_date: string;
  created_at: string;
  
  vendors?: Vendor;
  purchase_order_items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  raw_name: string;
  ordered_qty: number;
  price_per_unit: number;
  created_at: string;
}

export const OrderItemSchema = z.object({
  raw_name: z.string().min(1, "Item name is required"),
  ordered_qty: z.number().min(0, "Quantity cannot be negative"),
  price_per_unit: z.number().min(0, "Price cannot be negative"),
});

export const CreatePurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid("Invalid vendor ID"),
  items: z.array(OrderItemSchema).min(1, "Must have at least one item"),
});

export type OrderItemPayload = z.infer<typeof OrderItemSchema>;
export type CreatePurchaseOrderPayload = z.infer<typeof CreatePurchaseOrderSchema>;

