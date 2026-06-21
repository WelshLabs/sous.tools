"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { WhiteboardItem, Vendor } from "@soustools/api-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Props structure for the DraftPoModal component.
 */
interface DraftPoModalProps {
  /** Indicates if the modal is visible */
  isOpen: boolean;
  /** Callback function called to close the modal */
  onClose: () => void;
  /** Active whiteboard items available for purchase */
  items: WhiteboardItem[];
  /** Registered vendors list for vendor selection */
  vendors: Vendor[];
  /** Callback triggered after a PO is successfully created to refresh page state */
  onSuccess: () => void;
}

/**
 * DraftPoModal enables the user to select specific whiteboard items and
 * compile them into a draft Purchase Order for a selected vendor.
 * 
 * @tenant-docs-export
 * # Creating a Purchase Order from Whiteboard
 * 1. Click "Draft Purchase Order" on the Whiteboard page.
 * 2. Select the vendor from the dropdown list.
 * 3. Check the items you want to include in this order.
 * 4. Click "Create PO". The selected items will be moved into a draft Purchase Order and cleared from the board.
 */
export function DraftPoModal({ isOpen, onClose, items, vendors, onSuccess }: DraftPoModalProps) {
  const router = useRouter();
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  /**
   * Toggles the selection state of a specific whiteboard item.
   * 
   * @param id The UUID of the whiteboard item.
   */
  const toggleSelection = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  /**
   * Handles creating a draft Purchase Order and inserting selected items.
   */
  const createPO = async () => {
    if (!selectedVendor || selectedItems.size === 0) return;
    setIsSubmitting(true);

    try {
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();
      
      if (orgErr || !orgData) {
        toast.error(`Could not locate organization details: ${orgErr?.message || "No data"}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: po, error: poErr } = await supabase.from("purchase_orders").insert({
        organization_id: orgData.id,
        vendor_id: selectedVendor,
        status: "DRAFT"
      }).select().single();

      if (poErr || !po) {
        toast.error(`Failed to create Purchase Order: ${poErr?.message || "Database insert error"}`);
        setIsSubmitting(false);
        return;
      }

      const itemsToInsert = Array.from(selectedItems).map(id => {
        const wbi = items.find(i => i.id === id);
        return { po_id: po.id, raw_name: wbi?.raw_name || "Unknown Item", ordered_qty: 1, price_per_unit: 0 };
      });

      const { error: itemsErr } = await supabase.from("purchase_order_items").insert(itemsToInsert);
      if (itemsErr) {
        toast.error(`Failed to attach items to Purchase Order: ${itemsErr.message}`);
        setIsSubmitting(false);
        return;
      }
      
      // Mark whiteboard items as inactive
      for (const id of Array.from(selectedItems)) {
        await supabase.from("whiteboard_items").update({ is_active: false }).eq("id", id);
      }

      toast.success("Purchase Order created successfully!");
      setSelectedItems(new Set());
      onSuccess();
      onClose();
      router.push("/purchasing");
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-6">Select Items for PO</h2>
        
        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium text-gray-400">Select Vendor</label>
          <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className="w-full bg-black/60 border border-white/20 rounded-md p-3 text-white">
            <option value="">-- Choose Vendor --</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.order_method})</option>)}
          </select>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 p-4 rounded-md mb-6">
          {items.map(item => (
            <label key={item.id} className="flex items-center gap-4 cursor-pointer p-2 hover:bg-white/5 rounded">
              <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelection(item.id)} className="w-5 h-5" />
              <span className="text-lg">{item.raw_name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-md font-medium hover:bg-white/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={createPO}
            disabled={!selectedVendor || selectedItems.size === 0 || isSubmitting} 
            className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
}
