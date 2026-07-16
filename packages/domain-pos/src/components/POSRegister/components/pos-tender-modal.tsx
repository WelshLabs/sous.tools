"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, cn } from "@soustools/design-system";
import { X, CreditCard, DollarSign, Gift, QrCode, Delete } from "lucide-react";

export interface POSTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountDue: number;
  onSubmit: (paymentType: string, amountTendered: number) => void;
}

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: DollarSign },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "gift_card", label: "Gift Card", icon: Gift },
  { id: "mobile_pay", label: "Mobile Pay", icon: QrCode },
];

export function POSTenderModal({
  isOpen,
  onClose,
  amountDue,
  onSubmit,
}: POSTenderModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [tenderedBuffer, setTenderedBuffer] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod("cash");
      setTenderedBuffer("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTendered = selectedMethod === "cash" 
    ? (tenderedBuffer === "" ? amountDue : parseFloat(tenderedBuffer) || 0)
    : amountDue;

  const changeDue = Math.max(0, currentTendered - amountDue);
  const remainingDue = Math.max(0, amountDue - currentTendered);

  const handleKeypadPress = (val: string) => {
    if (selectedMethod !== "cash") return;

    if (val === "C") {
      setTenderedBuffer("");
      return;
    }
    if (val === "⌫") {
      setTenderedBuffer((prev) => prev.slice(0, -1));
      return;
    }
    if (val === "." && tenderedBuffer.includes(".")) return;
    
    setTenderedBuffer((prev) => (prev === "0" && val !== "." ? val : prev + val));
  };

  const getQuickCashOptions = (due: number) => {
    const options = new Set<number>();
    options.add(due);

    const ceilDue = Math.ceil(due);
    if (ceilDue > due) options.add(ceilDue);

    const nextFive = Math.ceil(due / 5) * 5;
    if (nextFive >= due) options.add(nextFive);

    const nextTen = Math.ceil(due / 10) * 10;
    if (nextTen >= due) options.add(nextTen);

    [20, 50, 100].forEach((bill) => {
      if (bill >= due) options.add(bill);
    });

    return Array.from(options).slice(0, 4);
  };

  const quickCashOptions = getQuickCashOptions(amountDue);

  const handleTenderSubmit = () => {
    if (selectedMethod !== "cash" || currentTendered >= amountDue) {
      onSubmit(selectedMethod, currentTendered);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-2xl border border-border bg-card shadow-glow-sm flex flex-col max-h-[90vh]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Payment Checkout</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Select a payment method and complete checkout</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Methods & Summary */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Method</span>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setTenderedBuffer("");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-[var(--radius-sm)] border text-center transition-all gap-2 cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80 text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-semibold">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Indicators */}
            <div className="p-4 rounded-[var(--radius-sm)] border border-border/60 bg-card/10 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="font-bold text-foreground">${amountDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Tendered</span>
                <span className="font-bold text-accent">${currentTendered.toFixed(2)}</span>
              </div>

              {selectedMethod === "cash" && (
                <div className="border-t border-border/30 pt-3 flex justify-between items-center text-base font-bold">
                  {currentTendered >= amountDue ? (
                    <>
                      <span className="text-success-foreground">Change Due</span>
                      <span className="text-emerald-400">${changeDue.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-destructive">Remaining</span>
                      <span className="text-destructive">${remainingDue.toFixed(2)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cash Options / Keypad */}
          <div className="space-y-4">
            {selectedMethod === "cash" ? (
              <>
                {/* Quick Cash Options */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Cash</span>
                  <div className="grid grid-cols-2 gap-2">
                    {quickCashOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTenderedBuffer(opt.toFixed(2))}
                        className={cn(
                          "py-2 px-3 text-xs font-bold rounded-[var(--radius-sm)] border text-center cursor-pointer transition-all",
                          parseFloat(tenderedBuffer) === opt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-card/40 hover:border-border text-foreground"
                        )}
                      >
                        {opt === amountDue ? "Exact Cash" : `$${opt.toFixed(2)}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className="h-12 text-sm font-bold rounded-[var(--radius-sm)] border border-border/50 bg-card/30 hover:bg-card/70 text-foreground cursor-pointer flex items-center justify-center transition-all"
                    >
                      {key === "⌫" ? <Delete className="h-4 w-4 text-muted-foreground" /> : key}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress("C")}
                    className="col-span-3 h-10 text-xs font-bold rounded-[var(--radius-sm)] border border-border/50 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer flex items-center justify-center transition-all mt-1"
                  >
                    Clear Input
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded-[var(--radius-sm)] bg-card/5">
                <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Waiting for device...</span>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Swipe, insert, or tap device to charge the transaction.
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-row items-center justify-end gap-2 border-t border-border/50 pt-4 bg-card/25">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={selectedMethod !== "cash" || currentTendered >= amountDue ? "gradient" : "outline"}
            className="font-bold min-w-[140px]"
            disabled={selectedMethod === "cash" && currentTendered < amountDue}
            onClick={handleTenderSubmit}
          >
            Complete Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
POSTenderModal.displayName = "POSTenderModal";