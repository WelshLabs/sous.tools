"use client";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@soustools/design-system";
import { X, Ban, CheckCircle2 } from "lucide-react";
import { type CatalogItem } from "../pos.types";

export interface POSItemActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onToggleSoldOut: (itemId: string, currentStatus: boolean) => void;
}

export function POSItemActionModal({
  isOpen,
  onClose,
  item,
  onToggleSoldOut,
}: POSItemActionModalProps) {
  if (!isOpen || !item) return null;

  const isSoldOut = Boolean(item.isSoldOut);

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-3">
          <div>
            <CardTitle className="text-foreground text-base font-black">
              Item Actions
            </CardTitle>
            <p className="text-muted-foreground max-w-[220px] truncate text-xs">
              {item.name}
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

        <CardContent className="space-y-3 p-5">
          {/* Toggle 86 / Out of Stock */}
          <button
            type="button"
            onClick={() => {
              onToggleSoldOut(item.id, isSoldOut);
              onClose();
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all ${
              isSoldOut
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {isSoldOut ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Ban className="h-5 w-5" />
              )}
              <div>
                <span className="block text-sm font-black">
                  {isSoldOut ? "Mark as Available" : "86 / Mark Sold Out"}
                </span>
                <span className="text-[11px] opacity-80">
                  {isSoldOut
                    ? "Restore item availability in POS"
                    : "Temporarily disable item from sales"}
                </span>
              </div>
            </div>
          </button>
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex justify-end border-t p-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
POSItemActionModal.displayName = "POSItemActionModal";
