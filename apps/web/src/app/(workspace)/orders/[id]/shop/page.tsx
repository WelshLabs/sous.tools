/* eslint-disable max-lines */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  type PurchaseOrder,
  type PurchaseOrderItem,
  type Vendor,
} from "@soustools/api-types";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { api } from "@soustools/api-client";

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
        const { data, error } = await (api.GET as any)(
          `/purchase-orders/${id}`,
        );
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
      <div className="text-foreground/50 p-8 text-center">
        Loading Self-Shop Mode...
      </div>
    );
  if (!po)
    return <div className="p-8 text-center text-red-400">Order not found.</div>;

  const allChecked =
    po.purchase_order_items.length > 0 &&
    checkedItems.size === po.purchase_order_items.length;

  return (
    <div className="animate-in slide-in-from-bottom-4 mx-auto flex min-h-screen max-w-3xl flex-col p-4 md:p-8">
      <Link
        href="/orders"
        className="text-muted-foreground hover:text-foreground mb-6 flex w-fit items-center gap-2 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Purchasing
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">
          {po.vendors?.name}
          <span className="rounded-full border border-blue-500/30 bg-blue-600/20 px-3 py-1 text-sm text-blue-400">
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
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all active:scale-[0.98] md:p-6 ${
                isChecked
                  ? "border-green-500/30 bg-green-500/10 text-gray-300"
                  : "glass-panel dark:border-border text-foreground border-black/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-4">
                {isChecked ? (
                  <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-green-500" />
                ) : (
                  <Circle className="text-foreground/30 h-8 w-8 flex-shrink-0" />
                )}
                <span
                  className={`text-xl font-medium md:text-2xl ${isChecked ? "line-through decoration-green-500/50" : ""}`}
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

      <div className="sticky bottom-8 mt-8">
        <div
          className={`rounded-xl border p-6 backdrop-blur-xl transition-all ${
            allChecked
              ? "border-green-500/50 bg-green-600/20"
              : "dark:border-border border-black/10 bg-white/50 dark:bg-black/60"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-medium">Progress</span>
            <span className="text-lg font-bold">
              {checkedItems.size} / {po.purchase_order_items.length} Items
            </span>
          </div>

          {allChecked &&
            po.status !== "SUBMITTED" &&
            po.status !== "RECEIVED" &&
            po.status !== "RECONCILED" && (
              <div className="animate-in zoom-in text-center">
                <p className="mb-2 text-xl font-bold text-green-400">
                  Shopping Complete!
                </p>
                <p className="text-muted-foreground text-sm">
                  To reconcile pricing, please scan the physical receipt using
                  the Ingestion importer.
                </p>
              </div>
            )}

          {po.status === "SUBMITTED" && (
            <div className="animate-in zoom-in space-y-4 text-center">
              <p className="mb-2 text-xl font-bold text-blue-400">
                Order Submitted
              </p>
              <p className="text-muted-foreground text-sm">
                When you receive the physical invoice, ingest it here to
                automatically reconcile this purchase order.
              </p>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-500">
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
                      const res = await fetch("/api/ingestion", {
                        method: "POST",
                        body: formData,
                      });
                      if (res.ok) {
                        alert(
                          "Invoice ingested successfully! It is now processing.",
                        );
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
