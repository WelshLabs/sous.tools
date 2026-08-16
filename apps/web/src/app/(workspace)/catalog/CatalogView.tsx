"use client";

import React, { useState } from "react";
import { Search, Edit3, X, Save, Image, DollarSign } from "lucide-react";
import { Button } from "@soustools/design-system";
import { toast } from "sonner";
import { api } from "@soustools/api-client";

export interface PosItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_sold_out: boolean;
  external_id: string;
}

export interface PosCategory {
  id: string;
  name: string;
  external_id: string;
}

export interface PosModifierGroup {
  id: string;
  name: string;
  external_id: string;
  pos_modifier_options: any[];
}

export interface PosDiscount {
  id: string;
  name: string;
  discount_type: string;
  amount_or_percentage: number;
  external_id: string;
}

interface CatalogViewProps {
  initialItems: PosItem[];
  categories: PosCategory[];
  modifierGroups: PosModifierGroup[];
  discounts: PosDiscount[];
}

type TabType = "ITEMS" | "CATEGORIES" | "MODIFIERS" | "DISCOUNTS";

export function CatalogView({
  initialItems,
  categories,
  modifierGroups,
  discounts,
}: CatalogViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ITEMS");
  const [items, setItems] = useState<PosItem[]>(initialItems);
  const [search, setSearch] = useState("");

  // Edit Modal State (For Items)
  const [editingItem, setEditingItem] = useState<PosItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSoldOut, setEditSoldOut] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (item: PosItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditPrice(item.price.toString());
    setEditSoldOut(item.is_sold_out);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || saving) return;

    setSaving(true);
    try {
      const { error } = await (api.PUT as any)("/pos-simulator/items/{id}", {
        params: { path: { id: editingItem.id } },
        body: {
          name: editName,
          description: editDesc || null,
          price: parseFloat(editPrice) || 0,
          is_sold_out: editSoldOut,
        },
      });

      if (error) throw new Error("Failed to update item");

      toast.success("Catalog item updated successfully!");
      setEditingItem(null);
      // Ideally we would trigger a revalidation here or mutate local state
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: editName,
                description: editDesc,
                price: parseFloat(editPrice),
                is_sold_out: editSoldOut,
              }
            : item,
        ),
      );
    } catch (err: any) {
      toast.error(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="animate-fadeIn relative mx-auto max-w-7xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          POS Catalog
        </h1>
        <p className="dark:text-muted-foreground mt-1 text-sm text-zinc-500">
          View and manage POS-synchronized catalog entities.
        </p>
      </div>

      <div className="flex space-x-2 border-b border-black/5 pb-2 dark:border-white/5">
        {(["ITEMS", "CATEGORIES", "MODIFIERS", "DISCOUNTS"] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-cyan-400 bg-cyan-500/20 text-cyan-400"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ),
        )}
      </div>

      {activeTab === "ITEMS" && (
        <>
          <div className="glass-panel flex items-center justify-between gap-4 rounded-2xl border border-black/5 p-4 dark:border-white/5">
            <div className="relative w-full md:w-80">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search catalog items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dark:bg-card w-full rounded-xl border border-zinc-800 bg-zinc-50 py-2 pr-4 pl-9 text-xs text-white transition-all outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`glass-panel relative flex flex-col justify-between rounded-2xl border p-5 transition-all hover:border-white/15 ${
                  item.is_sold_out
                    ? "border-rose-500/20 bg-rose-950/5"
                    : "border-black/5 dark:border-white/5"
                }`}
              >
                <div>
                  <div className="dark:bg-card mb-4 flex aspect-video w-full items-center justify-center rounded-xl border border-black/5 bg-zinc-100 text-zinc-700 dark:border-white/5">
                    <Image className="h-8 w-8" />
                  </div>
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="truncate pr-2 text-sm font-bold text-zinc-200">
                      {item.name}
                    </h3>
                    <span className="shrink-0 font-mono text-xs font-bold text-sky-400">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 min-h-[32px] text-xs dark:text-zinc-500">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      item.is_sold_out
                        ? "border-rose-500/20 bg-rose-950/20 text-rose-400"
                        : "border-emerald-500/20 bg-emerald-950/20 text-emerald-400"
                    }`}
                  >
                    {item.is_sold_out ? "Sold Out" : "Active"}
                  </span>

                  <button
                    onClick={() => startEdit(item)}
                    className="bg-card dark:text-muted-foreground rounded-xl border border-zinc-800 p-2 text-zinc-500 transition-all hover:border-zinc-700 hover:bg-black/5 hover:text-white"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "CATEGORIES" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-panel flex flex-col justify-between rounded-xl border border-white/10 p-4"
            >
              <h3 className="font-bold text-white">{cat.name}</h3>
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {cat.external_id}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "MODIFIERS" && (
        <div className="space-y-4">
          {modifierGroups.map((mg) => (
            <div
              key={mg.id}
              className="glass-panel rounded-xl border border-white/10 p-4"
            >
              <h3 className="text-lg font-bold text-white">{mg.name}</h3>
              <p className="mb-4 font-mono text-xs text-zinc-500">
                {mg.external_id}
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {mg.pos_modifier_options?.map((opt: any) => (
                  <div
                    key={opt.id}
                    className="flex justify-between rounded-lg border border-white/5 bg-slate-900/50 p-3"
                  >
                    <span className="text-sm text-slate-300">{opt.name}</span>
                    <span className="font-mono text-xs text-cyan-400">
                      +${opt.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "DISCOUNTS" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {discounts.map((disc) => (
            <div
              key={disc.id}
              className="glass-panel rounded-xl border border-white/10 p-4"
            >
              <h3 className="font-bold text-white">{disc.name}</h3>
              <p className="mt-1 text-sm text-cyan-400">
                {disc.discount_type === "FIXED_PERCENTAGE"
                  ? `${disc.amount_or_percentage}%`
                  : `$${disc.amount_or_percentage}`}
              </p>
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {disc.external_id}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Slide-over Panel */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-white/50 backdrop-blur-sm dark:bg-black/60"
            onClick={() => setEditingItem(null)}
          />
          <div className="dark:bg-card animate-in slide-in-from-right relative flex h-full w-full max-w-md flex-col border-l border-black/10 bg-zinc-50 shadow-2xl duration-300 dark:border-white/10">
            <div className="bg-card/40 flex items-center justify-between border-b border-black/5 p-6 dark:border-white/5">
              <h2 className="text-xl font-bold text-white">
                Edit Catalog Item
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="dark:text-muted-foreground bg-card rounded-full p-2 text-zinc-500 transition-all hover:bg-black/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSaveItem}
              className="flex-1 space-y-6 overflow-y-auto p-6"
            >
              {/* Form fields... */}
              <div className="space-y-1.5">
                <label className="dark:text-muted-foreground text-xs font-semibold text-zinc-500">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="dark:bg-card border-zinc-850 w-full rounded-xl border bg-zinc-100 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="dark:text-muted-foreground text-xs font-semibold text-zinc-500">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="dark:bg-card border-zinc-850 w-full resize-none rounded-xl border bg-zinc-100 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="dark:text-muted-foreground text-xs font-semibold text-zinc-500">
                  Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 transform dark:text-zinc-500" />
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="dark:bg-card border-zinc-850 w-full rounded-xl border bg-zinc-100 py-2.5 pr-4 pl-9 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 pt-6 dark:border-white/5">
                <div>
                  <span className="block text-xs font-bold text-zinc-200">
                    Inventory Status
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-[10px] dark:text-zinc-500">
                    Mark this item sold out globally
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditSoldOut(!editSoldOut)}
                  className={`h-6 w-12 rounded-full p-1 transition-all ${editSoldOut ? "bg-rose-500" : "bg-zinc-800"}`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white transition-all ${editSoldOut ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="mt-auto flex justify-end gap-3 border-t border-black/5 pt-6 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-sky-500 text-white hover:bg-sky-600"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
