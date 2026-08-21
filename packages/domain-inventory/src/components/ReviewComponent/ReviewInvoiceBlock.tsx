"use client";

import { IngredientMappingRow } from "./IngredientMappingRow";

export interface LineItemData {
  rawName: string;
  guessName: string;
  quantity?: number;
  unit?: string;
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
  onLineItemQuantityChange?: (index: number, quantity: number) => void;
  onLineItemUnitChange?: (index: number, unit: string) => void;
}

export function ReviewInvoiceBlock({
  vendorName,
  totals,
  lineItems = [],
  onVendorChange,
  onLineItemMappingChange,
  onLineItemQuantityChange,
  onLineItemUnitChange,
}: ReviewInvoiceBlockProps) {
  return (
    <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
      {/* ── Vendor + totals row in responsive mobile-first row ── */}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
            Supplier / Vendor
          </label>
          <input
            type="text"
            value={vendorName || ""}
            onChange={(e) => onVendorChange(e.target.value)}
            placeholder="Supplier name"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-500 transition outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400 tabular-nums">
          <span>${totals?.subtotal?.toFixed(2) ?? "0.00"} sub</span>
          <span className="text-zinc-700">·</span>
          <span>${totals?.tax?.toFixed(2) ?? "0.00"} tax</span>
          <span className="text-zinc-700">·</span>
          <span className="font-semibold text-zinc-100">
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
              unit={item.unit}
              tenantMatches={item.tenantMatches}
              usdaMatches={item.usdaMatches}
              selectedTenantId={item.selectedTenantId}
              selectedUsdaId={item.selectedUsdaId}
              onMappingChange={(tId, uId) =>
                onLineItemMappingChange(idx, tId, uId)
              }
              onQuantityChange={
                onLineItemQuantityChange
                  ? (qty) => onLineItemQuantityChange(idx, qty)
                  : undefined
              }
              onUnitChange={
                onLineItemUnitChange
                  ? (u) => onLineItemUnitChange(idx, u)
                  : undefined
              }
              metaRight={
                item.extendedPrice ? (
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {item.quantity ?? 1}× $
                    {item.unitPrice?.toFixed(2) ?? "0.00"} = $
                    {item.extendedPrice.toFixed(2)}
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
