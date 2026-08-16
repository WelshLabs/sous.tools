"use client";

import { IngredientMappingRow } from "./IngredientMappingRow";

export interface LineItemData {
  rawName: string;
  guessName: string;
  quantity?: number;
  unitPrice?: number;
  extendedPrice?: number;
  tenantMatches: Array<{ id: string; name: string }>;
  usdaMatches: Array<{ fdcId: number; description: string; score?: number }>;
  selectedTenantId?: string;
  selectedUsdaId?: number;
}

export interface ReviewInvoiceBlockProps {
  vendorName?: string;
  totals?: { subtotal?: number; tax?: number; total?: number };
  lineItems?: LineItemData[];
  onVendorChange: (name: string) => void;
  onLineItemMappingChange: (
    index: number,
    tenantId: string,
    usdaId?: number,
  ) => void;
}

export function ReviewInvoiceBlock({
  vendorName,
  totals,
  lineItems = [],
  onVendorChange,
  onLineItemMappingChange,
}: ReviewInvoiceBlockProps) {
  return (
    <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
      {/* ── Vendor + totals row ── */}
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            Vendor
          </label>
          <input
            type="text"
            value={vendorName || ""}
            onChange={(e) => onVendorChange(e.target.value)}
            placeholder="Supplier name"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs tabular-nums text-zinc-400">
          <span>${totals?.subtotal?.toFixed(2) ?? "0.00"} sub</span>
          <span className="text-zinc-700">·</span>
          <span>${totals?.tax?.toFixed(2) ?? "0.00"} tax</span>
          <span className="text-zinc-700">·</span>
          <span className="font-semibold text-zinc-200">
            ${totals?.total?.toFixed(2) ?? "0.00"}
          </span>
        </div>
      </div>

      {/* ── Line items ── */}
      {lineItems.length > 0 && (
        <div className="flex flex-col divide-y divide-zinc-800/40 pt-1">
          {lineItems.map((item, idx) => (
            <IngredientMappingRow
              key={idx}
              rawName={item.rawName}
              guessName={item.guessName}
              quantity={item.quantity}
              tenantMatches={item.tenantMatches}
              usdaMatches={item.usdaMatches}
              selectedTenantId={item.selectedTenantId}
              selectedUsdaId={item.selectedUsdaId}
              onMappingChange={(tId, uId) =>
                onLineItemMappingChange(idx, tId, uId)
              }
              metaRight={
                item.extendedPrice ? (
                  <span className="text-xs tabular-nums text-zinc-500">
                    {item.quantity ?? 1}× ${item.unitPrice?.toFixed(2) ?? "0.00"} = ${item.extendedPrice.toFixed(2)}
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
