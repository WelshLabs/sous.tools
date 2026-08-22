/* eslint-disable max-lines */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  inferVendorForItem,
  type OrderLineItem,
  type OrderSupplier,
} from "@soustools/design-system";
import type {
  Vendor,
  WhiteboardItem,
  PurchaseOrder,
  PurchaseOrderItem,
} from "@soustools/api-types";
import { graphqlClient } from "@soustools/api-client";
import { toast } from "sonner";
import { OrdersPanelView } from "./OrdersPanel.view";
import { AddVendorModal } from "./AddVendorModal";

const CREATE_WHITEBOARD_MUTATION = `
  mutation CreateWhiteboardItem($input: CreateWhiteboardInputGQL!) {
    createWhiteboardItem(input: $input) {
      id
      custom_name
      quantity
      unit
      suggested_vendor_id
      status
    }
  }
`;

const UPDATE_WHITEBOARD_MUTATION = `
  mutation UpdateWhiteboardItem($id: String!, $input: UpdateWhiteboardInputGQL!) {
    updateWhiteboardItem(id: $id, input: $input) {
      id
      quantity
      unit
      status
    }
  }
`;

const DELETE_WHITEBOARD_MUTATION = `
  mutation DeleteWhiteboardItem($id: String!) {
    deleteWhiteboardItem(id: $id) {
      id
    }
  }
`;

const CREATE_PURCHASE_ORDER_MUTATION = `
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInputGQL!) {
    createPurchaseOrder(input: $input) {
      id
      vendor_id
      status
    }
  }
`;

const UPDATE_PURCHASE_ORDER_MUTATION = `
  mutation UpdatePurchaseOrder($id: String!, $input: UpdatePurchaseOrderInputGQL!) {
    updatePurchaseOrder(id: $id, input: $input) {
      id
      status
    }
  }
`;

function toOrderSupplier(v: Vendor): OrderSupplier {
  return { id: v.id, name: v.name, deliveryDays: [], cutoffTime: "—" };
}

function toOrderLineItem(item: WhiteboardItem): OrderLineItem {
  const rawName =
    (item as any).custom_name ||
    (item as any).raw_name ||
    (item as any).name ||
    "Item";
  return {
    id: item.id,
    rawName,
    quantity: (item as any).quantity || 1,
    unit: (item as any).unit || "ea",
    isSystemSuggestion: false,
    supplier: null,
  };
}

function toOrderLineItemFromPo(
  item: PurchaseOrderItem,
  vendorId: string,
  suppliers: OrderSupplier[],
): OrderLineItem {
  const rawName =
    (item as any).custom_name ||
    (item as any).raw_name ||
    (item as any).name ||
    "Item";
  return {
    id: item.id,
    rawName,
    quantity: (item as any).quantity || item.ordered_qty || 1,
    unit: (item as any).unit || "ea",
    isSystemSuggestion: false,
    supplier: suppliers.find((s) => s.id === vendorId) ?? null,
  };
}

export interface OrdersPanelProps {
  vendors?: Vendor[];
  initialVendors?: Vendor[];
  whiteboardItems?: WhiteboardItem[];
  initialWhiteboardItems?: WhiteboardItem[];
  purchaseOrders?: PurchaseOrder[];
  initialPurchaseOrders?: PurchaseOrder[];
  onAddFreeText?: (
    rawName: string,
    vendorId: string | null,
  ) => Promise<string | null>;
  onRemoveItem?: (id: string, isWhiteboard: boolean) => Promise<void>;
  onUpdateItemQty?: (
    id: string,
    qty: number,
    isWhiteboard: boolean,
  ) => Promise<void>;
  onUpdateItemUnit?: (
    id: string,
    unit: string,
    isWhiteboard: boolean,
  ) => Promise<void>;
  onChangeSupplier?: (
    id: string,
    supplierId: string | null,
    isWhiteboard: boolean,
    rawName: string,
  ) => Promise<void>;
  onSubmitPO?: (poId: string) => Promise<void>;
  onShopOrder?: (poId: string) => void;
  onAddVendor?: () => void;
  onVendorCreated?: (vendor: Vendor) => void;
}

