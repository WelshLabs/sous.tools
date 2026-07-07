"use client";

import { useState, useMemo, useEffect } from "react";
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
import type { Vendor, WhiteboardItem, PurchaseOrder, PurchaseOrderItem } from "@soustools/api-types";

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

function toOrderLineItemFromPo(item: PurchaseOrderItem, vendorId: string, suppliers: OrderSupplier[]): OrderLineItem {
  return {
    id: item.id,
    rawName: item.raw_name,
    quantity: item.ordered_qty || 1,
    unit: "ea",
    isSystemSuggestion: false,
    supplier: suppliers.find(s => s.id === vendorId) ?? null,
  };
}

export interface OrdersPanelProps {
  vendors: Vendor[];
  whiteboardItems: WhiteboardItem[];
  purchaseOrders: PurchaseOrder[];
  onAddFreeText: (rawName: string, vendorId: string | null) => Promise<string | null>;
  onRemoveItem: (id: string, isWhiteboard: boolean) => Promise<void>;
  onUpdateItemQty: (id: string, qty: number, isWhiteboard: boolean) => Promise<void>;
  onChangeSupplier: (id: string, supplierId: string | null, isWhiteboard: boolean, rawName: string) => Promise<void>;
  onSubmitPO: (poId: string) => Promise<void>;
  onShopOrder: (poId: string) => void;
}

export function OrdersPanel({
  vendors,
  whiteboardItems,
  purchaseOrders,
  onAddFreeText,
  onRemoveItem,
  onUpdateItemQty,
  onChangeSupplier,
  onSubmitPO,
  onShopOrder,
}: OrdersPanelProps) {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);

  const suppliers = useMemo(() => vendors.map(toOrderSupplier), [vendors]);

  const [items, setItems] = useState<OrderLineItem[]>(() => {
    const wItems = whiteboardItems.map(toOrderLineItem);
    const poItems = purchaseOrders
      .filter(po => po.status === 'DRAFT')
      .flatMap(po => po.purchase_order_items?.map(i => toOrderLineItemFromPo(i, po.vendor_id, suppliers)) || []);
    return [...wItems, ...poItems];
  });

  // Keep items synced if server props change (e.g. after submit)
  useEffect(() => {
    const wItems = whiteboardItems.map(toOrderLineItem);
    const poItems = purchaseOrders
      .filter(po => po.status === 'DRAFT')
      .flatMap(po => po.purchase_order_items?.map(i => toOrderLineItemFromPo(i, po.vendor_id, suppliers)) || []);
    setItems([...wItems, ...poItems]);
  }, [whiteboardItems, purchaseOrders, suppliers]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, OrderLineItem[]> = {};
    
    // Ensure 'unassigned' is created first so it appears at the top
    groups["unassigned"] = [];
    
    items.forEach((item) => {
      const key = item.supplier?.id ?? "unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    
    if (groups["unassigned"].length === 0) {
      delete groups["unassigned"];
    }
    
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

    const realId = await onAddFreeText(rawName, inferredVendorId);
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
    const item = items.find(i => i.id === id);
    if (!item) return;
    const isWhiteboard = !item.supplier;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await onRemoveItem(id, isWhiteboard);
  };

  const handleChangeQty = async (id: string, qty: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const isWhiteboard = !item.supplier;
    
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
    await onUpdateItemQty(id, qty, isWhiteboard);
  };

  const handleChangeSupplierLocal = async (id: string, supplierId: string | null) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const isWhiteboard = !item.supplier;

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
    
    await onChangeSupplier(id, supplierId, isWhiteboard, item.rawName);
  };

  const handlePlaceOrderLocal = async (supplierId: string) => {
    const po = purchaseOrders.find(p => p.vendor_id === supplierId && p.status === 'DRAFT');
    if (!po) return;
    
    setPlacingOrderId(supplierId);
    await onSubmitPO(po.id);
    setPlacingOrderId(null);
  };

  const handleShopOrderLocal = (supplierId: string) => {
    const po = purchaseOrders.find(p => p.vendor_id === supplierId && p.status === 'DRAFT');
    if (po) {
      onShopOrder(po.id);
    }
  };

  const historyOrders = useMemo(() => purchaseOrders.filter(po => po.status !== 'DRAFT'), [purchaseOrders]);

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
        <div className="flex flex-col gap-4">
          {historyOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <ShoppingBag size={64} className="mb-4 opacity-20" />
              <p className="text-sm font-black uppercase tracking-[0.2em]">
                No Order History
              </p>
            </div>
          ) : (
            historyOrders.map(po => {
              const isReceived = po.status === 'RECEIVED' || po.status === 'RECONCILED';
              return (
                <div key={po.id} className={`glass-panel p-6 rounded-2xl flex items-center justify-between border border-border transition-opacity ${isReceived ? 'opacity-50' : ''}`}>
                  <div>
                    <h3 className="font-bold text-lg">{po.vendors?.name || "Unknown Vendor"}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(po.created_at).toLocaleDateString()} - {po.status}</p>
                  </div>
                  <button
                    onClick={() => onShopOrder(po.id)}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
                  >
                    View Order
                  </button>
                </div>
              );
            })
          )}
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
                      onChangeSupplier={handleChangeSupplierLocal}
                      onShopOrder={() => handleShopOrderLocal(supplierId)}
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
