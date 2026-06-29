"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { WhiteboardItem, Vendor, PurchaseOrder, PurchaseOrderItem } from "@soustools/api-types";
import { toast } from "sonner";
import { DraftPoModal } from "./DraftPoModal";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Send, X } from "lucide-react";

type PopulatedPO = PurchaseOrder & {
  vendors: Vendor;
  purchase_order_items: PurchaseOrderItem[];
};

export default function OrdersPage() {
  // Whiteboard State
  const [items, setItems] = useState<WhiteboardItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [showPoModal, setShowPoModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Purchasing State
  const [pos, setPos] = useState<PopulatedPO[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [iRes, vRes, poRes] = await Promise.all([
        supabase.from("whiteboard_items").select("*").eq("is_active", true).order("created_at"),
        supabase.from("vendors").select("*").order("name"),
        supabase.from("purchase_orders").select("*, vendors(*), purchase_order_items(*)").order("created_at", { ascending: false })
      ]);
      if (iRes.data) setItems(iRes.data);
      if (vRes.data) setVendors(vRes.data);
      if (poRes.data) setPos(poRes.data as any);
    } catch (err: any) {
      toast.error(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || isAdding) return;
    setIsAdding(true);

    try {
      const { data: orgData, error: orgErr } = await supabase.from("organizations").select("id").limit(1).single();
      if (orgErr || !orgData) {
        toast.error(`Failed to retrieve organization details`);
        setIsAdding(false);
        return;
      }

      const { error: insertErr } = await supabase.from("whiteboard_items").insert({
        organization_id: orgData.id,
        raw_name: newItem.trim()
      });

      if (insertErr) toast.error(`Failed to add item: ${insertErr.message}`);
      else {
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

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("whiteboard_items").update({ is_active: false }).eq("id", id);
    if (error) toast.error(`Failed to remove item: ${error.message}`);
    else fetchData();
  };

  const handleDispatch = async (po: PopulatedPO) => {
    const lines = po.purchase_order_items.map(i => `- ${i.ordered_qty}x ${i.raw_name}`).join("\n");
    const body = `Hello ${po.vendors.name},\n\nPlease process the following order:\n\n${lines}\n\nThank you,\nDtown Cafe`;

    if (po.vendors.order_method === "EMAIL" && po.vendors.email) {
      window.location.href = `mailto:${po.vendors.email}?subject=Purchase Order - Dtown Cafe&body=${encodeURIComponent(body)}`;
    } else if (po.vendors.order_method === "SMS" && po.vendors.phone) {
      window.location.href = `sms:${po.vendors.phone}?&body=${encodeURIComponent(body)}`;
    } else {
      toast.error("Manual order required. Please call " + (po.vendors.phone || "the vendor."));
    }

    if (po.status === "DRAFT") {
      await supabase.from("purchase_orders").update({ status: "SUBMITTED" }).eq("id", po.id);
      fetchData();
      toast.success("Order marked as Submitted");
    }
  };

  const handleDeletePO = async (id: string) => {
    await supabase.from("purchase_orders").delete().eq("id", id);
    fetchData();
    toast.success("Order deleted");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex gap-6 relative overflow-hidden h-full">
      {/* Main Whiteboard View */}
      <div className="flex-1 space-y-6 animate-in fade-in transition-all">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Whiteboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Ad-hoc To-Buy list for the kitchen.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPoModal(true)} 
              disabled={items.length === 0} 
              className="bg-sky-500 text-white px-4 py-2 rounded-md font-medium hover:bg-sky-600 disabled:opacity-50 transition-colors hidden md:block"
            >
              Draft Purchase Order
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white px-4 py-2 rounded-md font-medium hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">View Orders</span>
              <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full">{pos.filter(p => p.status === 'DRAFT').length}</span>
            </button>
          </div>
        </div>

        <div className="st-glass-panel p-4 md:p-8 min-h-[60vh] flex flex-col bg-white dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
          <form onSubmit={handleAdd} className="flex gap-2 md:gap-4 mb-6 md:mb-8">
            <input 
              autoFocus
              value={newItem} 
              onChange={e => setNewItem(e.target.value)} 
              placeholder="Type item needed..." 
              className="flex-1 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-md px-4 py-3 md:py-4 text-lg md:text-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500" 
              disabled={isAdding}
            />
            <button 
              type="submit" 
              disabled={isAdding} 
              className="px-6 md:px-8 bg-sky-500 hover:bg-sky-600 rounded-md font-bold text-lg md:text-xl text-white transition-colors disabled:opacity-50"
            >
              {isAdding ? "..." : "Add"}
            </button>
          </form>

          <button 
            onClick={() => setShowPoModal(true)} 
            disabled={items.length === 0} 
            className="w-full mb-4 bg-sky-500 text-white px-4 py-3 rounded-md font-medium hover:bg-sky-600 disabled:opacity-50 transition-colors block md:hidden text-lg"
          >
            Draft Purchase Order
          </button>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="text-center text-zinc-400 dark:text-white/30 py-10 text-xl">Loading board...</div>
            ) : items.length === 0 ? (
              <div className="text-center text-zinc-400 dark:text-white/30 py-10 text-xl">The board is empty. Kitchen is fully stocked!</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center group p-3 md:p-4 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-md transition-colors text-xl md:text-2xl font-medium border border-transparent hover:border-zinc-200 dark:hover:border-white/10">
                  <span className="text-zinc-800 dark:text-zinc-100">• {item.raw_name}</span>
                  <button onClick={() => handleRemove(item.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 md:opacity-0 group-hover:opacity-100 transition-opacity text-xs md:text-sm font-bold uppercase tracking-wider px-2 py-1 bg-red-50 dark:bg-red-500/10 rounded">
                    Erase
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Purchasing Slide-out Sheet */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-white/10 shadow-2xl h-full flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Purchasing Orders</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {pos.length === 0 ? (
                <div className="text-center text-zinc-500 py-12">No purchase orders found.</div>
              ) : pos.map(po => (
                <div key={po.id} className="st-glass-panel p-5 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{po.vendors?.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(po.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                      po.status === "DRAFT" ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" :
                      po.status === "SUBMITTED" ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" :
                      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                    }`}>
                      {po.status}
                    </span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-black/40 rounded p-3 mb-4 border border-zinc-100 dark:border-white/5">
                    <ul className="space-y-1">
                      {po.purchase_order_items?.map(item => (
                        <li key={item.id} className="text-xs flex justify-between text-zinc-700 dark:text-zinc-300">
                          <span className="truncate pr-2">{item.raw_name}</span>
                          <span className="text-zinc-500 dark:text-zinc-400 shrink-0">x{item.ordered_qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    {po.status !== "RECONCILED" && (
                      <>
                        <button 
                          onClick={() => handleDispatch(po)}
                          className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 py-2 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
                        >
                          <Send size={14} /> Dispatch Order
                        </button>
                        <Link 
                          href={`/inventory/orders/${po.id}/shop`}
                          className="w-full flex items-center justify-center gap-2 border border-zinc-300 dark:border-white/20 text-zinc-700 dark:text-white py-2 rounded-md font-medium hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors text-sm"
                        >
                          <ShoppingBag size={14} /> Self-Shop Mode
                        </Link>
                      </>
                    )}
                    {po.status === "RECONCILED" && (
                      <div className="w-full flex items-center justify-center gap-2 text-green-600 dark:text-green-400 py-2 border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 rounded-md font-medium text-sm">
                        <CheckCircle size={14} /> Fully Reconciled
                      </div>
                    )}
                    <button onClick={() => handleDeletePO(po.id)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                      Delete Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
