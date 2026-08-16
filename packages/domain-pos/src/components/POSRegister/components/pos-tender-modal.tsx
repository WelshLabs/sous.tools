/* eslint-disable max-lines */
"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  cn,
} from "@soustools/design-system";
import { X, CreditCard } from "lucide-react";
import {
  PAYMENT_METHODS,
  getQuickCashOptions,
  getUpdatedTenderedBuffer,
} from "./pos-tender-utils";
import { POSTenderKeypad } from "./pos-tender-keypad";

export interface POSTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountDue: number;
  onSubmit: (paymentType: string, amountTendered: number) => void;
}

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

  const currentTendered =
    selectedMethod === "cash"
      ? tenderedBuffer === ""
        ? amountDue
        : parseFloat(tenderedBuffer) || 0
      : amountDue;

  const changeDue = Math.max(0, currentTendered - amountDue);
  const remainingDue = Math.max(0, amountDue - currentTendered);

  const handleKeypadPress = (val: string) => {
    if (selectedMethod !== "cash") return;
    setTenderedBuffer((prev) => getUpdatedTenderedBuffer(prev, val));
  };

  const quickCashOptions = getQuickCashOptions(amountDue);

  const handleTenderSubmit = () => {
    if (selectedMethod !== "cash" || currentTendered >= amountDue) {
      onSubmit(selectedMethod, currentTendered);
    }
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-2xl flex-col border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-foreground text-xl font-bold">
              Payment Checkout
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Select a payment method and complete checkout
            </p>
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

        <CardContent className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">
          {/* Left Column: Methods & Summary */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Payment Method
              </span>
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
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-sm)] border p-4 text-center transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80 text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-semibold">
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Indicators */}
            <div className="border-border/60 bg-card/10 space-y-3 rounded-[var(--radius-sm)] border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="text-foreground font-bold">
                  ${amountDue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Tendered</span>
                <span className="text-accent font-bold">
                  ${currentTendered.toFixed(2)}
                </span>
              </div>

              {selectedMethod === "cash" && (
                <div className="border-border/30 flex items-center justify-between border-t pt-3 text-base font-bold">
                  {currentTendered >= amountDue ? (
                    <>
                      <span className="text-success-foreground">
                        Change Due
                      </span>
                      <span className="text-emerald-400">
                        ${changeDue.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-destructive">Remaining</span>
                      <span className="text-destructive">
                        ${remainingDue.toFixed(2)}
                      </span>
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
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Quick Cash
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {quickCashOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTenderedBuffer(opt.toFixed(2))}
                        className={cn(
                          "cursor-pointer rounded-[var(--radius-sm)] border px-3 py-2 text-center text-xs font-bold transition-all",
                          parseFloat(tenderedBuffer) === opt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-card/40 hover:border-border text-foreground",
                        )}
                      >
                        {opt === amountDue
                          ? "Exact Cash"
                          : `$${opt.toFixed(2)}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keypad */}
                <POSTenderKeypad onPress={handleKeypadPress} />
              </>
            ) : (
              <div className="border-border/60 bg-card/5 flex h-full min-h-[220px] flex-col items-center justify-center rounded-[var(--radius-sm)] border border-dashed p-6 text-center">
                <CreditCard className="text-muted-foreground/40 mb-3 h-10 w-10 animate-pulse" />
                <span className="text-foreground text-sm font-semibold">
                  Waiting for device...
                </span>
                <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
                  Swipe, insert, or tap device to charge the transaction.
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-border/50 bg-card/25 flex flex-row items-center justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={
              selectedMethod !== "cash" || currentTendered >= amountDue
                ? "gradient"
                : "outline"
            }
            className="min-w-[140px] font-bold"
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
