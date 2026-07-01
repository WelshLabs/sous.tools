/**
 * @route /inventory/orders
 *
 * Visual design experiment: faithfully recreates the v2 procurement/orders
 * Order Manager layout (apps/web/src/app/(admin)/procurement/orders/page.tsx)
 * using purely hardcoded dummy data inside the current app shell.
 *
 * Layout structure sourced from v2-snapshot.md:
 *   - Page header with breadcrumb + tab toggle (Living List / Order History)
 *   - Quick-add search bar with ingredient suggestion dropdown
 *   - Grouped shopping list by supplier (supplier header + item rows)
 *   - Sticky sidebar: Insights panel + Add Supplier CTA
 *
 * No real API calls or mutations are performed.
 */
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Truck,
  Calendar,
  Package,
  Clock,
  Zap,
  Plus,
  Trash2,
  X,
  Check,
  ShoppingBag,
  Loader2,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface Supplier {
  id: string;
  name: string;
  deliveryDays: number[];
  cutoffTime: string;
  minOrderValue: number;
}

interface ShoppingListItem {
  id: string;
  quantity: number;
  unit: string;
  source: "manual" | "system_suggestion";
  ingredient: { id: string; name: string };
  preferredSupplier: Supplier | null;
}

/* ─── Dummy Data ──────────────────────────────────────────────────────────── */

const DUMMY_SUPPLIERS: Supplier[] = [
  {
    id: "sup_sysco",
    name: "Sysco Foods",
    deliveryDays: [1, 3, 5],         // Mon / Wed / Fri
    cutoffTime: "16:00",
    minOrderValue: 25000,            // $250.00 in cents
  },
  {
    id: "sup_produce",
    name: "Fresh Fields Produce",
    deliveryDays: [2, 4],            // Tue / Thu
    cutoffTime: "10:00",
    minOrderValue: 7500,
  },
  {
    id: "sup_dairy",
    name: "Clover Dairy Co.",
    deliveryDays: [1, 4],            // Mon / Thu
    cutoffTime: "08:00",
    minOrderValue: 5000,
  },
];

const DUMMY_ITEMS: ShoppingListItem[] = [
  // Sysco group
  {
    id: "item_1",
    quantity: 10,
    unit: "kg",
    source: "system_suggestion",
    ingredient: { id: "ing_1", name: "Beef Tenderloin" },
    preferredSupplier: DUMMY_SUPPLIERS[0],
  },
  {
    id: "item_2",
    quantity: 5,
    unit: "kg",
    source: "manual",
    ingredient: { id: "ing_2", name: "Kosher Salt" },
    preferredSupplier: DUMMY_SUPPLIERS[0],
  },
  {
    id: "item_3",
    quantity: 2,
    unit: "L",
    source: "system_suggestion",
    ingredient: { id: "ing_3", name: "Extra Virgin Olive Oil" },
    preferredSupplier: DUMMY_SUPPLIERS[0],
  },
  // Produce group
  {
    id: "item_4",
    quantity: 8,
    unit: "kg",
    source: "manual",
    ingredient: { id: "ing_4", name: "Baby Arugula" },
    preferredSupplier: DUMMY_SUPPLIERS[1],
  },
  {
    id: "item_5",
    quantity: 20,
    unit: "pc",
    source: "system_suggestion",
    ingredient: { id: "ing_5", name: "Heirloom Tomatoes" },
    preferredSupplier: DUMMY_SUPPLIERS[1],
  },
  // Dairy group
  {
    id: "item_6",
    quantity: 3,
    unit: "kg",
    source: "manual",
    ingredient: { id: "ing_6", name: "Unsalted Butter" },
    preferredSupplier: DUMMY_SUPPLIERS[2],
  },
  // Unassigned
  {
    id: "item_7",
    quantity: 6,
    unit: "bottles",
    source: "manual",
    ingredient: { id: "ing_7", name: "White Truffle Oil" },
    preferredSupplier: null,
  },
];

