"use client";

import React from "react";
import { InvoiceItemRow } from "./invoice-item-row";
import { CreatableSelect } from "./creatable-select";
import type { ParsedInvoice, ItemOption, VendorOption, ParsedInvoiceItem } from "./visual-builder.types";

export interface VendorSectionProps {
  parsed: ParsedInvoice;
  disabled: boolean;
  items: ItemOption[];
  handleInvoiceItemUpdate: (index: number, key: string, value: string | number | boolean | null) => void;
  handleCreateItem: (name: string, index: number) => void;
  onChange: (newData: string) => void;
  vendors: VendorOption[];
}

export function VendorSection({
  parsed,
  disabled,
  items,
  handleInvoiceItemUpdate,
  handleCreateItem,
  onChange,
  vendors,
}: VendorSectionProps) {
  return (
      <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black/40 p-4 space-y-4">
        <div className="border border-black/10 dark:border-white/10 rounded-xl bg-card/50 overflow-hidden shadow-sm p-4 space-y-4">
          <div className="border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="font-bold text-sky-400">Invoice Details</h3>
          </div>
          
          <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 space-y-2">
             <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wide">AI Extracted Metadata</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <div className="col-span-2">
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Vendor Address</span>
                 <span className="text-xs text-foreground">{parsed.vendorAddress || "-"}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Vendor Phone</span>
                 <span className="text-xs text-foreground">{parsed.vendorPhone || "-"}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Vendor Email</span>
                 <span className="text-xs text-foreground">{parsed.vendorEmail || "-"}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Order Number</span>
                 <span className="text-xs text-foreground">{parsed.orderNumber || "-"}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Previous Balance</span>
                 <span className="text-xs text-foreground">{parsed.previousBalance !== undefined && parsed.previousBalance !== null ? `$${parsed.previousBalance}` : "-"}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Total Due</span>
                 <span className="text-xs text-foreground">{parsed.totalDue !== undefined && parsed.totalDue !== null ? `$${parsed.totalDue}` : "-"}</span>
               </div>
             </div>
             {parsed.notes && (
               <div className="pt-2 border-t border-black/10 dark:border-white/10 mt-2">
                 <span className="block text-[10px] uppercase text-zinc-500 font-bold">Notes</span>
                 <span className="text-xs italic text-foreground">{parsed.notes}</span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">Vendor Name</label>
              <input
                disabled={disabled}
                type="text"
                value={parsed.vendorName || ""}
                onChange={(e) => {
                  const newData = { ...parsed, vendorName: e.target.value };
                  onChange(JSON.stringify(newData, null, 2));
                }}
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
              />
              <CreatableSelect
                disabled={disabled}
                value={parsed.vendorId || ""}
                options={vendors}
                onChange={(val) => {
                  const newData = { ...parsed, vendorId: val };
                  onChange(JSON.stringify(newData, null, 2));
                }}
                onCreate={(name) => handleCreateVendor(name)}
                placeholder="⚠️ Map to Internal Vendor..."
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">Invoice Number</label>
              <input
                disabled={disabled}
                type="text"
                value={parsed.invoiceNumber || ""}
                onChange={(e) => {
                  const newData = { ...parsed, invoiceNumber: e.target.value };
                  onChange(JSON.stringify(newData, null, 2));
                }}
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">Total Amount</label>
              <input
                disabled={disabled}
                type="number"
                step="0.01"
                value={parsed.totalAmount || 0}
                onChange={(e) => {
                  const newData = { ...parsed, totalAmount: Number(e.target.value) };
                  onChange(JSON.stringify(newData, null, 2));
                }}
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
              />
            </div>
          </div>


          <h4 className="text-sm font-semibold mt-4">Invoice Items</h4>
          <div className="space-y-3">
            {parsed.items.map((item: ParsedInvoiceItem, i: number) => (
              <InvoiceItemRow
                key={i}
                item={item}
                i={i}
                disabled={disabled}
                items={items}
                handleInvoiceItemUpdate={handleInvoiceItemUpdate}
                handleCreateItem={handleCreateItem}
                parsed={parsed}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      </div>
  );
}
