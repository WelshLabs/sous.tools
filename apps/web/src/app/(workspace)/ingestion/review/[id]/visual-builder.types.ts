export interface VisualBuilderProps {
  editedData: string;
  onChange: (newData: string) => void;
  disabled: boolean;
  organizationId: string;
  onConfirmAlias?: (rawString: string, masterId: string) => void;
}

export interface ParsedInvoiceItem {
  rawName?: string;
  vendor_item_code?: string | null;
  raw_description?: string;
  uom?: string | null;
  unit?: string | null;
  category?: 'ingredient' | 'cleaning' | 'office' | 'packaging' | 'other' | null;
  pack_size?: string | null;
  ordered_quantity?: number;
  ordered_unit?: string;
  shipped_quantity?: number;
  shipped_unit?: string;
  unit_price?: number;
  extended_price?: number;
  is_taxable?: boolean;
  is_shortage?: boolean;
  predicted_internal_ingredient?: string;
  itemId?: string | null;
  each_weight_g?: number | null;
  _requiresWeightInput?: boolean;
  quantity?: number;
  pricePerUnit?: number;
  totalPrice?: number;
  _tempWeightUnit?: string;
  _tempWeightVal?: number;
  confidence?: number;
  mappedName?: string;
}

export interface ParsedInvoice {
  vendorId?: string | null;
  vendorName?: string | null;
  vendorAddress?: string | null;
  vendorPhone?: string | null;
  vendorEmail?: string | null;
  orderNumber?: string | null;
  previousBalance?: number | null;
  totalDue?: number | null;
  notes?: string | null;
  invoiceNumber?: string | null;
  totalAmount?: number | null;
  items: ParsedInvoiceItem[];
}

export interface ItemOption {
  id: string;
  name: string;
  each_weight_g?: number | null;
}

export interface VendorOption {
  id: string;
  name: string;
}