const SEARCHABLE_INGREDIENTS = [
  { id: "ing_8",  name: "Foie Gras",       baseUnit: "kg"   },
  { id: "ing_9",  name: "Wagyu Ribeye",    baseUnit: "kg"   },
  { id: "ing_10", name: "Black Pepper",    baseUnit: "g"    },
  { id: "ing_11", name: "Heavy Cream",     baseUnit: "L"    },
  { id: "ing_12", name: "Microgreens",     baseUnit: "oz"   },
  { id: "ing_13", name: "Champagne Yeast", baseUnit: "pack" },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getNextDelivery(deliveryDays: number[]): string {
  if (!deliveryDays || deliveryDays.length === 0) return "No schedule";
  const today = new Date().getDay();
  const sorted = [...deliveryDays].sort((a, b) => a - b);
  const next = sorted.find((d) => d > today) ?? sorted[0];
  const daysUntil = next > today ? next - today : 7 - today + next;
  const date = new Date();
  date.setDate(date.getDate() + daysUntil);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function SupplierGroupHeader({
  supplier,
  items,
  onPlaceOrder,
}: {
  supplier: Supplier | null;
  items: ShoppingListItem[];
  onPlaceOrder: () => void;
}) {
  const isUnassigned = !supplier;
  return (
    <div className="flex flex-row items-center justify-between px-2">
      <div className="flex flex-row items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0",
            isUnassigned
              ? "bg-zinc-800/40 border-zinc-700"
              : "bg-sky-500/10 border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]",
          )}
        >
          <Truck
            size={22}
            className={isUnassigned ? "text-zinc-500" : "text-sky-500"}
          />
        </div>
        <div>
          <p className="font-black uppercase text-xl tracking-tighter text-zinc-100">
            {isUnassigned ? "Unassigned Items" : supplier.name}
          </p>
          {!isUnassigned && (
            <div className="flex flex-row items-center gap-3 mt-0.5">
              <div className="flex flex-row items-center gap-1.5 text-sky-500">
                <Calendar size={11} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Next: {getNextDelivery(supplier.deliveryDays)}
                </span>
              </div>
              <span className="text-zinc-700 text-[10px]">•</span>
              <div className="flex flex-row items-center gap-1.5 text-zinc-500">
                <Clock size={11} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Cutoff: {supplier.cutoffTime}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isUnassigned && (
        <button
          onClick={onPlaceOrder}
          className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3 group transition-colors"
        >
          <Check
            size={16}
            className="text-zinc-950 group-hover:scale-110 transition-transform"
          />
          <span className="text-zinc-950 font-black uppercase text-xs tracking-widest">
            Place Order ({items.length})
          </span>
        </button>
      )}
    </div>
  );
}

function OrderItemRow({
  item,
  onRemove,
}: {
  item: ShoppingListItem;
  onRemove: (id: string) => void;
}) {
  const [qty, setQty] = useState(String(item.quantity));
  return (
    <div className="p-4 bg-zinc-900/60 border border-zinc-800 hover:border-primary/30 transition-all flex flex-row items-center justify-between rounded-2xl group/item">
      <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/60 flex items-center justify-center border border-zinc-700 group-hover/item:bg-primary/5 transition-colors shrink-0">
          <Package
            size={16}
            className="text-zinc-500 group-hover/item:text-primary transition-colors"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase text-sm tracking-tight text-zinc-100 truncate">
            {item.ingredient.name}
          </p>
          <div className="flex flex-row items-center gap-2 mt-0.5">
            {item.source === "system_suggestion" && (
              <div className="flex flex-row items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Zap size={7} fill="currentColor" />
                <span className="text-[7px] font-black uppercase tracking-widest">
                  Suggested
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center gap-4 shrink-0">
        {/* Quantity input */}
        <div className="flex flex-row items-center gap-1 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/60">
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-12 bg-transparent text-center font-black text-sm outline-none text-zinc-100"
          />
          <span className="text-[10px] font-black uppercase text-zinc-500 pr-3 border-l border-zinc-700/60 pl-2">
            {item.unit}
          </span>
        </div>

        {/* Supplier select */}
        <select
          defaultValue={item.preferredSupplier?.id ?? ""}
          className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 h-10 text-[10px] font-black uppercase appearance-none text-zinc-300 min-w-[130px] outline-none focus:border-sky-500/50 transition-colors"
        >
          <option value="">Move to...</option>
          {DUMMY_SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          className="h-10 w-10 p-0 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400 text-zinc-600 flex items-center justify-center"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

/**
 * Inventory Orders page — visual design experiment.
 * Reproduces the v2 procurement Order Manager layout with hardcoded
 * dummy data for design evaluation.
 */
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<ShoppingListItem[]>(DUMMY_ITEMS);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [placingOrder, setPlacingOrder] = useState<string | null>(null);

  /* Group items by supplier */
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingListItem[]> = {};
    items.forEach((item) => {
      const key = item.preferredSupplier?.id ?? "unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  /* Ingredient search suggestions */
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return SEARCHABLE_INGREDIENTS.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ).slice(0, 5);
  }, [searchQuery]);

  const handleQuickAdd = (ing: (typeof SEARCHABLE_INGREDIENTS)[number]) => {
    const newItem: ShoppingListItem = {
      id: `item_new_${ing.id}`,
      quantity: 1,
      unit: ing.baseUnit,
      source: "manual",
      ingredient: { id: ing.id, name: ing.name },
      preferredSupplier: null,
    };
    setItems((prev) => [...prev, newItem]);
    setAddedIds((prev) => new Set(prev).add(ing.id));
    setSearchQuery("");
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePlaceOrder = async (supplierId: string) => {
    setPlacingOrder(supplierId);
    await new Promise((r) => setTimeout(r, 1200)); // Simulated async
    setItems((prev) =>
      prev.filter((i) => i.preferredSupplier?.id !== supplierId),
    );
    setPlacingOrder(null);
  };

  return (
    <div className="flex-1 bg-zinc-950 p-8 min-h-screen">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-row justify-between items-end mb-12">
        <div>
          <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] mb-2">
            Procurement / Living Order List
          </p>
          <h1 className="text-4xl font-black text-zinc-100 uppercase tracking-tighter">
            Order Manager
          </h1>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-zinc-900/70 rounded-2xl p-1 border border-zinc-800">
          <button
            onClick={() => setActiveTab("list")}
            className={cn(
              "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "list"
                ? "bg-zinc-800 shadow-sm text-sky-400"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Living List
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "history"
                ? "bg-zinc-800 shadow-sm text-sky-400"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Order History
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        /* ── Order History Placeholder ──────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
          <ShoppingBag size={64} className="mb-4 opacity-20" />
          <p className="text-sm font-black uppercase tracking-[0.2em]">
            Order History Coming Soon
          </p>
        </div>
      ) : (
        /* ── Living List View ───────────────────────────────────────────── */
        <div className="flex flex-row gap-8 items-start">
          {/* ── Main List Area (flex-3) ──────────────────────────────────── */}
          <div className="flex-[3] flex flex-col gap-8 min-w-0">
            {/* Quick-Add Search Bar */}
            <div className="relative z-[100]">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  placeholder="I noticed we are low on..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 pl-14 pr-14 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl font-bold text-lg uppercase tracking-tight text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Suggestion dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-20 left-0 right-0 p-2 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => handleQuickAdd(ing)}
                      className="flex flex-row items-center justify-between p-4 hover:bg-primary/10 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="flex flex-row items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-primary/20 transition-colors">
                          <Plus
                            size={16}
                            className="text-zinc-500 group-hover:text-primary transition-colors"
                          />
                        </div>
                        <span className="font-black uppercase tracking-tight text-zinc-200">
                          {ing.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                        {ing.baseUnit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items grouped by supplier */}
            {items.length === 0 ? (
              <div className="p-20 bg-zinc-900/40 border border-zinc-800 border-dashed items-center justify-center rounded-[2.5rem] flex flex-col">
                <div className="w-24 h-24 rounded-full bg-zinc-800/40 flex items-center justify-center mb-6">
                  <ShoppingBag size={48} className="text-zinc-700" />
                </div>
                <p className="text-zinc-500 font-black uppercase text-xs tracking-widest mb-2">
                  Everything looks good
                </p>
                <p className="text-zinc-600 text-sm max-w-xs text-center">
                  Your living order list is empty. Add items as you notice they
                  are low, or wait for system suggestions.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                {Object.entries(groupedItems).map(([supplierId, groupItems]) => {
                  const supplier =
                    DUMMY_SUPPLIERS.find((s) => s.id === supplierId) ?? null;
                  const isPlacing = placingOrder === supplierId;

                  return (
                    <div key={supplierId} className="flex flex-col gap-6">
                      <SupplierGroupHeader
                        supplier={supplier}
                        items={groupItems}
                        onPlaceOrder={() => handlePlaceOrder(supplierId)}
                      />
                      {isPlacing ? (
                        <div className="flex items-center justify-center py-10 text-sky-400">
                          <Loader2 size={28} className="animate-spin mr-3" />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Placing Order…
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {groupItems.map((item) => (
                            <OrderItemRow
                              key={item.id}
                              item={item}
                              onRemove={handleRemove}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Sidebar (flex-1) ─────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-8 min-w-[240px] max-w-[320px] sticky top-8">
            {/* Insights Card */}
            <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl shadow-2xl">
              <p className="text-zinc-100 font-black uppercase text-xs tracking-[0.2em] mb-6 flex flex-row items-center gap-2">
                <Zap size={13} className="text-amber-400" fill="currentColor" />
                Insights
              </p>

              <div className="flex flex-col gap-6">
                {/* Cutoff Reminders */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase text-zinc-500 leading-tight">
                    Cutoff Reminders
                  </p>
                  <div className="p-4 bg-zinc-800/40 border border-zinc-700 border-dashed rounded-2xl flex flex-col items-center justify-center">
                    <Clock size={22} className="text-zinc-700 mb-2" />
                    <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest text-center">
                      No orders reaching cutoff in next 4h
                    </p>
                  </div>
                </div>

                {/* Supplier Schedule */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase text-zinc-500 leading-tight">
                    Supplier Schedule
                  </p>
                  <div className="flex flex-col gap-2">
                    {DUMMY_SUPPLIERS.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-row items-center justify-between p-3 bg-zinc-800/30 border border-zinc-700/40 rounded-xl"
                      >
                        <span className="text-[9px] font-black uppercase text-zinc-400 truncate pr-2">
                          {s.name}
                        </span>
                        <span className="text-[8px] font-black uppercase text-sky-400 shrink-0">
                          {getNextDelivery(s.deliveryDays)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* New Supplier CTA Card */}
            <div className="p-6 bg-sky-500 border border-sky-400 rounded-3xl shadow-2xl shadow-sky-500/20">
              <div className="flex flex-row items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Plus size={15} className="text-white" />
                </div>
                <span className="text-white font-black uppercase text-[10px] tracking-widest">
                  New Supplier
                </span>
              </div>
              <p className="text-white/80 text-xs mb-6 font-medium leading-relaxed">
                Expand your network to optimize pricing and availability.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl h-10 font-black uppercase text-[10px] tracking-widest transition-colors">
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
