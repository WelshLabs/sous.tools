"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { PurchaseOrder, PurchaseOrderItem, Vendor } from "@soustools/api-types";
import { toast } from "sonner";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Send } from "lucide-react";

type PopulatedPO = PurchaseOrder & {
  vendors: Vendor;
  purchase_order_items: PurchaseOrderItem[];
};

export default function PurchasingPage() {
  const [pos, setPos] = useState<PopulatedPO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPOs = async () => {
    const { data } = await supabase
      .from("purchase_orders")
      .select(`
        *,
        vendors (*),
        purchase_order_items (*)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setPos(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchPOs(); }, []);

  const handleDispatch = async (po: PopulatedPO) => {
    const lines = po.purchase_order_items.map(i => `- ${i.ordered_qty}x ${i.raw_name}`).join("\n");
    const body = `Hello ${po.vendors.name},\n\nPlease process the following order:\n\n${lines}\n\nThank you,\nDtown Cafe`;

    if (po.vendors.order_method === "EMAIL" && po.vendors.email) {
      window.location.href = `mailto:${po.vendors.email}?subject=Purchase Order - Dtown Cafe&body=${encodeURIComponent(body)}`;
    } else if (po.vendors.order_method === "SMS" && po.vendors.phone) {
      window.location.href = `sms:${po.vendors.phone}?&body=${encodeURIComponent(body)}`;
    } else {
      toast("Manual order required. Please call " + (po.vendors.phone || "the vendor."));
    }

    if (po.status === "DRAFT") {
      await supabase.from("purchase_orders").update({ status: "SUBMITTED" }).eq("id", po.id);
      fetchPOs();
      toast.success("Order marked as Submitted");
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("purchase_orders").delete().eq("id", id);
    fetchPOs();
    toast.success("Order deleted");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Purchasing</h1>
          <p className="text-gray-500 mt-2">Manage purchase orders and dispatch to vendors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-white/50 py-12">Loading orders...</div>
        ) : pos.length === 0 ? (
          <div className="col-span-full text-center text-white/50 py-12">No purchase orders found.</div>
        ) : (
          pos.map(po => (
            <div key={po.id} className="glass-panel p-6 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{po.vendors?.name}</h2>
                  <p className="text-sm text-gray-400">{new Date(po.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                  po.status === "DRAFT" ? "bg-gray-600/50 text-gray-300" :
                  po.status === "SUBMITTED" ? "bg-blue-600/50 text-blue-300" :
                  "bg-green-600/50 text-green-300"
                }`}>
                  {po.status}
                </span>
              </div>

              <div className="flex-1 bg-black/40 rounded p-4 mb-6 border border-white/5">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Order Items</h3>
                <ul className="space-y-1">
                  {po.purchase_order_items?.map(item => (
                    <li key={item.id} className="text-sm flex justify-between">
                      <span>{item.raw_name}</span>
                      <span className="text-gray-400">x{item.ordered_qty}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                {po.status !== "RECONCILED" && (
                  <>
                    <button 
                      onClick={() => handleDispatch(po)}
                      className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Send size={16} /> Dispatch Order
                    </button>
                    <Link 
                      href={`/purchasing/${po.id}/shop`}
                      className="w-full flex items-center justify-center gap-2 border border-white/20 text-white py-2 rounded-md font-medium hover:bg-white/10 transition-colors"
                    >
                      <ShoppingBag size={16} /> Self-Shop Mode
                    </Link>
                  </>
                )}
                {po.status === "RECONCILED" && (
                  <div className="w-full flex items-center justify-center gap-2 text-green-400 py-2 border border-green-500/20 bg-green-500/10 rounded-md font-medium">
                    <CheckCircle size={16} /> Fully Reconciled
                  </div>
                )}
                <button onClick={() => handleDelete(po.id)} className="text-xs text-red-400 hover:text-red-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Delete Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
