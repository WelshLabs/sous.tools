/* eslint-disable max-lines */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  cn,
} from "@soustools/design-system";
import { X, Check, AlertCircle } from "lucide-react";
import { type CatalogItem } from "../pos.types";

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface POSModifiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  groups: ModifierGroup[];
  onSubmit: (selected: ModifierOption[], notes?: string) => void;
}

export function POSModifiersModal({
  isOpen,
  onClose,
  item,
  groups = [],
  onSubmit,
}: POSModifiersModalProps) {
  const [selections, setSelections] = useState<
    Record<string, ModifierOption[]>
  >({});
  const [notes, setNotes] = useState("");

  // Filter modifier groups strictly by the item's assigned modifierGroupIds
  const applicableGroups = useMemo(() => {
    if (!item) return [];
    const itemGroupIds = item.modifierGroupIds || [];
    if (itemGroupIds.length > 0) {
      return groups.filter((g) => itemGroupIds.includes(g.id));
    }
    return groups;
  }, [item, groups]);

  useEffect(() => {
    if (isOpen) {
      setSelections({});
      setNotes("");
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleOptionToggle = (group: ModifierGroup, option: ModifierOption) => {
    const currentGroupSelections = selections[group.id] || [];
    const isSelected = currentGroupSelections.some(
      (opt) => opt.id === option.id,
    );

    if (isSelected) {
      setSelections({
        ...selections,
        [group.id]: currentGroupSelections.filter(
          (opt) => opt.id !== option.id,
        ),
      });
    } else {
      if (group.maxSelections === 1) {
        setSelections({
          ...selections,
          [group.id]: [option],
        });
      } else if (currentGroupSelections.length < group.maxSelections) {
        setSelections({
          ...selections,
          [group.id]: [...currentGroupSelections, option],
        });
      }
    }
  };

  const isGroupValid = (group: ModifierGroup) => {
    const count = (selections[group.id] || []).length;
    const minRequired = group.required
      ? Math.max(1, group.minSelections || 1)
      : group.minSelections || 0;
    return count >= minRequired && count <= (group.maxSelections || 10);
  };

  const isAllValid = applicableGroups.every(isGroupValid);

  const flatSelectedOptions = Object.values(selections).flat();
  const totalModifierPrice = flatSelectedOptions.reduce(
    (sum, opt) => sum + opt.price,
    0,
  );
  const totalPrice = item.price + totalModifierPrice;

  const handleSave = () => {
    if (isAllValid) {
      onSubmit(flatSelectedOptions, notes.trim() ? notes.trim() : undefined);
    }
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-foreground text-xl font-black">
              {item.name}
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Base Price:{" "}
              <span className="text-accent font-bold">
                ${item.price.toFixed(2)}
              </span>
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

        <CardContent className="flex-1 space-y-6 overflow-y-auto p-6">
          {applicableGroups.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              No modifier choices available for this item.
            </div>
          ) : (
            applicableGroups.map((group) => {
              const groupSelections = selections[group.id] || [];
              const isValid = isGroupValid(group);
              const isSingleChoice = group.maxSelections === 1;

              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-foreground text-sm font-bold">
                        {group.name}
                      </h4>
                      <p className="text-muted-foreground text-[11px]">
                        {group.required
                          ? `Required: Select ${
                              group.minSelections > 1
                                ? group.minSelections
                                : isSingleChoice
                                  ? "1"
                                  : `at least ${group.minSelections || 1}`
                            }`
                          : `Optional (Max ${group.maxSelections})`}
                      </p>
                    </div>

                    {group.required && !isValid && (
                      <span className="text-destructive bg-destructive/10 border-destructive/20 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase">
                        <AlertCircle className="h-3 w-3" />
                        Required
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {group.options.map((option) => {
                      const isSelected = groupSelections.some(
                        (opt) => opt.id === option.id,
                      );
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleOptionToggle(group, option)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/15 text-primary shadow-sm"
                              : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80 text-foreground",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center border transition-all",
                                isSingleChoice ? "rounded-full" : "rounded-md",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/50",
                              )}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 stroke-[3px]" />
                              )}
                            </div>
                            <span className="text-xs font-semibold">
                              {option.name}
                            </span>
                          </div>
                          {option.price > 0 && (
                            <span className="text-accent text-xs font-black">
                              +${option.price.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Optional Special Instructions / Notes */}
          <div className="space-y-1.5 border-t border-white/5 pt-4">
            <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Special Instructions / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Extra crispy, dressing on side..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-foreground placeholder:text-muted-foreground/50 focus:ring-primary w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs focus:ring-2 focus:outline-none"
            />
          </div>
        </CardContent>

        <CardFooter className="border-border/50 bg-card/40 flex flex-col items-stretch justify-between gap-4 border-t p-5 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] leading-none font-bold tracking-wider uppercase">
              Total Item Price
            </span>
            <span className="text-accent mt-1 text-2xl font-black">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant={isAllValid ? "gradient" : "outline"}
              className="flex-1 font-black sm:flex-none"
              disabled={!isAllValid}
              onClick={handleSave}
            >
              Add to Ticket
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
POSModifiersModal.displayName = "POSModifiersModal";
