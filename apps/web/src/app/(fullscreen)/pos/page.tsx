"use client";

import React, { useState, useEffect } from "react";
import { Button, OmniBar } from "@soustools/design-system";
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  DollarSign, 
  ChevronRight,
  ChevronLeft,
  Info,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

// Zod schemas for POS Cart State
const CartItemModifierSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  price: z.number()
});

const CartItemSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  modifiers: z.array(CartItemModifierSchema)
});

const CartSchema = z.array(CartItemSchema);

type CartItem = z.infer<typeof CartItemSchema>;
type CartItemModifier = z.infer<typeof CartItemModifierSchema>;

export default function POSRegisterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [modifierOptions, setModifierOptions] = useState<any[]>([]);
  const [itemModifierLinks, setItemModifierLinks] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string>("d0000000-0000-0000-0000-000000000000");
  const [loading, setLoading] = useState(true);
  
  // Search & Categories
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modifiers Selection Modal State
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<any | null>(null);
  const [activeModGroupsForSelected, setActiveModGroupsForSelected] = useState<any[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, CartItemModifier[]>>({});

  // Tender Modal State
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [tenderMethod, setTenderMethod] = useState<"CASH" | "CARD" | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  // Load POS synced catalog data from Supabase
  const loadPOSCatalog = async () => {
    setLoading(true);
    try {
      // 1. Fetch organization (Mocking target org for now)
      const targetOrgId = "d0000000-0000-0000-0000-000000000000";
      setOrgId(targetOrgId);

      // 2. Fetch POS items
      const itemsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos-simulator/items?organizationId=${targetOrgId}`);
      const posItems = itemsRes.ok ? await itemsRes.json() : [];
      
      // 3. Fetch modifier groups
      const modGroups: any[] = []; // Not implemented in API yet

      // 4. Fetch modifier options
      const modOptions: any[] = []; // Not implemented in API yet

      // 5. Fetch POS item modifier group links
      const links: any[] = []; // Not implemented in API yet

      if (posItems) setItems(posItems);
      if (modGroups) setModifierGroups(modGroups);
      if (modOptions) setModifierOptions(modOptions);
      if (links) setItemModifierLinks(links);

    } catch (e: any) {
      toast.error(`Failed to load POS catalog: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOSCatalog();
  }, []);



  // Assign items to mock UI categories dynamically based on names
  const getCategory = (itemName: string) => {
    const name = itemName.toLowerCase();
    if (name.includes("burger") || name.includes("sandwich") || name.includes("steak") || name.includes("salmon")) {
      return "Mains";
    }
    if (name.includes("salad") || name.includes("fries") || name.includes("soup") || name.includes("tater")) {
      return "Sides/Salads";
    }
    if (name.includes("beer") || name.includes("ipa") || name.includes("drink") || name.includes("soda") || name.includes("water")) {
      return "Beverages";
    }
    return "Other";
  };

  const categories = ["All", "Mains", "Sides/Salads", "Beverages", "Other"];

  // Filtered items list
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || getCategory(item.name) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Tap Item: Check for required modifiers first
  const handleItemTap = (item: any) => {
    if (item.is_sold_out) {
      toast.error(`${item.name} is currently sold out (86'd).`);
      return;
    }

    // Find links for this item
    const linkedGroupIds = itemModifierLinks
      .filter(link => link.pos_item_id === item.id)
      .map(link => link.modifier_group_id);

    const linkedGroups = modifierGroups.filter(g => linkedGroupIds.includes(g.id));

    // Check if any modifier group is required (min_required > 0)
    // Or if the item simply has modifiers, we open the modal to allow customization
    if (linkedGroups.length > 0) {
      setSelectedItemForModifiers(item);
      setActiveModGroupsForSelected(linkedGroups);
      
      // Initialize selected modifiers state
      const initialMods: Record<string, CartItemModifier[]> = {};
      linkedGroups.forEach(g => {
        initialMods[g.id] = [];
      });
      setSelectedModifiers(initialMods);
    } else {
      // Add directly to cart if no modifiers
      addToCartDirect(item, []);
    }
  };

  const addToCartDirect = (item: any, selectedMods: CartItemModifier[]) => {
    const cartItem: CartItem = {
      id: `${item.id}-${selectedMods.map(m => m.id).sort().join("-")}`, // unique cart key based on item + chosen mods
      external_id: item.external_id,
      name: item.name,
      price: item.price,
      quantity: 1,
      modifiers: selectedMods
    };

    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.id === cartItem.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        // Validate with Zod
        const result = CartSchema.safeParse(updated);
        if (result.success) return result.data;
        return prev;
      }
      const updated = [...prev, cartItem];
      const result = CartSchema.safeParse(updated);
      if (result.success) return result.data;
      return prev;
    });

    toast.success(`Added ${item.name} to ticket.`);
  };

  // Modifiers Selection Handlers
  const handleModifierToggle = (group: any, option: any) => {
    const currentSelected = selectedModifiers[group.id] || [];
    const isSelected = currentSelected.some(m => m.id === option.id);

    let updated: CartItemModifier[] = [];
    if (isSelected) {
      updated = currentSelected.filter(m => m.id !== option.id);
    } else {
      // Validate max_allowed
      if (group.max_allowed && currentSelected.length >= group.max_allowed) {
        if (group.max_allowed === 1) {
          // If single choice, replace it
          updated = [{ id: option.id, external_id: option.external_id, name: option.name, price: Number(option.price) }];
        } else {
          toast.warning(`Maximum of ${group.max_allowed} selections allowed for ${group.name}.`);
          return;
        }
      } else {
        updated = [...currentSelected, { id: option.id, external_id: option.external_id, name: option.name, price: Number(option.price) }];
      }
    }

    setSelectedModifiers(prev => ({
      ...prev,
      [group.id]: updated
    }));
  };

  const handleAddWithModifiers = () => {
    if (!selectedItemForModifiers) return;

    // Validate min_required for all groups
    for (const group of activeModGroupsForSelected) {
      const selections = selectedModifiers[group.id] || [];
      if (group.min_required && selections.length < group.min_required) {
        toast.error(`Please select at least ${group.min_required} options for ${group.name}.`);
        return;
      }
    }

    // Flatten all selected modifiers
    const allMods = Object.values(selectedModifiers).flat();
    addToCartDirect(selectedItemForModifiers, allMods);
    setSelectedItemForModifiers(null);
  };

  // Cart Adjustments
  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const nextQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, nextQty) };
        }
        return item;
      });
      const result = CartSchema.safeParse(updated);
      if (result.success) return result.data;
      return prev;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from ticket.");
  };

  // Math Calculations
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const modifiersCost = item.modifiers.reduce((sum, m) => sum + m.price, 0);
      return total + (item.price + modifiersCost) * item.quantity;
    }, 0);
  };

  const subtotal = getSubtotal();
  const tax = subtotal * 0.0825; // 8.25% sales tax
  const total = subtotal + tax;

  // Checkout submission
  const handleProcessCheckout = async () => {
    if (cart.length === 0) return;
    setSubmittingCheckout(true);

    // Build driver order payload
    const orderData = {
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers.map(m => ({
          external_id: m.external_id,
          name: m.name
        }))
      }))
    };

    try {
      // 1. POST explicitly to integrations checkout (driver layer)
      const res = await fetch("/api/integrations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          orderData
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      // 2. Play Audio success resolution chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.type = "sine";
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn(e);
      }

      toast.success("Order processed successfully. Synced to Square POS API.");
      setCart([]);
      setShowTenderModal(false);
      setTenderMethod(null);
      setCashReceived("");
    } catch (e: any) {
      toast.error(`Checkout failed: ${e.message}`);
    } finally {
      setSubmittingCheckout(false);
    }
  };

  const cashChange = tenderMethod === "CASH" && parseFloat(cashReceived) >= total
    ? (parseFloat(cashReceived) - total).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-[calc(100vh-100px)] flex bg-zinc-50 dark:bg-card text-zinc-900 dark:text-zinc-100 overflow-hidden relative">
      {/* Left pane: POS item catalog (Fluid Grid) */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto min-w-0 pr-4">
        {/* Navigation & Search Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href="/home"
            className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-shrink-0">
            <OmniBar />
          </div>
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search POS catalog..."
              className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
            />
            <Search className="w-4 h-4 text-muted-foreground dark:text-zinc-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex justify-center gap-2 pb-4 overflow-x-auto shrink-0 border-b border-black/5 dark:border-white/5 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                selectedCategory === cat 
                  ? "bg-white text-black border-white"
                  : "bg-black/5 bg-card hover:bg-black/10 dark:bg-white/10 text-zinc-500 dark:text-muted-foreground border-black/5 dark:border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Item Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground dark:text-zinc-500 p-8">
            <Info className="w-12 h-12 text-zinc-600 mb-2" />
            <p className="font-semibold text-zinc-500 dark:text-muted-foreground text-lg">No items match search criteria.</p>
            <p className="text-sm mt-0.5">Please check spelling or sync catalog again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredItems.map((item) => {
              const hasMods = itemModifierLinks.some(l => l.pos_item_id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemTap(item)}
                  className={`glass-panel p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all cursor-pointer relative overflow-hidden group ${
                    item.is_sold_out 
                      ? "border-black/5 dark:border-white/5 bg-black/5 bg-card opacity-55"
                      : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 hover:border-white/20 active:scale-98 shadow-md"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-sky-400 transition-colors">
                        {item.name}
                      </h3>
                      {hasMods && !item.is_sold_out && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold shrink-0">MODS</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground dark:text-zinc-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <span className="text-sm font-black text-white">${Number(item.price).toFixed(2)}</span>
                    {item.is_sold_out && (
                      <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">86'd</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right pane: Sticky Cart/Ticket Pane */}
      <aside className="glass-panel w-[360px] border-l border-black/10 dark:border-white/10 bg-black/5 bg-card backdrop-blur-md flex flex-col overflow-hidden shrink-0">
        <header className="px-5 py-4 bg-black/5 bg-card border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-sky-400" /> Current Ticket
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-zinc-500 dark:text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </header>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground dark:text-zinc-500 text-center py-20 px-4">
              <ShoppingBag className="w-10 h-10 text-zinc-700 mb-2" />
              <p className="font-bold text-zinc-500 dark:text-muted-foreground">Cart is empty</p>
              <p className="text-xs mt-0.5 text-muted-foreground dark:text-zinc-500">Tap items on the left to add them to this ticket.</p>
            </div>
          ) : (
            cart.map((item) => {
              const modsCost = item.modifiers.reduce((sum, m) => sum + m.price, 0);
              const singleTotal = item.price + modsCost;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-black/20 border border-black/5 dark:border-white/5 rounded-xl flex flex-col justify-between gap-2 relative group hover:border-white/15 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.name}</p>
                      {item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-2 border-l border-black/10 dark:border-white/10">
                          {item.modifiers.map((m, idx) => (
                            <span key={idx} className="text-[10px] text-zinc-500 dark:text-muted-foreground">
                              + {m.name} {m.price > 0 && `(+$${m.price.toFixed(2)})`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-black text-white">${(singleTotal * item.quantity).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="p-1 text-zinc-500 dark:text-muted-foreground hover:text-white hover:bg-black/5 bg-card rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="p-1 text-zinc-500 dark:text-muted-foreground hover:text-white hover:bg-black/5 bg-card rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-muted-foreground dark:text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pricing Summary & Checkout */}
        <div className="p-4 bg-black/5 bg-card border-t border-black/5 dark:border-white/5 space-y-4 shrink-0">
          <div className="space-y-1.5 text-xs text-zinc-500 dark:text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.25%)</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-black/5 dark:border-white/5">
              <span>Total</span>
              <span className="text-sky-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowTenderModal(true)}
            disabled={cart.length === 0}
            className="w-full justify-center bg-sky-500 hover:bg-sky-400 text-white py-3 font-bold rounded-xl shadow-lg shadow-sky-500/10 cursor-pointer disabled:opacity-40"
          >
            Checkout & Tender
          </Button>
        </div>
      </aside>

      {/* Modifier Dialog Overlay */}
      {selectedItemForModifiers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-50 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[85vh] overflow-hidden">
            <h3 className="text-lg font-extrabold mb-1 text-white">Customize {selectedItemForModifiers.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-muted-foreground mb-4 border-b border-black/5 dark:border-white/5 pb-2">Select required modifiers before adding to order.</p>

            {/* List Modifier Groups */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
              {activeModGroupsForSelected.map((group) => {
                const selections = selectedModifiers[group.id] || [];
                const options = modifierOptions.filter(opt => opt.modifier_group_id === group.id);

                return (
                  <div key={group.id} className="space-y-2 p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-white">{group.name}</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-muted-foreground">
                          {group.min_required ? `Requires min: ${group.min_required}` : "Optional"} 
                          {group.max_allowed ? ` (Max: ${group.max_allowed})` : ""}
                        </p>
                      </div>
                      {group.min_required > 0 && selections.length < group.min_required && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase animate-pulse">Required</span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {options.map((opt) => {
                        const isSelected = selections.some(m => m.id === opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleModifierToggle(group, opt)}
                            className={`p-3 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? "bg-sky-500/10 border-sky-500 text-sky-400"
                                : "bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 bg-card"
                            }`}
                          >
                            <span>{opt.name}</span>
                            {Number(opt.price) > 0 && (
                              <span className="text-[10px] text-zinc-500 dark:text-muted-foreground font-extrabold">+${Number(opt.price).toFixed(2)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5 mt-5">
              <button
                type="button"
                onClick={() => setSelectedItemForModifiers(null)}
                className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button onClick={handleAddWithModifiers} className="bg-white text-black hover:bg-zinc-200 text-xs font-bold py-2 rounded-lg">
                Add to Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tender Selection Drawer Overlay */}
      {showTenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-50 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-zinc-900 dark:text-zinc-100 flex flex-col">
            <h3 className="text-lg font-extrabold mb-1 text-white">Tender / Complete Sale</h3>
            <p className="text-xs text-zinc-500 dark:text-muted-foreground mb-4 pb-2 border-b border-black/5 dark:border-white/5">Select payment method for this checkout transaction.</p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 p-4 rounded-xl">
                <span className="font-semibold text-zinc-500 dark:text-muted-foreground">Total Tender Amount:</span>
                <span className="font-black text-sky-400 text-base">${total.toFixed(2)}</span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setTenderMethod("CASH"); setCashReceived(""); }}
                  className={`p-4 rounded-xl border text-center font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    tenderMethod === "CASH"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                      : "bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 bg-card"
                  }`}
                >
                  <DollarSign className="w-6 h-6" />
                  <span>Cash Payment</span>
                </button>

                <button
                  onClick={() => { setTenderMethod("CARD"); setCashReceived(total.toString()); }}
                  className={`p-4 rounded-xl border text-center font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    tenderMethod === "CARD"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                      : "bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 bg-card"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Card / Reader</span>
                </button>
              </div>

              {/* Cash Input Details */}
              {tenderMethod === "CASH" && (
                <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-muted-foreground mb-1">Cash Received ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full bg-white/50 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex gap-2">
                    {[total, 10, 20, 50, 100].map((amt, idx) => {
                      const displayAmt = amt === total ? "Exact" : `$${amt}`;
                      const val = amt === total ? total : amt;
                      if (val < total && amt !== total) return null;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCashReceived(val.toFixed(2))}
                          className="flex-1 text-center py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded border border-black/5 dark:border-white/5 cursor-pointer"
                        >
                          {displayAmt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-black/5 dark:border-white/5 text-zinc-500 dark:text-muted-foreground">
                    <span>Change Due:</span>
                    <span className="font-extrabold text-green-400 text-sm">${cashChange}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5 mt-6">
              <button
                onClick={() => { setShowTenderModal(false); setTenderMethod(null); }}
                className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                onClick={handleProcessCheckout}
                disabled={!tenderMethod || submittingCheckout || (tenderMethod === "CASH" && (parseFloat(cashReceived) || 0) < total)}
                className="bg-white text-black hover:bg-zinc-200 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {submittingCheckout ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Complete Tender <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
