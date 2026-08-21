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
import { X, CreditCard, Printer, DollarSign } from "lucide-react";
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
  onSubmit: (
    paymentType: string,
    amountTendered: number,
    options?: { printReceipt: boolean; openDrawer: boolean },
  ) => void;
}

export function POSTenderModal({
  isOpen,
  onClose,
  amountDue,
  onSubmit,
}: POSTenderModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [tenderedBuffer, setTenderedBuffer] = useState("");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod("cash");
      setTenderedBuffer("");
      setPrintReceipt(true);
      setOpenDrawer(true);
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
      onSubmit(selectedMethod, currentTendered, { printReceipt, openDrawer });
    }
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-foreground text-xl font-black">
              Payment Checkout
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Select tender method and complete transaction
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
          <div className="space-y-5">
            <div className="space-y-2.5">
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
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-3.5 text-center transition-all",
                        isSelected
                          ? "border-primary bg-primary/15 text-primary shadow-sm"
                          : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80 text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-bold">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Indicators */}
            <div className="border-border/60 space-y-2.5 rounded-xl border bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="text-foreground text-base font-black">
                  ${amountDue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Tendered</span>
                <span className="text-accent text-base font-black">
                  ${currentTendered.toFixed(2)}
                </span>
              </div>

              {selectedMethod === "cash" && (
                <div className="border-border/30 flex items-center justify-between border-t pt-2.5 text-base font-bold">
                  {currentTendered >= amountDue ? (
                    <>
                      <span className="font-black text-emerald-400">
                        Change Due
                      </span>
                      <span className="text-lg font-black text-emerald-400">
                        ${changeDue.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-destructive font-bold">
                        Remaining
                      </span>
                      <span className="text-destructive font-bold">
                        ${remainingDue.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Receipt & Drawer Options */}
            <div className="space-y-2 pt-1">
              <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs font-semibold select-none">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="text-primary rounded border-white/20 bg-black/30 accent-sky-500"
                />
                <Printer className="h-3.5 w-3.5 text-sky-400" />
                <span>Print receipt automatically</span>
              </label>

              {selectedMethod === "cash" && (
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={openDrawer}
                    onChange={(e) => setOpenDrawer(e.target.checked)}
                    className="text-primary rounded border-white/20 bg-black/30 accent-sky-500"
                  />
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Kick open cash drawer</span>
                </label>
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
                          "cursor-pointer rounded-xl border px-3 py-2 text-center text-xs font-black transition-all",
                          parseFloat(tenderedBuffer) === opt
                            ? "border-primary bg-primary/15 text-primary shadow-sm"
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
              <div className="border-border/60 bg-card/5 flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
                <CreditCard className="mb-3 h-12 w-12 animate-pulse text-sky-400/80" />
                <span className="text-foreground text-base font-bold">
                  Card Terminal Ready
                </span>
                <p className="text-muted-foreground mt-1 max-w-[220px] text-xs">
                  Tap, insert chip, or swipe card on the terminal to complete
                  payment.
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex flex-row items-center justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={
              selectedMethod !== "cash" || currentTendered >= amountDue
                ? "gradient"
                : "outline"
            }
            className="min-w-[150px] font-black"
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
