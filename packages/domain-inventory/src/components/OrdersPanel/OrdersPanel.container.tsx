"use client";

import { useState, useMemo, useEffect } from "react";
import { inferVendorForItem, type OrderLineItem, type OrderSupplier } from "@soustools/design-system";
import type { Vendor, WhiteboardItem, PurchaseOrder, PurchaseOrderItem } from "@soustools/api-types";
import { OrdersPanelView } from "./OrdersPanel.view";

function toOrderSupplier(v: Vendor): OrderSupplier {
  return { id: v.id, name: v.name, deliveryDays: [], cutoffTime: "—" };
}

function toOrderLineItem(item: WhiteboardItem): OrderLineItem {
  return { id: item.id, rawName: item.raw_name, quantity: 1, unit: "ea", isSystemSuggestion: false, supplier: null };
}

function toOrderLineItemFromPo(item: PurchaseOrderItem, vendorId: string, suppliers: OrderSupplier[]): OrderLineItem {
  return { id: item.id, rawName: item.raw_name, quantity: item.ordered_qty || 1, unit: "ea", isSystemSuggestion: false, supplier: suppliers.find((s) => s.id === vendorId) ?? null };
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
  vendors, whiteboardItems, purchaseOrders,
  onAddFreeText, onRemoveItem, onUpdateItemQty,
  onChangeSupplier, onSubmitPO, onShopOrder,
}: OrdersPanelProps) {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);

  const suppliers = useMemo(() => vendors.map(toOrderSupplier), [vendors]);

  const [items, setItems] = useState<OrderLineItem[]>(() => {
    const wItems = whiteboardItems.map(toOrderLineItem);
    const poItems = purchaseOrders
      .filter((po) => po.status === "DRAFT")
      .flatMap((po) => po.purchase_order_items?.map((i) => toOrderLineItemFromPo(i, po.vendor_id, suppliers)) ?? []);
    return [...wItems, ...poItems];
  });

  useEffect(() => {
    const wItems = whiteboardItems.map(toOrderLineItem);
    const poItems = purchaseOrders
      .filter((po) => po.status === "DRAFT")
      .flatMap((po) => po.purchase_order_items?.map((i) => toOrderLineItemFromPo(i, po.vendor_id, suppliers)) ?? []);
    setItems([...wItems, ...poItems]);
  }, [whiteboardItems, purchaseOrders, suppliers]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, OrderLineItem[]> = { unassigned: [] };
    items.forEach((item) => {
      const key = item.supplier?.id ?? "unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    if (groups["unassigned"]?.length === 0) delete groups["unassigned"];
    return groups;
  }, [items]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return items
      .filter((i) => i.rawName.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map((i) => ({ id: i.id, name: i.rawName, baseUnit: i.unit }));
  }, [searchQuery, items]);

  const handleAddFreeTextLocal = async (rawName: string) => {
    const inferredVendorId = inferVendorForItem(rawName);
    const assignedSupplier = suppliers.find((s) => s.id === inferredVendorId) ?? null;
    const tempId = `temp_${Date.now()}`;
    setItems((prev) => [...prev, { id: tempId, rawName, quantity: 1, unit: "ea", isSystemSuggestion: false, supplier: assignedSupplier }]);
    setSearchQuery("");
    const realId = await onAddFreeText(rawName, inferredVendorId);
    if (realId) {
      setItems((prev) => prev.map((i) => (i.id === tempId ? { ...i, id: realId } : i)));
    } else {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    }
  };

  const handleRemoveLocal = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await onRemoveItem(id, !item.supplier);
  };

  const handleChangeQty = async (id: string, qty: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    await onUpdateItemQty(id, qty, !item.supplier);
  };

  const handleChangeSupplierLocal = async (id: string, supplierId: string | null) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, supplier: suppliers.find((s) => s.id === supplierId) ?? null } : i));
    await onChangeSupplier(id, supplierId, !item.supplier, item.rawName);
  };

  const handlePlaceOrderLocal = async (supplierId: string) => {
    const po = purchaseOrders.find((p) => p.vendor_id === supplierId && p.status === "DRAFT");
    if (!po) return;
    setPlacingOrderId(supplierId);
    await onSubmitPO(po.id);
    setPlacingOrderId(null);
  };

  const handleShopOrderLocal = (supplierId: string) => {
    const po = purchaseOrders.find((p) => p.vendor_id === supplierId && p.status === "DRAFT");
    if (po) onShopOrder(po.id);
  };

  const historyOrders = useMemo(() => purchaseOrders.filter((po) => po.status !== "DRAFT"), [purchaseOrders]);

  return (
    <OrdersPanelView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      items={items}
      searchQuery={searchQuery}
      suggestions={suggestions}
      suppliers={suppliers}
      groupedItems={groupedItems}
      placingOrderId={placingOrderId}
      historyOrders={historyOrders}
      onSearchChange={setSearchQuery}
      onSelectSuggestion={() => setSearchQuery("")}
      onAddFreeText={handleAddFreeTextLocal}
      onRemoveItem={handleRemoveLocal}
      onChangeQty={handleChangeQty}
      onChangeSupplier={handleChangeSupplierLocal}
      onPlaceOrder={handlePlaceOrderLocal}
      onShopOrder={handleShopOrderLocal}
    />
  );
}
