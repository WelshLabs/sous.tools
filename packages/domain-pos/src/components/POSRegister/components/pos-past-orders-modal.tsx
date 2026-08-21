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
import { X, History, RotateCcw, Ban } from "lucide-react";
import { type PastOrder } from "../pos.types";

export interface POSPastOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: PastOrder[];
  onVoidRefund: (orderId: string, action: "VOID" | "REFUND") => void;
}

export function POSPastOrdersModal({
  isOpen,
  onClose,
  orders = [],
  onVoidRefund,
}: POSPastOrdersModalProps) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PastOrder | null>(null);

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.external_id.toLowerCase().includes(q) ||
      (o.state && o.state.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground text-lg font-black">
                Past Orders & Transactions
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Review sales history, reprints, refunds, and voids
              </p>
            </div>
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

        <div className="border-b border-white/5 bg-black/10 p-4">
          <input
            type="text"
            placeholder="Search order ID or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-foreground focus:ring-primary w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs focus:ring-2 focus:outline-none"
          />
        </div>

        <CardContent className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
          <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center text-xs">
                No past transactions found.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const isVoided =
                  order.state === "VOIDED" || order.state === "REFUNDED";
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-mono text-xs font-bold">
                        #{order.external_id || order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                          isVoided
                            ? "bg-destructive/20 text-destructive border-destructive/30 border"
                            : "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {order.state}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-accent text-sm font-black">
                        $${order.total_money.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/30 p-4">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h4 className="text-foreground text-sm font-bold">
                    Order Details
                  </h4>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    ID: {selectedOrder.id}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Time: {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-foreground font-bold">
                      {selectedOrder.state}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="text-accent text-base font-black">
                      $${selectedOrder.total_money.toFixed(2)}
                    </span>
                  </div>
                </div>
                {selectedOrder.state !== "VOIDED" &&
                  selectedOrder.state !== "REFUNDED" && (
                    <div className="flex gap-2 border-t border-white/10 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10 flex-1 text-xs font-bold"
                        onClick={() => onVoidRefund(selectedOrder.id, "VOID")}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" /> Void
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-amber-500/40 text-xs font-bold text-amber-400 hover:bg-amber-500/10"
                        onClick={() => onVoidRefund(selectedOrder.id, "REFUND")}
                      >
                        <RotateCcw className="mr-1 h-3.5 w-3.5" /> Refund
                      </Button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-6 text-center text-xs">
                Select an order on the left to view details, void, or refund.
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex justify-end border-t p-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
POSPastOrdersModal.displayName = "POSPastOrdersModal";
