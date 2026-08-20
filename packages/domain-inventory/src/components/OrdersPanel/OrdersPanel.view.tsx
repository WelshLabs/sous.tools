"use client";

import { TwoToneHeader } from "@soustools/design-system";
import { OrdersHistoryTab } from "./OrdersHistoryTab";
import { OrdersListTab } from "./OrdersListTab";
import type {
  OrderLineItem,
  OrderSupplier,
  QuickAddSuggestion,
} from "@soustools/design-system";
import type { PurchaseOrder } from "@soustools/api-types";

interface OrdersPanelViewProps {
  activeTab: "list" | "history";
  setActiveTab: (t: "list" | "history") => void;
  items: OrderLineItem[];
  searchQuery: string;
  suggestions: QuickAddSuggestion[];
  suppliers: OrderSupplier[];
  groupedItems: Record<string, OrderLineItem[]>;
  placingOrderId: string | null;
  historyOrders: PurchaseOrder[];
  onSearchChange: (v: string) => void;
  onSelectSuggestion: (s: QuickAddSuggestion) => void;
  onAddFreeText: (v: string) => Promise<void>;
  onRemoveItem: (id: string) => Promise<void>;
  onChangeQty: (id: string, qty: number) => Promise<void>;
  onChangeSupplier: (id: string, sId: string | null) => Promise<void>;
  onChangeUnit?: (id: string, unit: string) => void;
  onPlaceOrder: (id: string) => Promise<void>;
  onShopOrder: (id: string) => void;
  onAddVendor?: () => void;
}

export function OrdersPanelView({
  activeTab,
  setActiveTab,
  items,
  searchQuery,
  suggestions,
  suppliers,
  groupedItems,
  placingOrderId,
  historyOrders,
  onSearchChange,
  onSelectSuggestion,
  onAddFreeText,
  onRemoveItem,
  onChangeQty,
  onChangeSupplier,
  onChangeUnit,
  onPlaceOrder,
  onShopOrder,
  onAddVendor,
}: OrdersPanelViewProps) {
  return (
    <div className="bg-background min-h-screen flex-1 p-8">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <TwoToneHeader
          breadcrumb="Orders / Living Order List"
          title="Order Manager"
        />
        <div className="bg-muted/50 dark:bg-card/70 border-border dark:border-border flex rounded-2xl border p-1">
          {(["list", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                [
                  "h-10 rounded-xl px-6 text-[10px] font-black tracking-widest uppercase transition-all",
                  activeTab === tab
                    ? "bg-background text-primary shadow-sm dark:bg-zinc-800"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ") || undefined
              }
            >
              {tab === "list" ? "Living List" : "Order History"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "history" ? (
        <OrdersHistoryTab
          historyOrders={historyOrders}
          onShopOrder={onShopOrder}
        />
      ) : (
        <OrdersListTab
          items={items}
          searchQuery={searchQuery}
          suggestions={suggestions}
          suppliers={suppliers}
          groupedItems={groupedItems}
          placingOrderId={placingOrderId}
          onSearchChange={onSearchChange}
          onSelectSuggestion={onSelectSuggestion}
          onAddFreeText={onAddFreeText}
          onRemoveItem={onRemoveItem}
          onChangeQty={onChangeQty}
          onChangeSupplier={onChangeSupplier}
          onChangeUnit={onChangeUnit}
          onPlaceOrder={onPlaceOrder}
          onShopOrder={onShopOrder}
          onAddVendor={onAddVendor}
        />
      )}
    </div>
  );
}
