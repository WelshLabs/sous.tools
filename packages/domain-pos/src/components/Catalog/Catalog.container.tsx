"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import {
  CatalogView,
  type PosCatalogItem,
  type PosCategory,
  type PosModifierGroup,
  type PosDiscount,
  type CatalogTabType,
} from "./Catalog.view";

export interface CatalogProps {
  initialItems?: PosCatalogItem[];
  categories?: PosCategory[];
  modifierGroups?: PosModifierGroup[];
  discounts?: PosDiscount[];
}

export function CatalogContainer({
  initialItems = [],
  categories = [],
  modifierGroups = [],
  discounts = [],
}: CatalogProps) {
  const [activeTab, setActiveTab] = useState<CatalogTabType>("ITEMS");
  const [items, setItems] = useState<PosCatalogItem[]>(initialItems);
  const [search, setSearch] = useState("");

  const [editingItem, setEditingItem] = useState<PosCatalogItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSoldOut, setEditSoldOut] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (item: PosCatalogItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditPrice(item.price.toString());
    setEditSoldOut(item.is_sold_out);
  };

  const cancelEdit = () => {
    setEditingItem(null);
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
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: editName,
                description: editDesc,
                price: parseFloat(editPrice) || 0,
                is_sold_out: editSoldOut,
              }
            : item,
        ),
      );
    } catch (err: any) {
      toast.error(`Failed to save changes: ${err.message || "Unknown error"}`);
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
    <CatalogView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      items={filteredItems}
      categories={categories}
      modifierGroups={modifierGroups}
      discounts={discounts}
      search={search}
      setSearch={setSearch}
      editingItem={editingItem}
      editName={editName}
      setEditName={setEditName}
      editDesc={editDesc}
      setEditDesc={setEditDesc}
      editPrice={editPrice}
      setEditPrice={setEditPrice}
      editSoldOut={editSoldOut}
      setEditSoldOut={setEditSoldOut}
      saving={saving}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onSaveItem={handleSaveItem}
    />
  );
}

export { CatalogContainer as Catalog };
