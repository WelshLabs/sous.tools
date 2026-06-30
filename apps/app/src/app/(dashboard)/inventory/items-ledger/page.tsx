"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Download, Upload, Loader2 } from "lucide-react";
import ItemsLedgerTable from "../../../../components/inventory/items-ledger-table";
import ItemEditorModal from "../../../../components/inventory/item-editor-modal";

export default function ItemsLedgerPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/items");
      if (res.ok) {
        const payload = await res.json();
        setItems(payload.data || []);
      }
    } catch (err) {
      console.error("Failed to load items ledger", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      const url = selectedItem ? `/api/items/${selectedItem.id}` : "/api/items";
      const method = selectedItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchItems();
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleExportCSV = () => {
    if (!items.length) return;
    const headers = ["name", "category", "purchase_unit", "density_g_ml", "allergens"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n"
      + items.map(e => headers.map(h => JSON.stringify(e[h] || "")).join(",")).join("\\n");
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
        const lines = text.split("\\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return;
        
        const headers = lines[0].split(",");
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map(v => v.replace(/^"|"$/g, ""));
          const payload: any = {};
          headers.forEach((h, idx) => {
            if (h === "density_g_ml") payload[h] = parseFloat(values[idx]) || 1.0;
            else if (h === "allergens") payload[h] = values[idx] ? values[idx].split(";").map(s => s.trim()) : [];
            else payload[h] = values[idx];
          });
          
          await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        fetchItems();
      } catch (err) {
        console.error("Import failed", err);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Items Ledger</h1>
          <p className="text-gray-500 mt-2">Manage your master ingredients, density, and nutrition.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportCSV} className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-white font-medium rounded-lg flex items-center gap-2 transition-colors">
            <Download size={18} /> Export
          </button>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
          />
          <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-white font-medium rounded-lg flex items-center gap-2 transition-colors">
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Import
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-sky-500/20">
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
        <ItemsLedgerTable 
          items={items} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      {isModalOpen && (
        <ItemEditorModal 
          item={selectedItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
