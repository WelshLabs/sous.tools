"use client";

import {
  QuickAddBar,
  InsightsSidebar,
  type QuickAddSuggestion,
} from "@soustools/design-system";
import {
  SupplierOrderGroup,
  EmptyOrderList,
} from "./components/Supplier/SupplierOrderGroup";
import type {
  OrderLineItem,
  OrderSupplier,
} from "./components/Supplier/SupplierOrderGroup.types";

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

/** Presentational: Active living order list tab with QuickAddBar + grouped supplier rows. */
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
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-[3] flex flex-col gap-8 min-w-0">
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

      <div className="w-full lg:flex-1 lg:min-w-[240px] lg:max-w-[320px] sticky top-8">
        <InsightsSidebar suppliers={suppliers} />
      </div>
    </div>
  );
}
