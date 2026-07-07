"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface VisualBuilderProps {
  editedData: string;
  onChange: (newData: string) => void;
  disabled: boolean;
  organizationId: string;
}

interface CreatableSelectProps {
  disabled?: boolean;
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string | null) => void;
  onCreate: (name: string) => void;
  placeholder: string;
}

function CreatableSelect({
  disabled,
  value,
  options,
  onChange,
  onCreate,
  placeholder,
}: CreatableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const showCreateOption =
    search.trim() !== "" &&
    !options.some((o) => o.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white/60 dark:bg-black/40 border rounded px-2.5 py-1.5 text-sm outline-none transition-all flex items-center justify-between cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          !value
            ? "border-red-500/70 text-red-600 dark:text-red-300 focus-within:border-red-400"
            : "border-black/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400 focus-within:border-sky-500"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={16} className="text-zinc-500 dark:text-zinc-400 ml-2 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-60">
          <div className="p-1.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-900/50">
            <input
              type="text"
              placeholder="Search or type to create..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-sky-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 transition-colors flex items-center justify-between ${
                    opt.id === value
                      ? "bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-800 dark:text-zinc-300"
                  }`}
                >
                  <span>{opt.name}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
                No items match search
              </div>
            )}

            {showCreateOption && (
              <div
                onClick={() => {
                  onCreate(search.trim());
                  setIsOpen(false);
                  setSearch("");
                }}
                className="px-3 py-2 text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 font-semibold cursor-pointer border-t border-slate-100 dark:border-zinc-900 transition-colors"
              >
                Create "{search.trim()}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function VisualBuilder({
  editedData,
  onChange,
  disabled,
  organizationId,
}: VisualBuilderProps) {
  const [items, setItems] = useState<{ id: string; name: string; each_weight_g: number | null }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);

  const handleCreateItem = async (name: string, index: number) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create item");
      const payload = await res.json();
      if (payload.success && payload.data) {
        const newItem = {
          id: payload.data.id,
          name: payload.data.name,
          each_weight_g: payload.data.each_weight_g || null,
        };
        setItems((prev) => [...prev, newItem]);

        const newData = { ...parsed };
        newData.items[index].itemId = newItem.id;
        newData.items[index]._requiresWeightInput = true;
        onChange(JSON.stringify(newData, null, 2));

        toast.success(`Created and mapped master item "${name}"`);
      } else {
        toast.error(payload.error || "Failed to create item");
      }
    } catch (err) {
      toast.error("Failed to create master item");
      console.error(err);
    }
  };

  const handleCreateRecipeItem = async (name: string, recipeIndex: number, ingIndex: number) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create item");
      const payload = await res.json();
      if (payload.success && payload.data) {
        const newItem = {
          id: payload.data.id,
          name: payload.data.name,
          each_weight_g: payload.data.each_weight_g || null,
        };
        setItems((prev) => [...prev, newItem]);

        const newData = { ...parsed };
        const targetRecipe = newData.recipes
          ? newData.recipes[recipeIndex]
          : newData;
        targetRecipe.ingredients[ingIndex].itemId = newItem.id;
        onChange(JSON.stringify(newData, null, 2));

        toast.success(`Created and mapped master ingredient "${name}"`);
      } else {
        toast.error(payload.error || "Failed to create item");
      }
    } catch (err) {
      toast.error("Failed to create master ingredient");
      console.error(err);
    }
  };
  const handleCreateVendor = async (name: string) => {
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create vendor");
      const payload = await res.json();
      if (payload.success && payload.data) {
        const newVendor = {
          id: payload.data.id,
          name: payload.data.name,
        };
        setVendors((prev) => [...prev, newVendor]);

        const newData = { ...parsed };
        newData.vendorId = newVendor.id;
        onChange(JSON.stringify(newData, null, 2));

        toast.success(`Created and mapped vendor "${name}"`);
      } else {
        toast.error(payload.error || "Failed to create vendor");
      }
    } catch (err) {
      toast.error("Failed to create vendor");
      console.error(err);
    }
  };

  const [expandedRecipes, setExpandedRecipes] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        if (res.ok) {
          const payload = await res.json();
          const data = payload.data;
          if (data) {
            setItems(data.map((d: any) => ({ id: d.id, name: d.name, each_weight_g: d.each_weight_g })));
          }
        }
      } catch (err) {
        console.error("Failed to load items", err);
      }
    };
    const fetchVendors = async () => {
      try {
        const res = await fetch("/api/vendors");
        if (res.ok) {
          const payload = await res.json();
          const data = payload.data;
          if (data) {
            setVendors(data.map((d: any) => ({ id: d.id, name: d.name })));
          }
        }
      } catch (err) {
        console.error("Failed to load vendors", err);
      }
    };
    if (organizationId) {
      fetchItems();
      fetchVendors();
    }
  }, [organizationId]);

  let parsed: any = {};
  try {
    parsed = JSON.parse(editedData);
  } catch (e) {
    return (
      <div className="p-4 text-red-400">
        Invalid JSON data. Use JSON Editor to fix.
      </div>
    );
  }

  // Auto-map ingredient itemIds based on raw names when items load
  useEffect(() => {
    if (items.length === 0 || disabled) return;
    let modified = false;
    const newData = { ...parsed };
    
    if (newData.vendorName && newData.items) {
      newData.items.forEach((item: any) => {
        if (!item.itemId && item.rawName) {
          const match = items.find((i: any) => i.name.toLowerCase() === item.rawName.toLowerCase() || (item.mappedName && i.name.toLowerCase() === item.mappedName.toLowerCase()));
          if (match) {
            item.itemId = match.id;
            const u = (item.unit || item.uom || "").toLowerCase();
            const isWeight = u.startsWith("lb") || u === "oz" || u === "g" || u === "kg";
            
            if (isWeight && item.quantity > 0) {
              item._requiresWeightInput = false;
              let mult = 1;
              if (u.startsWith("lb")) mult = 453.592;
              else if (u === "oz") mult = 28.3495;
              else if (u === "kg") mult = 1000;
              item.each_weight_g = Math.round(mult);
            } else {
              item._requiresWeightInput = !match.each_weight_g || match.each_weight_g <= 0;
            }
            modified = true;
          }
        }
      });
    } else {
      const targetRecipes = newData.recipes
        ? newData.recipes
        : newData.title && newData.ingredients
          ? [newData]
          : [];

      targetRecipes.forEach((recipe: any) => {
        if (recipe.ingredients) {
          recipe.ingredients.forEach((ing: any) => {
            if (!ing.itemId && ing.name) {
              const match = items.find(
                (i) =>
                  i.name.toLowerCase() === String(ing.name).trim().toLowerCase(),
              );
              if (match) {
                ing.itemId = match.id;
                modified = true;
              }
            }
          });
        }
      });
    }

    if (modified) {
      onChange(JSON.stringify(newData, null, 2));
    }
  }, [items, parsed, disabled, onChange]);

  const recipes = parsed.recipes
    ? parsed.recipes
    : parsed.title && parsed.ingredients
      ? [parsed]
      : [];

  const handleUpdate = (recipeIndex: number, field: string, value: any) => {
    const newData = { ...parsed };
    if (newData.recipes) {
      newData.recipes[recipeIndex][field] = value;
    } else {
      newData[field] = value;
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleIngredientUpdate = (
    recipeIndex: number,
    ingIndex: number,
    field: string,
    value: any,
  ) => {
    const newData = { ...parsed };
    const targetRecipe = newData.recipes
      ? newData.recipes[recipeIndex]
      : newData;
    targetRecipe.ingredients[ingIndex][field] = value;
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleInvoiceItemUpdate = (index: number, field: string, value: any) => {
    const newData = { ...parsed };
    newData.items[index][field] = value;
    
    if (field === "itemId") {
      const match = items.find(i => i.id === value);
      if (match) {
        const u = (newData.items[index].unit || newData.items[index].uom || "").toLowerCase();
        const isWeight = u.startsWith("lb") || u === "oz" || u === "g" || u === "kg";
        if (isWeight) {
           newData.items[index]._requiresWeightInput = false;
           let mult = 1;
           if (u.startsWith("lb")) mult = 453.592;
           else if (u === "oz") mult = 28.3495;
           else if (u === "kg") mult = 1000;
           newData.items[index].each_weight_g = Math.round(mult);
        } else {
           newData.items[index]._requiresWeightInput = !match.each_weight_g || match.each_weight_g <= 0;
        }
      } else {
         newData.items[index]._requiresWeightInput = false;
      }
    }
    
    onChange(JSON.stringify(newData, null, 2));
  };

  const toggleExpand = (i: number) => {
    setExpandedRecipes((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  if (parsed.vendorName && parsed.items) {
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
            {parsed.items.map((item: any, i: number) => (
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
                  <CreatableSelect
                    disabled={disabled}
                    value={item.itemId || ""}
                    options={items}
                    onChange={(val) => handleInvoiceItemUpdate(i, "itemId", val)}
                    onCreate={(name) => handleCreateItem(name, i)}
                    placeholder="⚠️ Map to Internal Item..."
                  />
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
                        ℹ️ Optional: Set Unit Weight {item._tempWeightUnit || item.unit || item.uom ? `(${(item._tempWeightUnit || item.unit || item.uom).toUpperCase()})` : ""}
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
                          value={item._tempWeightUnit || ((item.unit || item.uom || "").toLowerCase().startsWith("lb") ? "lbs" : (item.unit || item.uom)) || "g"}
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
                      {item.each_weight_g > 0 && (
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="p-4 text-zinc-500 dark:text-muted-foreground">
        No recipes or invoices found in data.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black/40 p-4 space-y-4">
      {recipes.map((recipe: any, rIdx: number) => {
        const isExpanded = expandedRecipes[rIdx] !== false;

        // Group ingredients by component
        const components: Record<string, any[]> = {};

        (recipe.ingredients || []).forEach((ing: any, i: number) => {
          const comp = ing.component || "Base Recipe";
          if (!components[comp]) components[comp] = [];
          components[comp].push({ ...ing, originalIndex: i });
        });

        return (
          <div
            key={rIdx}
            className="border border-black/10 dark:border-white/10 rounded-xl bg-card/50 overflow-hidden shadow-sm"
          >
            <div
              className="p-3 bg-black/5 bg-card flex items-center gap-2 cursor-pointer hover:bg-black/10 dark:bg-white/10"
              onClick={() => toggleExpand(rIdx)}
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
              <span className="font-bold text-sky-400">
                {recipe.title || "Untitled Recipe"}
              </span>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">
                      Title
                    </label>
                    <input
                      disabled={disabled}
                      type="text"
                      value={recipe.title || ""}
                      onChange={(e) =>
                        handleUpdate(rIdx, "title", e.target.value)
                      }
                      className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">
                        Yield
                      </label>
                      <input
                        disabled={disabled}
                        type="number"
                        value={recipe.yieldCount || 1}
                        onChange={(e) =>
                          handleUpdate(
                            rIdx,
                            "yieldCount",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">
                        Unit
                      </label>
                      <input
                        disabled={disabled}
                        type="text"
                        value={recipe.yieldUnit || "servings"}
                        onChange={(e) =>
                          handleUpdate(rIdx, "yieldUnit", e.target.value)
                        }
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
                    <h4 className="text-sm font-semibold">Ingredients</h4>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        // Math logic: Calculate base weights per component
                        const componentBaseWeights: Record<string, number> = {};
                        const ings = recipe.ingredients || [];
                        ings.forEach((ing: any) => {
                          if (ing.baseCalculationGroup) {
                            const comp = ing.component || "Base Recipe";
                            componentBaseWeights[comp] =
                              (componentBaseWeights[comp] || 0) +
                              Number(ing.amount || 0);
                          }
                        });

                        const hasAnyBase = Object.values(
                          componentBaseWeights,
                        ).some((w) => w > 0);
                        if (!hasAnyBase) {
                          alert(
                            "Please select at least one Base ingredient (in any component) to convert!",
                          );
                          return;
                        }

                        // Convert ingredients to percentages relative to their component's base weight
                        const newData = { ...parsed };
                        const targetRecipe = newData.recipes
                          ? newData.recipes[rIdx]
                          : newData;

                        targetRecipe.ingredients = targetRecipe.ingredients.map(
                          (ing: any) => {
                            const comp = ing.component || "Base Recipe";
                            const compBaseWeight =
                              componentBaseWeights[comp] || 0;

                            if (compBaseWeight === 0) return ing; // Skip if no base for this component

                            const originalAmount = Number(ing.amount || 0);
                            const percentage =
                              (originalAmount / compBaseWeight) * 100;
                            return {
                              ...ing,
                              amount: Number(percentage.toFixed(2)),
                              unit: "%",
                              calculationType: "BAKERS_PERCENTAGE",
                              // Keep baseCalculationGroup true for the base items
                            };
                          },
                        );

                        onChange(JSON.stringify(newData, null, 2));
                      }}
                      className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      Convert to Baker's %
                    </button>
                  </div>

                  {Object.entries(components).map(([compName, ings]) => (
                    <div key={compName} className="space-y-3">
                      <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        {compName}
                      </h5>
                      <div className="space-y-2">
                        {ings.map((ing) => (
                          <div
                            key={ing.originalIndex}
                            className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                          >
                            <div className="col-span-4 flex flex-col gap-1 relative">
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.name || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Raw Name (from text)"
                              />
                              <CreatableSelect
                                disabled={disabled}
                                value={ing.itemId || ""}
                                options={items}
                                onChange={(val) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "itemId",
                                    val,
                                  )
                                }
                                onCreate={(name) => handleCreateRecipeItem(name, rIdx, ing.originalIndex)}
                                placeholder="⚠️ Select Master Ingredient..."
                              />
                            </div>
                            <div className="col-span-3 flex gap-1">
                              <input
                                disabled={disabled}
                                type="number"
                                value={ing.amount || 0}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "amount",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-16 bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                              />
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.unit || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                                className="w-16 bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Unit"
                              />
                            </div>
                            <div className="col-span-5 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <select
                                  disabled={disabled}
                                  value={ing.calculationType || "WEIGHT"}
                                  onChange={(e) =>
                                    handleIngredientUpdate(
                                      rIdx,
                                      ing.originalIndex,
                                      "calculationType",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs focus:border-sky-500 outline-none"
                                >
                                  <option value="WEIGHT">Weight</option>
                                  <option value="VOLUME">Volume</option>
                                  <option value="COUNT">Count</option>
                                  <option value="BAKERS_PERCENTAGE">
                                    Baker's %
                                  </option>
                                </select>

                                {ing.calculationType ===
                                  "BAKERS_PERCENTAGE" && (
                                  <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer whitespace-nowrap bg-amber-400/10 px-2 py-1 rounded">
                                    <input
                                      disabled={disabled}
                                      type="checkbox"
                                      checked={
                                        ing.baseCalculationGroup || false
                                      }
                                      onChange={(e) =>
                                        handleIngredientUpdate(
                                          rIdx,
                                          ing.originalIndex,
                                          "baseCalculationGroup",
                                          e.target.checked,
                                        )
                                      }
                                      className="accent-amber-500"
                                    />
                                    Base
                                  </label>
                                )}
                              </div>
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.component || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "component",
                                    e.target.value || null,
                                  )
                                }
                                placeholder="Section (e.g. Glaze)"
                                className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none text-zinc-500 dark:text-muted-foreground"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
