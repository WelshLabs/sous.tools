export interface OrderSupplier {
  id: string;
  name: string;
  deliveryDays: number[];
  cutoffTime: string;
}

export interface OrderLineItem {
  id: string;
  rawName: string;
  quantity: number;
  unit: string;
  isSystemSuggestion: boolean;
  supplier: OrderSupplier | null;
}
