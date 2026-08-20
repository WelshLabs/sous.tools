/* eslint-disable max-lines */
"use client";

import { Button, Card } from "@soustools/design-system";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  UtensilsCrossed,
  ShoppingBag as BagIcon,
  BookmarkPlus,
  PlusCircle,
} from "lucide-react";
import { type CartItem, type OrderType } from "../pos.types";
import { calculateTotals } from "../pos.helpers";

export interface POSTicketProps {
  items: CartItem[];
  orderType: OrderType;
  taxRate?: number;
  onSetOrderType: (type: OrderType) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSaveCheck: () => void;
  onCheckout: () => void;
  onOpenCustomAmount?: () => void;
  isCheckingOut?: boolean;
}

export function POSTicket({
  items,
  orderType,
  taxRate = 0.06,
  onSetOrderType,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSaveCheck,
  onCheckout,
  onOpenCustomAmount,
  isCheckingOut = false,
}: POSTicketProps) {
  const { subtotal, tax, total } = calculateTotals(items, taxRate);
  const taxPercent = (taxRate * 100).toFixed(1);

  return (
    <div className="flex h-full flex-col">
      {/* Ticket Header: Title + Order Type Selector ("For Here" / "To Go") */}
      <div className="border-border/80 bg-card/20 flex shrink-0 flex-col gap-2.5 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-5 w-5" />
            <h3 className="text-foreground text-base font-extrabold tracking-tight">
              Current Ticket
            </h3>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-7 px-2 text-xs font-bold hover:text-amber-400"
                onClick={onSaveCheck}
                title="Hold / Save Check"
              >
                <BookmarkPlus className="mr-1 h-3.5 w-3.5" />
                Hold
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs font-bold"
                onClick={onClearCart}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Order Type Toggle ("For Here" vs "To Go") */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/5 bg-black/30 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => onSetOrderType("for_here")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
              orderType === "for_here"
                ? "bg-primary font-black text-zinc-950 shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>For Here</span>
          </button>
          <button
            type="button"
            onClick={() => onSetOrderType("to_go")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
              orderType === "to_go"
                ? "bg-primary font-black text-zinc-950 shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BagIcon className="h-3.5 w-3.5" />
            <span>To Go</span>
          </button>
        </div>
      </div>

      {/* Ticket Items List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="bg-muted/30 mb-3 rounded-full p-4">
              <ShoppingBag className="text-muted-foreground/60 h-8 w-8" />
            </div>
            <p className="text-foreground text-sm font-semibold">
              Ticket is empty
            </p>
            <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
              Tap catalog items on the left to add them to this ticket.
            </p>
            {onOpenCustomAmount && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCustomAmount}
                className="mt-4 flex items-center gap-1.5 text-xs font-bold"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Custom Amount
              </Button>
            )}
          </div>
        ) : (
          items.map((item) => {
            const basePrice = item.basePrice || item.price;
            const unitTotal = item.price;
            const lineTotal = unitTotal * item.quantity;

            return (
              <Card
                key={item.id}
                glass
                className="border-border/50 bg-card/30 border p-3 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-foreground truncate text-sm font-bold">
                      {item.name}
                    </h4>

                    {/* Breakdown: Base Cost Before Modifiers */}
                    <div className="text-muted-foreground mt-0.5 text-[11px]">
                      Base: ${basePrice.toFixed(2)}
                    </div>

                    {/* Modifiers List */}
                    {item.modifiers.length > 0 && (
                      <ul className="border-primary/40 mt-1 space-y-0.5 border-l-2 pl-2">
                        {item.modifiers.map((modifier) => (
                          <li
                            key={modifier.id}
                            className="text-foreground/80 text-[11px] leading-normal"
                          >
                            + {modifier.name}{" "}
                            <span className="text-accent font-semibold">
                              (+${modifier.price.toFixed(2)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Unit Total After Modifiers */}
                    <p className="text-accent mt-1.5 text-xs font-bold">
                      ${unitTotal.toFixed(2)} each
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0 rounded-full"
                    onClick={() => onRemoveItem(item.id)}
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="border-border/30 mt-3 flex items-center justify-between border-t pt-2.5">
                  {/* Quantity Controls */}
                  <div className="border-border/80 bg-background/50 flex items-center rounded-full border p-0.5">
                    <button
                      type="button"
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-6 w-6 items-center justify-center rounded-full active:scale-90"
                      onClick={() =>
                        onUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-foreground w-8 text-center text-xs font-black">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-6 w-6 items-center justify-center rounded-full active:scale-90"
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="text-foreground text-sm font-black">
                    ${lineTotal.toFixed(2)}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Section */}
      <div className="border-border bg-card/45 shrink-0 space-y-3.5 border-t p-4">
        <div className="text-muted-foreground space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-foreground font-semibold">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax ({taxPercent}%)</span>
            <span className="text-foreground font-semibold">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="text-foreground border-border/30 flex justify-between border-t pt-2 text-base font-black">
            <span>Total</span>
            <span className="text-accent text-lg font-black">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-12 border-white/10 font-bold"
            disabled={items.length === 0}
            onClick={onSaveCheck}
          >
            Save Check
          </Button>

          <Button
            variant="gradient"
            className="shadow-glow-sm h-12 text-sm font-black"
            disabled={items.length === 0 || isCheckingOut}
            onClick={onCheckout}
          >
            {isCheckingOut ? "Processing..." : "Pay / Checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
POSTicket.displayName = "POSTicket";
