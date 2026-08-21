"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import {
  type PurchaseOrder,
  type PurchaseOrderItem,
  type Vendor,
} from "@soustools/api-types";

export type PopulatedPO = PurchaseOrder & {
  vendors: Vendor;
  purchase_order_items: PurchaseOrderItem[];
};

export interface SelfShopViewProps {
  po: PopulatedPO | null;
  loading: boolean;
  checkedItems: Set<string>;
  onToggleCheck: (id: string) => void;
  onUploadInvoice: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SelfShopView({
  po,
  loading,
  checkedItems,
  onToggleCheck,
  onUploadInvoice,
}: SelfShopViewProps) {
  if (loading) {
    return (
      <div className="text-foreground/50 p-8 text-center">
        Loading Self-Shop Mode...
      </div>
    );
  }

  if (!po) {
    return <div className="p-8 text-center text-red-400">Order not found.</div>;
  }

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
              onClick={() => onToggleCheck(item.id)}
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
                  onChange={onUploadInvoice}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
