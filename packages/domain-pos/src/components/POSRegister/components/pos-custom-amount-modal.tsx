"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@soustools/design-system";
import { X, PlusCircle } from "lucide-react";
import { POSTenderKeypad } from "./pos-tender-keypad";
import { getUpdatedTenderedBuffer } from "./pos-tender-utils";

export interface POSCustomAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomAmount: (name: string, amount: number) => void;
}

export function POSCustomAmountModal({
  isOpen,
  onClose,
  onAddCustomAmount,
}: POSCustomAmountModalProps) {
  const [name, setName] = useState("Custom Item");
  const [amountBuffer, setAmountBuffer] = useState("");

  if (!isOpen) return null;

  const currentAmount = parseFloat(amountBuffer) || 0;

  const handleKeypadPress = (val: string) => {
    setAmountBuffer((prev) => getUpdatedTenderedBuffer(prev, val));
  };

  const handlePreset = (val: number) => {
    setAmountBuffer(val.toFixed(2));
  };

  const handleAdd = () => {
    if (currentAmount > 0) {
      onAddCustomAmount(name.trim() || "Custom Item", currentAmount);
      onClose();
    }
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-sky-400" />
            <CardTitle className="text-foreground text-lg font-black">
              Add Custom Amount
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

        <CardContent className="space-y-4 p-5">
          {/* Label Input */}
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Item Description / Label
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Corkage Fee, Custom Charge..."
              className="text-foreground focus:ring-primary w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Amount Display */}
          <div className="space-y-1 rounded-xl border border-white/10 bg-black/20 p-4 text-center">
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Amount
            </span>
            <div className="text-accent text-3xl font-black">
              ${currentAmount.toFixed(2)}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className="text-foreground cursor-pointer rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-black transition-all hover:bg-white/15"
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Keypad */}
          <POSTenderKeypad onPress={handleKeypadPress} />
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            className="min-w-[120px] font-black"
            disabled={currentAmount <= 0}
            onClick={handleAdd}
          >
            Add to Ticket
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
POSCustomAmountModal.displayName = "POSCustomAmountModal";
