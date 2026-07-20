"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { type PurchaseOrder, type PurchaseOrderItem, type Vendor } from "@soustools/api-types";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { api } from "@/lib/api";

type PopulatedPO = PurchaseOrder & {
  vendors: Vendor;
  purchase_order_items: PurchaseOrderItem[];
};

export default function SelfShopPage() {
  const { id } = useParams() as { id: string };
  const [po, setPo] = useState<PopulatedPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const { data, error } = await (api.GET as any)(`/purchase-orders/${id}`);
        if (!error && data) {
          const payload = (data as any).data;
          if (payload) {
            setPo(payload);
            // Load offline cached state
            const cached = localStorage.getItem(`shop-checked-${id}`);
            if (cached) setCheckedItems(new Set(JSON.parse(cached)));
          }
        }
      } catch (err) {
        console.error("Failed to fetch PO", err);
      }
      setLoading(false);
    };
    fetchPO();
  }, [id]);


  const toggleCheck = (itemId: string) => {
    const next = new Set(checkedItems);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);

    setCheckedItems(next);
    localStorage.setItem(
      `shop-checked-${id}`,
      JSON.stringify(Array.from(next)),
    );
  };

  if (loading)
    return (
      <div className="p-8 text-center text-foreground/50">
        Loading Self-Shop Mode...
      </div>
    );
  if (!po)
    return <div className="p-8 text-center text-red-400">Order not found.</div>;

  const allChecked =
    po.purchase_order_items.length > 0 &&
    checkedItems.size === po.purchase_order_items.length;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen flex flex-col animate-in slide-in-from-bottom-4">
      <Link
        href="/inventory/orders"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Back to Purchasing
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          {po.vendors?.name}
          <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
            Self-Shop Mode
          </span>
        </h1>
        <p className="text-muted-foreground">
          Check off items as you place them in your basket. Your progress is
          saved locally if you lose connection.
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {po.purchase_order_items?.map((item) => {
          const isChecked = checkedItems.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 md:p-6 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                isChecked
                  ? "bg-green-500/10 border-green-500/30 text-gray-300"
                  : "glass-panel border-black/10 dark:border-border hover:border-white/20 text-foreground"
              }`}
            >
              <div className="flex items-center gap-4">
                {isChecked ? (
                  <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" />
                ) : (
                  <Circle className="text-foreground/30 w-8 h-8 flex-shrink-0" />
                )}
                <span
                  className={`text-xl md:text-2xl font-medium ${isChecked ? "line-through decoration-green-500/50" : ""}`}
                >
                  {item.raw_name}
                </span>
              </div>
              <span
                className={`text-2xl font-bold ${isChecked ? "text-green-500/50" : "text-foreground"}`}
              >
                x{item.ordered_qty}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 sticky bottom-8">
        <div
          className={`p-6 rounded-xl border backdrop-blur-xl transition-all ${
            allChecked
              ? "bg-green-600/20 border-green-500/50"
              : "bg-white/50 dark:bg-black/60 border-black/10 dark:border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Progress</span>
            <span className="text-lg font-bold">
              {checkedItems.size} / {po.purchase_order_items.length} Items
            </span>
          </div>

          {allChecked && po.status !== 'SUBMITTED' && po.status !== 'RECEIVED' && po.status !== 'RECONCILED' && (
            <div className="text-center animate-in zoom-in">
              <p className="text-green-400 font-bold text-xl mb-2">
                Shopping Complete!
              </p>
              <p className="text-sm text-muted-foreground">
                To reconcile pricing, please scan the physical receipt using the
                Ingestion importer.
              </p>
            </div>
          )}

          {po.status === 'SUBMITTED' && (
            <div className="text-center animate-in zoom-in space-y-4">
              <p className="text-blue-400 font-bold text-xl mb-2">
                Order Submitted
              </p>
              <p className="text-sm text-muted-foreground">
                When you receive the physical invoice, ingest it here to automatically reconcile this purchase order.
              </p>
              <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 transition-all">
                Ingest Invoice
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("po_id", po.id);
                    
                    try {
                      // Post to the backend ingestion endpoint
                      const res = await fetch("/api/ingestion", {
                        method: "POST",
                        body: formData
                      });
                      if (res.ok) {
                        alert("Invoice ingested successfully! It is now processing.");
                      } else {
                        alert("Failed to ingest invoice.");
                      }
                    } catch (err) {
                      console.error("Upload error", err);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
