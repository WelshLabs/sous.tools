"use client";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@soustools/design-system";
import { X, FileText, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { type SavedCheck } from "../pos.types";

export interface POSSavedChecksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedChecks: SavedCheck[];
  onResumeCheck: (check: SavedCheck) => void;
  onDeleteCheck: (id: string) => void;
}

export function POSSavedChecksModal({
  isOpen,
  onClose,
  savedChecks = [],
  onResumeCheck,
  onDeleteCheck,
}: POSSavedChecksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground text-lg font-black">
                Held / Saved Checks
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Resume an open order or park checks for later checkout
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

        <CardContent className="flex-1 space-y-3 overflow-y-auto p-5">
          {savedChecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-12 text-center">
              <ShoppingBag className="text-muted-foreground/50 h-8 w-8" />
              <p className="text-foreground text-sm font-bold">
                No active saved checks
              </p>
              <p className="text-muted-foreground max-w-xs text-xs">
                Click "Hold / Save Check" on the ticket to park open orders.
              </p>
            </div>
          ) : (
            savedChecks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4 shadow-sm transition-all hover:border-sky-500/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-foreground truncate text-sm font-bold">
                      {check.checkName}
                    </h4>
                    <span className="rounded border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase">
                      {check.orderType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                    <span>{check.items.length} items</span>
                    <span>•</span>
                    <span>
                      {new Date(check.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-accent text-base font-black">
                    ${check.total.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteCheck(check.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
                    title="Delete Check"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => {
                      onResumeCheck(check);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold"
                  >
                    Resume
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
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
POSSavedChecksModal.displayName = "POSSavedChecksModal";
