"use client";

import React, { useState, useMemo } from "react";
import { ShoppingBag } from "lucide-react";
import {
  TwoToneHeader,
  QuickAddBar,
  QuickAddSuggestion,
  SupplierOrderGroup,
  EmptyOrderList,
  InsightsSidebar,
  OrderLineItem,
  OrderSupplier,
  inferVendorForItem,
} from "@soustools/design-system";
import type { Vendor, WhiteboardItem } from "@soustools/api-types";

function toOrderSupplier(v: Vendor): OrderSupplier {
  return {
    id: v.id,
    name: v.name,
    deliveryDays: [],
    cutoffTime: "—",
  };
}

function toOrderLineItem(item: WhiteboardItem): OrderLineItem {
  return {
    id: item.id,
    rawName: item.raw_name,
    quantity: 1,
    unit: "ea",
    isSystemSuggestion: false,
    supplier: null,
  };
}

export interface OrdersPanelProps {
  vendors: Vendor[];
  whiteboardItems: WhiteboardItem[];
  onAddFreeText: (rawName: string) => Promise<string | null>;
  onRemoveItem: (id: string) => Promise<void>;
  onPlaceOrder: (supplierId: string) => Promise<void>;
}

export function OrdersPanel({
  vendors,
  whiteboardItems,
  onAddFreeText,
  onRemoveItem,
  onPlaceOrder,
}: OrdersPanelProps) {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<OrderLineItem[]>(
    whiteboardItems.map(toOrderLineItem),
  );
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);

  const suppliers = vendors.map(toOrderSupplier);

  const groupedItems = useMemo(() => {
    const groups: Record<string, OrderLineItem[]> = {};
    items.forEach((item) => {
      const key = item.supplier?.id ?? "unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  const suggestions: QuickAddSuggestion[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return items
      .filter((i) =>
        i.rawName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5)
      .map((i) => ({ id: i.id, name: i.rawName, baseUnit: i.unit }));
  }, [searchQuery, items]);

  const handleAddFreeTextLocal = async (rawName: string) => {
    const inferredVendorId = inferVendorForItem(rawName);
    const assignedSupplier = suppliers.find((s) => s.id === inferredVendorId) ?? null;

    const tempId = `temp_${Date.now()}`;
    const newItem: OrderLineItem = {
      id: tempId,
      rawName,
      quantity: 1,
      unit: "ea",
      isSystemSuggestion: false,
      supplier: assignedSupplier,
    };

    setItems((prev) => [...prev, newItem]);
    setSearchQuery("");

    const realId = await onAddFreeText(rawName);
    if (realId) {
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...i, id: realId } : i)),
      );
    } else {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    }
  };

  const handleSelectSuggestion = (_s: QuickAddSuggestion) => {
    setSearchQuery("");
  };

  const handleRemoveLocal = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await onRemoveItem(id);
  };

  const handleChangeQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const handleChangeSupplier = (id: string, supplierId: string | null) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              supplier: suppliers.find((s) => s.id === supplierId) ?? null,
            }
          : i,
      ),
    );
  };

  const handlePlaceOrderLocal = async (supplierId: string) => {
    setPlacingOrderId(supplierId);
    await onPlaceOrder(supplierId);
    setItems((prev) => prev.filter((i) => i.supplier?.id !== supplierId));
    setPlacingOrderId(null);
  };

  return (
    <div className="flex-1 bg-background p-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <TwoToneHeader
          breadcrumb="Procurement / Living Order List"
          title="Order Manager"
        />

        <div className="flex bg-muted/50 dark:bg-card/70 rounded-2xl p-1 border border-border dark:border-zinc-800">
          {(["list", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-background dark:bg-zinc-800 shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab === "list" ? "Living List" : "Order History"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "history" ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <ShoppingBag size={64} className="mb-4 opacity-20" />
          <p className="text-sm font-black uppercase tracking-[0.2em]">
            Order History Coming Soon
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-[3] flex flex-col gap-8 min-w-0">
            <QuickAddBar
              value={searchQuery}
              onChange={setSearchQuery}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              onAddFreeText={handleAddFreeTextLocal}
            />

            {items.length === 0 ? (
              <EmptyOrderList />
            ) : (
              <div className="flex flex-col gap-12">
                {Object.entries(groupedItems).map(
                  ([supplierId, groupItems]) => (
                    <SupplierOrderGroup
                      key={supplierId}
                      supplier={
                        suppliers.find((s) => s.id === supplierId) ?? null
                      }
                      items={groupItems}
                      allSuppliers={suppliers}
                      isPlacingOrder={placingOrderId === supplierId}
                      onPlaceOrder={() => handlePlaceOrderLocal(supplierId)}
                      onRemoveItem={handleRemoveLocal}
                      onChangeQty={handleChangeQty}
                      onChangeSupplier={handleChangeSupplier}
                    />
                  ),
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:flex-1 lg:min-w-[240px] lg:max-w-[320px] sticky top-8">
            <InsightsSidebar suppliers={suppliers} />
          </div>
        </div>
      )}
    </div>
  );
}
