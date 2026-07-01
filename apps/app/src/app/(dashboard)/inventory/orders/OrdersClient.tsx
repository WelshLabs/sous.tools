"use client";

/**
 * Client shell for the Inventory Orders page.
 *
 * Responsibilities:
 *  - Owns all interactive state (active tab, search query, optimistic list mutations)
 *  - Receives real Vendor and WhiteboardItem data as props from the Server Component
 *  - Renders @soustools/ui components: TwoToneHeader, QuickAddBar, SupplierOrderGroup,
 *    InsightsSidebar
 *  - Writes back to Supabase via the browser client for add/remove operations
 *
 * This file must stay under 150 lines per architecture rules.
 * Heavy sub-components live in @soustools/ui.
 */

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
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
} from "@soustools/ui";
import type { Vendor, WhiteboardItem } from "@soustools/api-types";
import { supabase } from "@/lib/supabase";

/* ─── Adapters ────────────────────────────────────────────────────────────── */

/**
 * Maps a Vendor DB row to the OrderSupplier shape expected by UI components.
 * Vendor has no deliveryDays / cutoffTime in our schema yet — default safely.
 */
function toOrderSupplier(v: Vendor): OrderSupplier {
  return {
    id: v.id,
    name: v.name,
    deliveryDays: [],   // TODO: add delivery_days column to vendors table
    cutoffTime: "—",    // TODO: add cutoff_time column to vendors table
  };
}

/** Maps a WhiteboardItem to the OrderLineItem shape. */
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

/* ─── Props ───────────────────────────────────────────────────────────────── */

export interface OrdersClientProps {
  /** Real vendor rows from Supabase (fetched server-side). */
  vendors: Vendor[];
  /** Active whiteboard items from Supabase (fetched server-side). */
  whiteboardItems: WhiteboardItem[];
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function OrdersClient({ vendors, whiteboardItems }: OrdersClientProps) {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<OrderLineItem[]>(
    whiteboardItems.map(toOrderLineItem),
  );
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const suppliers = vendors.map(toOrderSupplier);

  /** Group items by their assigned supplier (null → "unassigned"). */
  const groupedItems = useMemo(() => {
    const groups: Record<string, OrderLineItem[]> = {};
    items.forEach((item) => {
      const key = item.supplier?.id ?? "unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  /** Suggestion list filtered by current search query. */
  const suggestions: QuickAddSuggestion[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    // Suggest from existing items not yet on the board
    return items
      .filter((i) =>
        i.rawName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5)
      .map((i) => ({ id: i.id, name: i.rawName, baseUnit: i.unit }));
  }, [searchQuery, items]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleAddFreeText = async (rawName: string) => {
    // Stub: intelligent vendor assignment
    const inferredVendorId = inferVendorForItem(rawName);
    const assignedSupplier =
      suppliers.find((s) => s.id === inferredVendorId) ?? null;

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

    try {
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();
      if (!org) throw new Error("Organization not found");

      const { data, error } = await supabase
        .from("whiteboard_items")
        .insert({ organization_id: org.id, raw_name: rawName })
        .select()
        .single();

      if (error) throw error;

      // Replace temp id with real id
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...i, id: data.id } : i)),
      );
      toast.success(`"${rawName}" added to order list`);
    } catch (err: unknown) {
      toast.error(`Failed to save item: ${(err as Error).message}`);
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    }
  };

  const handleSelectSuggestion = (s: QuickAddSuggestion) => {
    setSearchQuery("");
    // Item is already on the board if it matched — just clear search
    toast.info(`${s.name} is already on your list`);
  };

  const handleRemove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase
      .from("whiteboard_items")
      .update({ is_active: false })
      .eq("id", id);
    if (error) toast.error(`Remove failed: ${error.message}`);
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
          ? { ...i, supplier: suppliers.find((s) => s.id === supplierId) ?? null }
          : i,
      ),
    );
  };

  const handlePlaceOrder = (supplierId: string) => {
    setPlacingOrderId(supplierId);
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 800)); // TODO: real API call
      setItems((prev) => prev.filter((i) => i.supplier?.id !== supplierId));
      setPlacingOrderId(null);
      toast.success("Order placed successfully");
    });
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="flex-1 bg-background p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-row justify-between items-end mb-12">
        <TwoToneHeader
          breadcrumb="Procurement / Living Order List"
          title="Order Manager"
        />

        {/* Tab toggle */}
        <div className="flex bg-muted/50 dark:bg-zinc-900/70 rounded-2xl p-1 border border-border dark:border-zinc-800">
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
        <div className="flex flex-row gap-8 items-start">
          {/* Main list */}
          <div className="flex-[3] flex flex-col gap-8 min-w-0">
            <QuickAddBar
              value={searchQuery}
              onChange={setSearchQuery}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              onAddFreeText={handleAddFreeText}
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
                    onPlaceOrder={() => handlePlaceOrder(supplierId)}
                    onRemoveItem={handleRemove}
                    onChangeQty={handleChangeQty}
                    onChangeSupplier={handleChangeSupplier}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex-1 min-w-[240px] max-w-[320px] sticky top-8">
            <InsightsSidebar suppliers={suppliers} />
          </div>
        </div>
      )}
    </div>
  );
}
