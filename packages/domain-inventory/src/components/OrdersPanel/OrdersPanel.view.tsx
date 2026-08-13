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
  onPlaceOrder: (id: string) => Promise<void>;
  onShopOrder: (id: string) => void;
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
  onPlaceOrder,
  onShopOrder,
}: OrdersPanelViewProps) {
  return (
    <div className="flex-1 bg-background p-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <TwoToneHeader
          breadcrumb="Procurement / Living Order List"
          title="Order Manager"
        />
        <div className="flex bg-muted/50 dark:bg-card/70 rounded-2xl p-1 border border-border dark:border-border">
          {(["list", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                [
                  "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab
                    ? "bg-background dark:bg-zinc-800 shadow-sm text-primary"
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
          onPlaceOrder={onPlaceOrder}
          onShopOrder={onShopOrder}
        />
      )}
    </div>
  );
}
