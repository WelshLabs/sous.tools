"use client";


import { Button, Card } from "@soustools/design-system";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { type CartItem } from "../pos.types";

export interface POSTicketProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export function POSTicket({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isCheckingOut = false,
}: POSTicketProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price + item.modifiers.reduce((mSum, m) => mSum + m.price, 0)) * item.quantity,
    0
  );
  const tax = subtotal * 0.0825; // Simulated 8.25% sales tax
  const total = subtotal + tax;

  return (
    <div className="flex h-full flex-col">
      {/* Ticket Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/80 p-4 bg-card/10">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold tracking-tight text-foreground">Current Ticket</h3>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearCart}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Ticket Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="rounded-full bg-muted/30 p-4 mb-3">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold text-foreground">Ticket is empty</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Tap catalog items on the left to add them to this ticket.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const itemModifierSum = item.modifiers.reduce((sum, m) => sum + m.price, 0);
            const unitTotal = item.price + itemModifierSum;
            const lineTotal = unitTotal * item.quantity;

            return (
              <Card key={item.id} glass className="p-3 border border-border/50 bg-card/25">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {item.name}
                    </h4>
                    {item.modifiers.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {item.modifiers.map((modifier) => (
                          <li
                            key={modifier.id}
                            className="text-[11px] text-muted-foreground leading-normal"
                          >
                            + {modifier.name} (+${modifier.price.toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-xs font-semibold text-accent mt-1.5">
                      ${unitTotal.toFixed(2)} each
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2.5">
                  {/* Quantity Controls */}
                  <div className="flex items-center rounded-full border border-border/80 bg-background/50 p-0.5">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="text-sm font-bold text-foreground">
                    ${lineTotal.toFixed(2)}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Section */}
      <div className="shrink-0 border-t border-border bg-card/45 p-4 space-y-3.5">
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax (8.25%)</span>
            <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/30 pt-2">
            <span>Total</span>
            <span className="text-accent">${total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          variant="gradient"
          className="w-full font-bold shadow-glow-sm h-12 text-sm"
          disabled={items.length === 0 || isCheckingOut}
          onClick={onCheckout}
        >
          {isCheckingOut ? "Processing..." : "Checkout"}
        </Button>
      </div>
    </div>
  );
}
POSTicket.displayName = "POSTicket";
