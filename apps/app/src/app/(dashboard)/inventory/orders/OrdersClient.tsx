"use client";

import React from "react";
import { toast } from "sonner";
import { OrdersPanel } from "@soustools/domain-inventory";
import type { Vendor, WhiteboardItem } from "@soustools/api-types";
import { useRouter } from "next/navigation";

export interface OrdersClientProps {
  initialVendors: Vendor[];
  initialWhiteboardItems: WhiteboardItem[];
}

export function OrdersClient({ initialVendors, initialWhiteboardItems }: OrdersClientProps) {
  const router = useRouter();

  const handleAddFreeText = async (rawName: string) => {
    try {
      const res = await fetch("/api/whiteboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_name: rawName }),
      });
      if (!res.ok) throw new Error("Failed to save item");
      const data = await res.json();
      router.refresh();
      return data.id as string;
    } catch (err: any) {
      toast.error(err.message || "Network error");
      return null;
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const res = await fetch(`/api/whiteboard/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      router.refresh();
    } catch (err: any) {
      toast.error(`Remove failed: ${err.message}`);
    }
  };

  const handlePlaceOrder = async (supplierId: string) => {
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: supplierId }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      toast.success("Order placed successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(`Order failed: ${err.message}`);
    }
  };

  return (
    <OrdersPanel
      vendors={initialVendors}
      whiteboardItems={initialWhiteboardItems}
      onAddFreeText={handleAddFreeText}
      onRemoveItem={handleRemoveItem}
      onPlaceOrder={handlePlaceOrder}
    />
  );
}
