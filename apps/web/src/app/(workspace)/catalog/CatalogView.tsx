"use client";

import React, { useState } from "react";
import { Search, Edit3, X, Save, Image, DollarSign } from "lucide-react";
import { Button } from "@soustools/design-system";
import { toast } from "sonner";

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

export function CatalogView({ initialItems, categories, modifierGroups, discounts }: CatalogViewProps) {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos-simulator/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDesc || null,
          price: parseFloat(editPrice) || 0,
          is_sold_out: editSoldOut,
        }),
      });

      if (!res.ok) throw new Error("Failed to update item");

      toast.success("Catalog item updated successfully!");
      setEditingItem(null);
      // Ideally we would trigger a revalidation here or mutate local state
      setItems(items.map(item => item.id === editingItem.id ? { ...item, name: editName, description: editDesc, price: parseFloat(editPrice), is_sold_out: editSoldOut } : item));
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn relative">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          POS Catalog
        </h1>
        <p className="text-sm text-zinc-500 dark:text-muted-foreground mt-1">
          View and manage POS-synchronized catalog entities.
        </p>
      </div>

      <div className="flex space-x-2 border-b border-black/5 dark:border-white/5 pb-2">
        {(["ITEMS", "CATEGORIES", "MODIFIERS", "DISCOUNTS"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {activeTab === "ITEMS" && (
        <>
          <div className="glass-panel p-4 rounded-2xl border border-black/5 dark:border-white/5 flex gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search catalog items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-50 dark:bg-card border border-zinc-800 rounded-xl pl-9 pr-4 py-2 w-full text-xs text-white outline-none focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between hover:border-white/15 transition-all relative ${
                  item.is_sold_out
                    ? "border-rose-500/20 bg-rose-950/5"
                    : "border-black/5 dark:border-white/5"
                }`}
              >
                <div>
                  <div className="w-full aspect-video rounded-xl bg-zinc-100 dark:bg-card border border-black/5 dark:border-white/5 flex items-center justify-center mb-4 text-zinc-700">
                    <Image className="w-8 h-8" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-zinc-200 text-sm truncate pr-2">
                      {item.name}
                    </h3>
                    <span className="text-xs font-bold text-sky-400 font-mono shrink-0">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground dark:text-zinc-500 text-xs line-clamp-2 min-h-[32px]">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      item.is_sold_out
                        ? "text-rose-400 bg-rose-950/20 border-rose-500/20"
                        : "text-emerald-400 bg-emerald-950/20 border-emerald-500/20"
                    }`}
                  >
                    {item.is_sold_out ? "Sold Out" : "Active"}
                  </span>

                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 border border-zinc-800 rounded-xl hover:bg-black/5 bg-card hover:border-zinc-700 text-zinc-500 dark:text-muted-foreground hover:text-white transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "CATEGORIES" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
              <h3 className="text-white font-bold">{cat.name}</h3>
              <p className="text-xs text-zinc-500 mt-2 font-mono">{cat.external_id}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "MODIFIERS" && (
        <div className="space-y-4">
          {modifierGroups.map((mg) => (
            <div key={mg.id} className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-white font-bold text-lg">{mg.name}</h3>
              <p className="text-xs text-zinc-500 font-mono mb-4">{mg.external_id}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mg.pos_modifier_options?.map((opt: any) => (
                  <div key={opt.id} className="bg-slate-900/50 p-3 rounded-lg border border-white/5 flex justify-between">
                    <span className="text-sm text-slate-300">{opt.name}</span>
                    <span className="text-xs text-cyan-400 font-mono">+${opt.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "DISCOUNTS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {discounts.map((disc) => (
            <div key={disc.id} className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-white font-bold">{disc.name}</h3>
              <p className="text-sm text-cyan-400 mt-1">
                {disc.discount_type === "FIXED_PERCENTAGE" ? `${disc.amount_or_percentage}%` : `$${disc.amount_or_percentage}`}
              </p>
              <p className="text-xs text-zinc-500 mt-2 font-mono">{disc.external_id}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Slide-over Panel */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-50 dark:bg-card border-l border-black/10 dark:border-white/10 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-card/40">
              <h2 className="text-xl font-bold text-white">Edit Catalog Item</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-zinc-500 dark:text-muted-foreground hover:text-white hover:bg-black/5 bg-card rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Form fields... */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-zinc-100 dark:bg-card border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-muted-foreground">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-100 dark:bg-card border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-muted-foreground">Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-zinc-500 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full bg-zinc-100 dark:bg-card border border-zinc-850 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">Inventory Status</span>
                  <span className="text-[10px] text-muted-foreground dark:text-zinc-500 mt-0.5 block">Mark this item sold out globally</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditSoldOut(!editSoldOut)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${editSoldOut ? "bg-rose-500" : "bg-zinc-800"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${editSoldOut ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="border-t border-black/5 dark:border-white/5 pt-6 flex justify-end gap-3 mt-auto">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-sky-500 text-white hover:bg-sky-600">
                  <Save className="w-3.5 h-3.5" />
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
