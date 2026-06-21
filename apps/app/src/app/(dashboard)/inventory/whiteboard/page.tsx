"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WhiteboardItem, Vendor } from "@soustools/api-types";
import { toast } from "sonner";
import { DraftPoModal } from "./DraftPoModal";

/**
 * WhiteboardPage represents the main interface for managing the kitchen whiteboard,
 * allowing staff to log items that need to be purchased.
 * 
 * @tenant-docs-export
 * # Kitchen Whiteboard
 * The Digital Whiteboard is a real-time list of ingredients, packaging, or items needed by the kitchen.
 * - **Adding Items**: Type the name of the item in the input box and click "Add" or press Enter.
 * - **Erasing Items**: Click "Erase" next to any item to remove it from the whiteboard.
 * - **Draft Purchase Order**: Consolidate multiple whiteboard items directly into a draft Purchase Order for any vendor.
 */
export default function WhiteboardPage() {
  const [items, setItems] = useState<WhiteboardItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [showPoModal, setShowPoModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Fetches active whiteboard items and registered vendors from Supabase.
   */
  const fetchData = async () => {
    try {
      const [iRes, vRes] = await Promise.all([
        supabase.from("whiteboard_items").select("*").eq("is_active", true).order("created_at"),
        supabase.from("vendors").select("*").order("name")
      ]);
      if (iRes.data) setItems(iRes.data);
      if (vRes.data) setVendors(vRes.data);
    } catch (err: any) {
      toast.error(`Error loading whiteboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Adds a new item to the whiteboard.
   * 
   * @param e React Form Event
   */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || isAdding) return;
    setIsAdding(true);

    try {
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();
      
      if (orgErr || !orgData) {
        toast.error(`Failed to retrieve organization details: ${orgErr?.message || "No data"}`);
        setIsAdding(false);
        return;
      }

      const { error: insertErr } = await supabase.from("whiteboard_items").insert({
        organization_id: orgData.id,
        raw_name: newItem.trim()
      });

      if (insertErr) {
        toast.error(`Failed to add item: ${insertErr.message}`);
      } else {
        toast.success("Item added successfully");
        setNewItem("");
        await fetchData();
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Erases/removes an item from the active whiteboard items list.
   * 
   * @param id The UUID of the whiteboard item.
   */
  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("whiteboard_items").update({ is_active: false }).eq("id", id);
    if (error) {
      toast.error(`Failed to remove item: ${error.message}`);
    } else {
      fetchData();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Whiteboard</h1>
          <p className="text-gray-500 mt-2">Ad-hoc To-Buy list for the kitchen.</p>
        </div>
        <button 
          onClick={() => setShowPoModal(true)} 
          disabled={items.length === 0} 
          className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Draft Purchase Order
        </button>
      </div>

      <div className="glass-panel p-8 min-h-[60vh] flex flex-col">
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <input 
            autoFocus
            value={newItem} 
            onChange={e => setNewItem(e.target.value)} 
            placeholder="Type item needed (e.g., 2 cases of Tomatoes) and press Enter..." 
            className="flex-1 bg-black/40 border border-white/10 rounded-md px-4 py-4 text-xl text-white placeholder-white/30" 
            disabled={isAdding}
          />
          <button 
            type="submit" 
            disabled={isAdding} 
            className="px-8 bg-blue-600 hover:bg-blue-500 rounded-md font-bold text-xl transition-colors disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </form>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="text-center text-white/30 py-10 text-xl">Loading board...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-white/30 py-10 text-xl">The board is empty. Kitchen is fully stocked!</div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex justify-between items-center group p-4 hover:bg-white/5 rounded-md transition-colors text-2xl font-medium border border-transparent hover:border-white/10">
                <span>• {item.raw_name}</span>
                <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold uppercase tracking-wider">
                  Erase
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <DraftPoModal 
        isOpen={showPoModal} 
        onClose={() => setShowPoModal(false)} 
        items={items} 
        vendors={vendors} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
