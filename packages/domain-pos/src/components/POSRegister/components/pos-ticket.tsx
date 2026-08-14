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
    (sum, item) =>
      sum +
      (item.price + item.modifiers.reduce((mSum, m) => mSum + m.price, 0)) *
        item.quantity,
    0,
  );
  const tax = subtotal * 0.0825; // Simulated 8.25% sales tax
  const total = subtotal + tax;

  return (
    <div className="flex h-full flex-col">
      {/* Ticket Header */}
      <div className="border-border/80 bg-card/10 flex shrink-0 items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-primary h-5 w-5" />
          <h3 className="text-foreground text-lg font-bold tracking-tight">
            Current Ticket
          </h3>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-8 text-xs"
            onClick={onClearCart}
          >
            Clear
          </Button>
        )}
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
          </div>
        ) : (
          items.map((item) => {
            const itemModifierSum = item.modifiers.reduce(
              (sum, m) => sum + m.price,
              0,
            );
            const unitTotal = item.price + itemModifierSum;
            const lineTotal = unitTotal * item.quantity;

            return (
              <Card
                key={item.id}
                glass
                className="border-border/50 bg-card/25 border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-foreground truncate text-sm font-semibold">
                      {item.name}
                    </h4>
                    {item.modifiers.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {item.modifiers.map((modifier) => (
                          <li
                            key={modifier.id}
                            className="text-muted-foreground text-[11px] leading-normal"
                          >
                            + {modifier.name} (+${modifier.price.toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-accent mt-1.5 text-xs font-semibold">
                      ${unitTotal.toFixed(2)} each
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0 rounded-full"
                    onClick={() => onRemoveItem(item.id)}
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
                    <span className="text-foreground w-8 text-center text-xs font-semibold">
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
                  <span className="text-foreground text-sm font-bold">
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
            <span className="text-foreground font-medium">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax (8.25%)</span>
            <span className="text-foreground font-medium">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="text-foreground border-border/30 flex justify-between border-t pt-2 text-sm font-bold">
            <span>Total</span>
            <span className="text-accent">${total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          variant="gradient"
          className="shadow-glow-sm h-12 w-full text-sm font-bold"
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
