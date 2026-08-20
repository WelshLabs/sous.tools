"use client";

import React from "react";
import { toast } from "sonner";
import { OrdersPanel } from "@soustools/domain-inventory";
import type {
  Vendor,
  WhiteboardItem,
  PurchaseOrder,
} from "@soustools/api-types";
import { useRouter } from "next/navigation";

export interface OrdersClientProps {
  initialVendors: Vendor[];
  initialWhiteboardItems: WhiteboardItem[];
  initialPurchaseOrders: PurchaseOrder[];
}

export function OrdersClient({
  initialVendors,
  initialWhiteboardItems,
  initialPurchaseOrders,
}: OrdersClientProps) {
  const router = useRouter();

  const handleAddFreeText = async (
    rawName: string,
    vendorId: string | null,
  ) => {
    try {
      if (vendorId) {
        // Add to DRAFT PO
        const res = await fetch("/api/purchase-orders/draft-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raw_name: rawName,
            vendor_id: vendorId,
            ordered_qty: 1,
          }),
        });
        if (!res.ok) throw new Error("Failed to add to draft");
        const payload = await res.json();
        router.refresh();
        return payload.data?.id as string;
      } else {
        // Unassigned item goes to whiteboard
        const res = await fetch("/api/whiteboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw_name: rawName }),
        });
        if (!res.ok) throw new Error("Failed to save item");
        const payload = await res.json();
        router.refresh();
        return payload.data?.id as string;
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
      return null;
    }
  };

  const handleUpdateItemQty = async (
    itemId: string,
    qty: number,
    isWhiteboard: boolean,
  ) => {
    if (isWhiteboard) return; // Whiteboard items do not have qty
    try {
      const res = await fetch(`/api/purchase-orders/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordered_qty: qty }),
      });
      if (!res.ok) throw new Error("Failed to update item");
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`);
    }
  };

  const handleUpdateItemUnit = async (
    itemId: string,
    unit: string,
    isWhiteboard: boolean,
  ) => {
    if (isWhiteboard) return;
    try {
      await fetch(`/api/purchase-orders/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit }),
      });
    } catch (_err: unknown) {
      // Optimistic update handled locally
    }
  };

  const handleRemoveItem = async (id: string, isWhiteboard: boolean) => {
    try {
      if (isWhiteboard) {
        const res = await fetch(`/api/whiteboard/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove item");
      } else {
        const res = await fetch(`/api/purchase-orders/items/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove item");
      }
    } catch (err: any) {
      toast.error(`Remove failed: ${err.message}`);
    }
  };

  const handleSubmitPO = async (poId: string) => {
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/submit`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to submit order");
      toast.success("Order submitted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(`Submit failed: ${err.message}`);
    }
  };

  const handleChangeSupplier = async (
    id: string,
    supplierId: string | null,
    isWhiteboard: boolean,
    rawName: string,
  ) => {
    try {
      // 1. Delete old item
      if (isWhiteboard) {
        await fetch(`/api/whiteboard/${id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/purchase-orders/items/${id}`, { method: "DELETE" });
      }

      // 2. Create new item
      if (supplierId) {
        await fetch("/api/purchase-orders/draft-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raw_name: rawName,
            vendor_id: supplierId,
            ordered_qty: 1,
          }),
        });
      } else {
        await fetch("/api/whiteboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw_name: rawName }),
        });
      }

      router.refresh();
    } catch (err: any) {
      toast.error(`Change supplier failed: ${err.message}`);
    }
  };

  const handleShopOrder = (poId: string) => {
    router.push(`/orders/${poId}/shop`);
  };

  return (
    <OrdersPanel
      vendors={initialVendors}
      whiteboardItems={initialWhiteboardItems}
      purchaseOrders={initialPurchaseOrders}
      onAddFreeText={handleAddFreeText}
      onRemoveItem={handleRemoveItem}
      onUpdateItemQty={handleUpdateItemQty}
      onUpdateItemUnit={handleUpdateItemUnit}
      onChangeSupplier={handleChangeSupplier}
      onSubmitPO={handleSubmitPO}
      onShopOrder={handleShopOrder}
    />
  );
}
