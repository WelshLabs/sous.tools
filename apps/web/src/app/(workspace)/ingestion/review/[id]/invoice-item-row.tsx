"use client";

import React from "react";
import { Check } from "lucide-react";
import { CreatableSelect } from "./creatable-select";
import type { ParsedInvoice, ItemOption, ParsedInvoiceItem } from "./visual-builder.types";

export interface InvoiceItemRowProps {
  item: ParsedInvoiceItem;
  i: number;
  disabled: boolean;
  items: ItemOption[];
  handleInvoiceItemUpdate: (index: number, key: string, value: string | number | boolean | null) => void;
  handleCreateItem: (name: string, index: number) => void;
  parsed: ParsedInvoice;
  onChange: (newData: string) => void;
  onConfirmAlias?: (rawString: string, masterId: string) => void;
}

export function InvoiceItemRow({
  item,
  i,
  disabled,
  items,
  handleInvoiceItemUpdate,
  handleCreateItem,
  parsed,
  onChange,
  onConfirmAlias,
}: InvoiceItemRowProps) {
  return (
              <div key={i} className="grid grid-cols-12 gap-3 items-start bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                <div className="col-span-5 flex flex-col gap-2">
                  <input
                    disabled={disabled}
                    type="text"
                    value={item.rawName || ""}
                    onChange={(e) => handleInvoiceItemUpdate(i, "rawName", e.target.value)}
                    className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                    placeholder="Raw Item Name"
                  />
                  {/* Select and Suggestion Panel */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <CreatableSelect
                          disabled={disabled}
                          value={item.confidence === 1.0 ? (item.itemId || "") : ""}
                          options={items}
                          onChange={(val) => {
                            handleInvoiceItemUpdate(i, "itemId", val);
                            if (val) {
                              handleInvoiceItemUpdate(i, "confidence", 1.0);
                              onConfirmAlias?.(item.rawName || "", val);
                            }
                          }}
                          onCreate={(name) => handleCreateItem(name, i)}
                          placeholder="⚠️ Map to Internal Item..."
                        />
                      </div>
                      {item.confidence === 1.0 && item.itemId && (
                        <div className="flex items-center justify-center bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg border border-emerald-500/20" title="Exact Match (1.0 Confidence)">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Suggestion Chip */}
                    {item.confidence !== undefined && item.confidence >= 0.6 && item.confidence < 1.0 && item.itemId && (
                      <button
                        type="button"
                        onClick={() => {
                          handleInvoiceItemUpdate(i, "confidence", 1.0);
                          onConfirmAlias?.(item.rawName || "", item.itemId || "");
                        }}
                        className="self-start flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2 py-1.5 rounded-lg border border-amber-500/25 cursor-pointer transition-all active:scale-95"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Suggested: {item.mappedName || items.find(opt => opt.id === item.itemId)?.name || "Master Item"}</span>
                        <span className="text-[10px] opacity-75 font-normal ml-1 border-l border-amber-500/30 pl-1.5">Click to Confirm</span>
                      </button>
                    )}
                  </div>
                  <select
                    disabled={disabled}
                    value={item.category || "ingredient"}
                    onChange={(e) => handleInvoiceItemUpdate(i, "category", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs focus:border-sky-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value="ingredient">Ingredient</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="office">Office</option>
                    <option value="packaging">Packaging</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="col-span-7 grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Qty</label>
                    <input
                      disabled={disabled}
                      type="number"
                      value={item.quantity || 0}
                      onChange={(e) => handleInvoiceItemUpdate(i, "quantity", Number(e.target.value))}
                      className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold flex items-center justify-between">
                      <span>Unit</span>
                      {item.uom && <span className="text-sky-500 bg-sky-500/10 px-1 rounded truncate ml-1 max-w-[60px]" title={`Raw: ${item.uom}`}>{item.uom}</span>}
                    </label>
                    <select
                      disabled={disabled}
                      value={item.unit || "EACH"}
                      onChange={(e) => handleInvoiceItemUpdate(i, "unit", e.target.value)}
                      className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                    >
                      <option value="EACH">EACH</option>
                      <option value="CASE">CASE</option>
                      <option value="LBS">LBS</option>
                      <option value="OZ">OZ</option>
                      <option value="GAL">GAL</option>
                      <option value="DOZ">DOZ</option>
                      <option value="PACK">PACK</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Price/Unit</label>
                    <input
                      disabled={disabled}
                      type="number"
                      step="0.01"
                      value={item.pricePerUnit || 0}
                      onChange={(e) => handleInvoiceItemUpdate(i, "pricePerUnit", Number(e.target.value))}
                      className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Total Price</label>
                    <input
                      disabled={disabled}
                      type="number"
                      step="0.01"
                      value={item.totalPrice || 0}
                      onChange={(e) => handleInvoiceItemUpdate(i, "totalPrice", Number(e.target.value))}
                      className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                    />
                  </div>
                  
                  {item._requiresWeightInput && (!item.category || item.category === "ingredient") && (
                    <div className="col-span-4 mt-1 flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-sky-600 dark:text-sky-500 font-bold flex items-center gap-1">
                        ℹ️ Optional: Set Unit Weight {item._tempWeightUnit || item.unit || item.uom ? `(${(item._tempWeightUnit || item.unit || item.uom || "").toUpperCase()})` : ""}
                      </label>
                      <div className="flex gap-1">
                        <input
                          disabled={disabled}
                          type="number"
                          placeholder="Amount"
                          value={item._tempWeightVal ?? ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const unit = item._tempWeightUnit || (item.unit || item.uom || "").toLowerCase().startsWith("lb") ? "lbs" : (item.unit || item.uom || "g");
                            const newData = { ...parsed };
                            newData.items[i]._tempWeightVal = val;
                            newData.items[i]._tempWeightUnit = unit;
                            let mult = 1;
                            if (unit === "lbs" || unit === "lb") mult = 453.592;
                            else if (unit === "oz") mult = 28.3495;
                            else if (unit === "kg") mult = 1000;
                            else if (unit === "gal") mult = 3785.41;
                            newData.items[i].each_weight_g = Math.round(val * mult);
                            onChange(JSON.stringify(newData, null, 2));
                          }}
                          className="flex-1 min-w-0 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/50 rounded px-2 py-1.5 text-sm focus:border-sky-400 outline-none text-sky-900 dark:text-sky-500 placeholder-sky-500/50"
                        />
                        <select
                          disabled={disabled}
                          value={item._tempWeightUnit || ((item.unit || item.uom || "").toLowerCase().startsWith("lb") ? "lbs" : (item.unit || item.uom || "g"))}

                          onChange={(e) => {
                            const unit = e.target.value;
                            const val = item._tempWeightVal || 0;
                            const newData = { ...parsed };
                            newData.items[i]._tempWeightUnit = unit;
                            let mult = 1;
                            if (unit === "lbs" || unit === "lb") mult = 453.592;
                            else if (unit === "oz") mult = 28.3495;
                            else if (unit === "kg") mult = 1000;
                            else if (unit === "gal") mult = 3785.41;
                            newData.items[i].each_weight_g = Math.round(val * mult);
                            onChange(JSON.stringify(newData, null, 2));
                          }}
                          className="w-20 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/50 rounded px-1 py-1.5 text-xs focus:border-sky-400 outline-none text-sky-900 dark:text-sky-500 cursor-pointer"
                        >
                          <option value="g">Grams</option>
                          <option value="kg">Kilograms</option>
                          <option value="lbs">Pounds</option>
                          <option value="oz">Ounces</option>
                          <option value="gal">Gallons</option>
                        </select>
                      </div>
                      {(item.each_weight_g ?? 0) > 0 && (

                        <div className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                          ↳ Saves as: {item.each_weight_g}g
                        </div>
                      )}
                      <button 
                        disabled={disabled}
                        onClick={() => {
                          const newData = { ...parsed };
                          newData.items[i]._requiresWeightInput = false;
                          onChange(JSON.stringify(newData, null, 2));
                        }}
                        className="text-[10px] text-sky-700 dark:text-sky-400 hover:underline self-start mt-0.5"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
  );
}
