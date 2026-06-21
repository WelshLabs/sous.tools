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
  
  vendor?: Vendor;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  raw_name: string;
  ordered_qty: number;
  price_per_unit: number;
  created_at: string;
}
