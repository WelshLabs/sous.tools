"use client";

import React from "react";

export interface LineItemData {
  rawName: string;
  guessName: string;
  quantity?: number;
  unitPrice?: number;
  extendedPrice?: number;
  tenantMatches: Array<{ id: string; name: string }>;
  usdaMatches: Array<{ fdcId: number; description: string }>;
  selectedTenantId?: string;
  selectedUsdaId?: number;
}

export interface ReviewInvoiceBlockProps {
  vendorName?: string;
  totals?: { subtotal?: number; tax?: number; total?: number };
  lineItems?: LineItemData[];
  onVendorChange: (name: string) => void;
  onLineItemMappingChange: (index: number, tenantId: string, usdaId?: number) => void;
}

export function ReviewInvoiceBlock({
  vendorName,
  totals,
  lineItems = [],
  onVendorChange,
  onLineItemMappingChange,
}: ReviewInvoiceBlockProps) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          Invoice Metadata & Financials
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400">Vendor / Supplier</label>
          <input
            type="text"
            value={vendorName || ""}
            onChange={(e) => onVendorChange(e.target.value)}
            className="w-full mt-1 p-2 text-sm rounded bg-zinc-900 border border-zinc-800 text-zinc-100"
          />
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs">
          <div>Subtotal: ${totals?.subtotal?.toFixed(2) || "0.00"}</div>
          <div>Tax: ${totals?.tax?.toFixed(2) || "0.00"}</div>
          <div className="font-bold text-emerald-400">Total: ${totals?.total?.toFixed(2) || "0.00"}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-300">Line Items & 3-Way Waterfall Mapping</span>
        {lineItems.map((item, idx) => (
          <div key={idx} className="p-3 rounded bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-zinc-200">{item.rawName}</span>
              <span className="text-zinc-400">
                Qty: {item.quantity || 1} | ${item.unitPrice?.toFixed(2) || "0.00"} ea | Total: ${item.extendedPrice?.toFixed(2) || "0.00"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400">Tenant master_items (Top 5)</label>
                <select
                  value={item.selectedTenantId || ""}
                  onChange={(e) => onLineItemMappingChange(idx, e.target.value, item.selectedUsdaId)}
                  className="w-full mt-0.5 p-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs"
                >
                  <option value="">-- Select Master Item --</option>
                  {item.tenantMatches?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-400">USDA FDC Matches (Top 5)</label>
                <select
                  value={item.selectedUsdaId || ""}
                  onChange={(e) => onLineItemMappingChange(idx, item.selectedTenantId || "", Number(e.target.value))}
                  className="w-full mt-0.5 p-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs"
                >
                  <option value="">-- Select USDA Item --</option>
                  {item.usdaMatches?.map((u) => (
                    <option key={u.fdcId} value={u.fdcId}>
                      {u.description} (FDC #{u.fdcId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
