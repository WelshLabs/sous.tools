"use client";

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
        <div className="flex flex-col gap-0 divide-y divide-zinc-800/40 pt-4">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 py-3 first:pt-0">
              {/* Name + price */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-zinc-100 leading-snug">
                  {item.rawName}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                  {item.quantity ?? 1}× ${item.unitPrice?.toFixed(2) ?? "0.00"}
                  {item.extendedPrice
                    ? ` = $${item.extendedPrice.toFixed(2)}`
                    : ""}
                </span>
              </div>

              {/* Mapping selects */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    Ingredient
                  </label>
                  <select
                    value={item.selectedTenantId || ""}
                    onChange={(e) =>
                      onLineItemMappingChange(
                        idx,
                        e.target.value,
                        item.selectedUsdaId,
                      )
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-600"
                  >
                    <option value="">Select ingredient</option>
                    {item.tenantMatches?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    USDA
                  </label>
                  <select
                    value={item.selectedUsdaId || ""}
                    onChange={(e) =>
                      onLineItemMappingChange(
                        idx,
                        item.selectedTenantId || "",
                        Number(e.target.value),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-600"
                  >
                    <option value="">Select USDA</option>
                    {item.usdaMatches?.map((u) => (
                      <option key={u.fdcId} value={u.fdcId}>
                        {u.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