export function OrdersPanel({
  vendors: propVendors,
  initialVendors = [],
  whiteboardItems: propWhiteboardItems,
  initialWhiteboardItems = [],
  purchaseOrders: propPurchaseOrders,
  initialPurchaseOrders = [],
  onAddFreeText: customOnAddFreeText,
  onRemoveItem: customOnRemoveItem,
  onUpdateItemQty: customOnUpdateItemQty,
  onUpdateItemUnit: customOnUpdateItemUnit,
  onChangeSupplier: customOnChangeSupplier,
  onSubmitPO: customOnSubmitPO,
  onShopOrder: customOnShopOrder,
  onAddVendor,
  onVendorCreated,
}: OrdersPanelProps) {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  const vendors = propVendors ?? initialVendors;
  const whiteboardItems = propWhiteboardItems ?? initialWhiteboardItems;
  const purchaseOrders = propPurchaseOrders ?? initialPurchaseOrders;

  const [localVendors, setLocalVendors] = useState<Vendor[]>(vendors);

  useEffect(() => {
    setLocalVendors(vendors);
  }, [vendors]);

  const suppliers = useMemo(
    () => localVendors.map(toOrderSupplier),
    [localVendors],
  );

  const [items, setItems] = useState<OrderLineItem[]>(() => {
    const wItems = whiteboardItems.map(toOrderLineItem);
    const poItems = purchaseOrders
      .filter((po) => po.status === "DRAFT")
      .flatMap(
        (po) =>
          po.purchase_order_items?.map((i) =>
            toOrderLineItemFromPo(i, po.vendor_id, suppliers),
          ) ?? [],
      );
    return [...wItems, ...poItems];
  });

  useEffect(() => {
    const wItems = whiteboardItems.map(toOrderLineItem);
    const poItems = purchaseOrders
      .filter((po) => po.status === "DRAFT")
      .flatMap(
        (po) =>
          po.purchase_order_items?.map((i) =>
            toOrderLineItemFromPo(i, po.vendor_id, suppliers),
          ) ?? [],
      );
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
      .filter((i) =>
        i.rawName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5)
      .map((i) => ({ id: i.id, name: i.rawName, baseUnit: i.unit }));
  }, [searchQuery, items]);

  const handleAddFreeTextLocal = async (rawName: string) => {
    const inferredVendorId = inferVendorForItem(rawName);
    const assignedSupplier =
      suppliers.find((s) => s.id === inferredVendorId) ?? null;
    const tempId = `temp_${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        rawName,
        quantity: 1,
        unit: "ea",
        isSystemSuggestion: false,
        supplier: assignedSupplier,
      },
    ]);
    setSearchQuery("");

    let realId: string | null = null;
    if (customOnAddFreeText) {
      realId = await customOnAddFreeText(rawName, inferredVendorId);
    } else {
      try {
        if (inferredVendorId) {
          const res = await graphqlClient.request<{ createPurchaseOrder: any }>(
            CREATE_PURCHASE_ORDER_MUTATION,
            {
              input: {
                vendor_id: inferredVendorId,
                items: [{ custom_name: rawName, quantity: 1 }],
              },
            },
          );
          realId = res.data?.createPurchaseOrder?.id || null;
        } else {
          const res = await graphqlClient.request<{ createWhiteboardItem: any }>(
            CREATE_WHITEBOARD_MUTATION,
            {
              input: { custom_name: rawName },
            },
          );
          realId = res.data?.createWhiteboardItem?.id || null;
        }
      } catch (err: any) {
        toast.error(err.message || "Network error");
      }
    }

    if (realId) {
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...i, id: realId } : i)),
      );
    } else {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    }
  };

  const handleRemoveLocal = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (customOnRemoveItem) {
      await customOnRemoveItem(id, !item.supplier);
    } else {
      try {
        if (!item.supplier) {
          await graphqlClient.request(DELETE_WHITEBOARD_MUTATION, { id });
        }
      } catch (err: any) {
        toast.error(`Remove failed: ${err.message}`);
      }
    }
  };

  const handleChangeQty = async (id: string, qty: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
    if (customOnUpdateItemQty) {
      await customOnUpdateItemQty(id, qty, !item.supplier);
    } else if (!item.supplier) {
      try {
        await graphqlClient.request(UPDATE_WHITEBOARD_MUTATION, {
          id,
          input: { quantity: qty },
        });
      } catch (err: any) {
        toast.error(`Update failed: ${err.message}`);
      }
    }
  };

  const handleChangeUnit = async (id: string, unit: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unit } : i)));
    if (customOnUpdateItemUnit) {
      await customOnUpdateItemUnit(id, unit, !item.supplier);
    } else if (!item.supplier) {
      try {
        await graphqlClient.request(UPDATE_WHITEBOARD_MUTATION, {
          id,
          input: { unit },
        });
      } catch {
        // Optimistic
      }
    }
  };

  const handleChangeSupplierLocal = async (
    id: string,
    supplierId: string | null,
  ) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
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
    if (customOnChangeSupplier) {
      await customOnChangeSupplier(
        id,
        supplierId,
        !item.supplier,
        item.rawName,
      );
    } else {
      try {
        if (!item.supplier) {
          await graphqlClient.request(DELETE_WHITEBOARD_MUTATION, { id });
        }

        if (supplierId) {
          await graphqlClient.request(CREATE_PURCHASE_ORDER_MUTATION, {
            input: {
              vendor_id: supplierId,
              items: [{ custom_name: item.rawName, quantity: 1 }],
            },
          });
        } else {
          await graphqlClient.request(CREATE_WHITEBOARD_MUTATION, {
            input: { custom_name: item.rawName },
          });
        }
      } catch (err: any) {
        toast.error(`Change supplier failed: ${err.message}`);
      }
    }
  };

  const handlePlaceOrderLocal = async (supplierId: string) => {
    const po = purchaseOrders.find(
      (p) => p.vendor_id === supplierId && p.status === "DRAFT",
    );
    if (!po) return;
    setPlacingOrderId(supplierId);
    if (customOnSubmitPO) {
      await customOnSubmitPO(po.id);
    } else {
      try {
        await graphqlClient.request(UPDATE_PURCHASE_ORDER_MUTATION, {
          id: po.id,
          input: { status: "SUBMITTED" },
        });
        toast.success("Order submitted successfully");
      } catch (err: any) {
        toast.error(`Submit failed: ${err.message}`);
      }
    }
    setPlacingOrderId(null);
  };

  const handleShopOrderLocal = (supplierId: string) => {
    const po = purchaseOrders.find(
      (p) => p.vendor_id === supplierId && p.status === "DRAFT",
    );
    if (!po) return;
    if (customOnShopOrder) {
      customOnShopOrder(po.id);
    } else if (typeof window !== "undefined") {
      window.location.href = `/orders/${po.id}/shop`;
    }
  };

  const handleAddVendorClick = () => {
    if (onAddVendor) {
      onAddVendor();
    } else {
      setIsAddVendorModalOpen(true);
    }
  };

  const handleVendorCreatedLocal = (newVendor: Vendor) => {
    setLocalVendors((prev) => {
      if (prev.some((v) => v.id === newVendor.id)) return prev;
      return [...prev, newVendor];
    });
    if (onVendorCreated) {
      onVendorCreated(newVendor);
    }
  };

  const historyOrders = useMemo(
    () => purchaseOrders.filter((po) => po.status !== "DRAFT"),
    [purchaseOrders],
  );

  return (
    <>
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
        onChangeUnit={handleChangeUnit}
        onPlaceOrder={handlePlaceOrderLocal}
        onShopOrder={handleShopOrderLocal}
        onAddVendor={handleAddVendorClick}
      />
      <AddVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
        onVendorCreated={handleVendorCreatedLocal}
      />
    </>
  );
}

export { OrdersPanel as OrdersPanelContainer };
