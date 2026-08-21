"use client";

import { useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@soustools/design-system";
import { X, Printer, CheckCircle } from "lucide-react";
import { type CartItem, type OrderType } from "../pos.types";

export interface POSReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  orderType: OrderType;
  subtotal: number;
  tax: number;
  total: number;
  tenderMethod: string;
  amountTendered: number;
  changeDue: number;
  orderNumber?: string;
}

export function POSReceiptModal({
  isOpen,
  onClose,
  items,
  orderType,
  subtotal,
  tax,
  total,
  tenderMethod,
  amountTendered,
  changeDue,
  orderNumber = Math.floor(1000 + Math.random() * 9000).toString(),
}: POSReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-foreground text-lg font-black">
              Receipt Preview
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Printable Thermal Receipt Container */}
          <div
            ref={receiptRef}
            className="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-6 font-mono text-xs text-zinc-950 shadow-md"
          >
            {/* Store Header */}
            <div className="space-y-1 border-b border-dashed border-zinc-400 pb-3 text-center">
              <h2 className="text-base font-black tracking-wider uppercase">
                SOUS TOOLS
              </h2>
              <p className="text-[11px] text-zinc-600">
                123 Culinary Way, Suite 100
              </p>
              <p className="text-[11px] text-zinc-600">Tel: (555) 019-2834</p>
              <div className="flex justify-between pt-2 text-[11px] font-bold">
                <span>Order #{orderNumber}</span>
                <span className="uppercase">{orderType.replace("_", " ")}</span>
              </div>
              <div className="text-left text-[10px] text-zinc-500">
                {new Date().toLocaleString()}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 border-b border-dashed border-zinc-400 pb-3">
              {items.map((item) => {
                // item unitPrice
                const unitPrice = item.price;
                const lineTotal = unitPrice * item.quantity;
                return (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${lineTotal.toFixed(2)}</span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className="space-y-0.5 pl-3 text-[10px] text-zinc-600">
                        {item.modifiers.map((m) => (
                          <div key={m.id} className="flex justify-between">
                            <span>+ {m.name}</span>
                            {m.price > 0 && <span>+${m.price.toFixed(2)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1 border-b border-dashed border-zinc-400 pb-3 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Tender Details */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="uppercase">Tender ({tenderMethod}):</span>
                <span>${amountTendered.toFixed(2)}</span>
              </div>
              {tenderMethod === "cash" && (
                <div className="flex justify-between font-bold">
                  <span>Change Due:</span>
                  <span>${changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="space-y-1 border-t border-dashed border-zinc-400 pt-3 text-center">
              <p className="text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
                Thank you for dining with us!
              </p>
              <div className="text-[9px] text-zinc-400">
                * * * SOUS TOOLS POS * * *
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex flex-row items-center justify-between border-t p-4">
          <Button variant="ghost" onClick={onClose}>
            Done / Close
          </Button>
          <Button
            variant="gradient"
            className="flex items-center gap-1.5 font-bold"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
POSReceiptModal.displayName = "POSReceiptModal";
