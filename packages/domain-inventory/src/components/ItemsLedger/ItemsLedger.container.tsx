/* eslint-disable max-lines */
"use client";

import React, { useState, useRef } from "react";
import { Plus, Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ItemsLedgerView, type LedgerItem } from "./ItemsLedger.view";
import { ItemEditor } from "../ItemEditor";

import { graphqlClient } from "@soustools/api-client";

export interface ItemsLedgerProps {
  initialItems?: LedgerItem[];
}

const CREATE_ITEM_MUTATION = `
  mutation CreateItem($input: CreateItemInputGQL!) {
    createItem(input: $input) {
      id
      organization_id
      name
      category
      purchase_unit
      density_g_ml
      allergens
      current_cost_per_g
      fdc_id
      nutrition_macros
      created_at
      updated_at
    }
  }
`;

const UPDATE_ITEM_MUTATION = `
  mutation UpdateItem($id: String!, $input: UpdateItemInputGQL!) {
    updateItem(id: $id, input: $input) {
      id
      organization_id
      name
      category
      purchase_unit
      density_g_ml
      allergens
      current_cost_per_g
      fdc_id
      nutrition_macros
      created_at
      updated_at
    }
  }
`;

const DELETE_ITEM_MUTATION = `
  mutation DeleteItem($id: String!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

export function ItemsLedgerContainer({ initialItems = [] }: ItemsLedgerProps) {
  const [items, setItems] = useState<LedgerItem[]>(initialItems);
  const [loading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LedgerItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: LedgerItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Record<string, any>) => {
    try {
      if (selectedItem) {
        const res = await graphqlClient.request<{ updateItem: any }>(
          UPDATE_ITEM_MUTATION,
          { id: selectedItem.id, input: data },
        );
        if (res.data?.updateItem) {
          const itemData = res.data.updateItem;
          setItems((prev) =>
            prev.map((i) =>
              i.id === selectedItem.id ? { ...i, ...itemData } : i,
            ),
          );
          setIsModalOpen(false);
          toast.success("Item updated");
        } else {
          toast.error("Failed to update item");
        }
      } else {
        const res = await graphqlClient.request<{ createItem: any }>(
          CREATE_ITEM_MUTATION,
          { input: data },
        );
        if (res.data?.createItem) {
          setItems((prev) => [...prev, res.data!.createItem]);
          setIsModalOpen(false);
          toast.success("Item created");
        } else {
          toast.error("Failed to create item");
        }
      }
    } catch (_err) {
      toast.error("Error saving item");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      typeof window !== "undefined" &&
      !confirm("Are you sure you want to delete this item?")
    )
      return;
    try {
      const res = await graphqlClient.request<{ deleteItem: any }>(
        DELETE_ITEM_MUTATION,
        { id },
      );
      if (res.data?.deleteItem) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Item deleted");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (_err) {
      toast.error("Error deleting item");
    }
  };

  const handleSearchUSDA = async (query: string) => {
    try {
      const res = await graphqlClient.request<{ usdaSearch: any }>(
        `query SearchUSDA($query: String!) { usdaSearch(query: $query) }`,
        { query },
      );
      if (res.data?.usdaSearch) {
        return { success: true, data: res.data.usdaSearch };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  };

  const handleExportCSV = () => {
    if (!items.length) return;
    const headers = [
      "name",
      "category",
      "purchase_unit",
      "density_g_ml",
      "allergens",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      items
        .map((e) =>
          headers
            .map((h) => JSON.stringify((e as Record<string, any>)[h] || ""))
            .join(","),
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "items_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length < 2) return;

        const headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.replace(/^"|"$/g, ""));
          const payload: Record<string, any> = {};
          headers.forEach((h, idx) => {
            if (h === "density_g_ml")
              payload[h] = parseFloat(values[idx]) || 1.0;
            else if (h === "allergens")
              payload[h] = values[idx]
                ? values[idx].split(";").map((s) => s.trim())
                : [];
            else payload[h] = values[idx];
          });

          await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        toast.success("Import completed successfully");
      } catch (_err) {
        toast.error("Import failed");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-in fade-in mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Items Ledger
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your master ingredients, density, and nutrition.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportCSV}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
          >
            <Download size={18} /> Export
          </button>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImportCSV}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
          >
            {importing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}{" "}
            Import
          </button>
          <button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 font-medium shadow-lg transition-colors"
          >
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      <div className="bg-card text-card-foreground border-border dark:border-border overflow-hidden rounded-2xl border shadow-sm">
        <ItemsLedgerView
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen && (
        <ItemEditor
          item={selectedItem as any}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onSearchUSDA={handleSearchUSDA}
        />
      )}
    </div>
  );
}

export { ItemsLedgerContainer as ItemsLedger };
