"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface WastageEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultItemId?: string;
}

const UNIT_TO_G: Record<string, number> = { g: 1, oz: 28.35, lb: 453.59, kg: 1000 };

export function WastageEntryModal({ isOpen, onClose, defaultItemId }: WastageEntryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("g");
  const [reason, setReason] = useState("TRIM");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultItemId && isOpen) {
      fetch(`/api/items/${defaultItemId}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setSelectedItem({ id: json.data.id, name: json.data.name });
            setSearchQuery(json.data.name);
          }
        });
    }
  }, [defaultItemId, isOpen]);

  useEffect(() => {
    if (!searchQuery || selectedItem?.name === searchQuery) return setItems([]);
    const t = setTimeout(() => {
      fetch(`/api/items?search=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(json => json.success && setItems(json.data.slice(0, 8)));
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, selectedItem]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!selectedItem || isNaN(num) || num <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/wastage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem.id, amountG: num * (UNIT_TO_G[unit] || 1), reason }),
      });
      if ((await res.json()).success) {
        onClose();
        setAmount("");
        setSelectedItem(null);
        setSearchQuery("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 w-96 max-w-full glass-panel relative text-white space-y-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-semibold">Record Wastage</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-xs text-zinc-400">Search Item</label>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedItem(null); }} placeholder="Type item name..." className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" required />
            {items.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-zinc-850 border border-white/10 rounded-lg mt-1 z-50 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <button key={item.id} type="button" onClick={() => { setSelectedItem(item); setSearchQuery(item.name); setItems([]); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-850">{item.name}</button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Amount</label>
              <input type="number" step="any" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option value="g">grams (g)</option>
                <option value="oz">ounces (oz)</option>
                <option value="lb">pounds (lb)</option>
                <option value="kg">kilograms (kg)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="TRIM">Trim / Prep Waste</option>
              <option value="SPOILAGE">Spoilage</option>
              <option value="OVERPRODUCTION">Overproduction</option>
              <option value="SPILL">Spill / Dropped</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button type="submit" disabled={submitting || !selectedItem} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-sm font-semibold py-2 rounded-lg transition">
            {submitting ? "Saving..." : "Record Waste Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
