"use client";

import {
  QuickAddBar,
  InsightsSidebar,
  type QuickAddSuggestion,
} from "@soustools/design-system";
import {
  SupplierOrderGroup,
  EmptyOrderList,
} from "../Supplier/SupplierOrderGroup";
import type {
  OrderLineItem,
  OrderSupplier,
} from "../Supplier/SupplierOrderGroup.types";

interface ListTabProps {
  items: OrderLineItem[];
  searchQuery: string;
  suggestions: QuickAddSuggestion[];
  suppliers: OrderSupplier[];
  groupedItems: Record<string, OrderLineItem[]>;
  placingOrderId: string | null;
  onSearchChange: (v: string) => void;
  onSelectSuggestion: (s: QuickAddSuggestion) => void;
  onAddFreeText: (rawName: string) => Promise<void>;
  onRemoveItem: (id: string) => Promise<void>;
  onChangeQty: (id: string, qty: number) => Promise<void>;
  onChangeSupplier: (id: string, supplierId: string | null) => Promise<void>;
  onPlaceOrder: (supplierId: string) => Promise<void>;
  onShopOrder: (supplierId: string) => void;
}

export function OrdersListTab({
  items,
  searchQuery,
  suggestions,
  suppliers,
  groupedItems,
  placingOrderId,
  onSearchChange,
  onSelectSuggestion,
  onAddFreeText,
  onRemoveItem,
  onChangeQty,
  onChangeSupplier,
  onPlaceOrder,
  onShopOrder,
}: ListTabProps) {
  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <div className="flex min-w-0 flex-[3] flex-col gap-8">
        <QuickAddBar
          value={searchQuery}
          onChange={onSearchChange}
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
          onAddFreeText={onAddFreeText}
        />

        {items.length === 0 ? (
          <EmptyOrderList />
        ) : (
          <div className="flex flex-col gap-12">
            {Object.entries(groupedItems).map(([supplierId, groupItems]) => (
              <SupplierOrderGroup
                key={supplierId}
                supplier={suppliers.find((s) => s.id === supplierId) ?? null}
                items={groupItems}
                allSuppliers={suppliers}
                isPlacingOrder={placingOrderId === supplierId}
                onPlaceOrder={() => onPlaceOrder(supplierId)}
                onRemoveItem={onRemoveItem}
                onChangeQty={onChangeQty}
                onChangeSupplier={onChangeSupplier}
                onShopOrder={() => onShopOrder(supplierId)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sticky top-8 w-full lg:max-w-[320px] lg:min-w-[240px] lg:flex-1">
        <InsightsSidebar suppliers={suppliers} />
      </div>
    </div>
  );
}
