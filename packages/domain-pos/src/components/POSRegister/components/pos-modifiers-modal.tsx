"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, cn } from "@soustools/design-system";
import { X, Check } from "lucide-react";
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
  onSubmit: (selected: ModifierOption[]) => void;
}

export function POSModifiersModal({
  isOpen,
  onClose,
  item,
  groups = [],
  onSubmit,
}: POSModifiersModalProps) {
  const [selections, setSelections] = useState<Record<string, ModifierOption[]>>({});

  useEffect(() => {
    if (isOpen) {
      setSelections({});
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleOptionToggle = (group: ModifierGroup, option: ModifierOption) => {
    const groupSelections = selections[group.id] || [];
    const isSelected = groupSelections.some((opt) => opt.id === option.id);

    if (isSelected) {
      setSelections({
        ...selections,
        [group.id]: groupSelections.filter((opt) => opt.id !== option.id),
      });
    } else {
      if (group.maxSelections === 1) {
        setSelections({
          ...selections,
          [group.id]: [option],
        });
      } else if (groupSelections.length < group.maxSelections) {
        setSelections({
          ...selections,
          [group.id]: [...groupSelections, option],
        });
      }
    }
  };

  const isGroupValid = (group: ModifierGroup) => {
    const count = (selections[group.id] || []).length;
    return count >= group.minSelections && count <= group.maxSelections;
  };

  const isAllValid = groups.every(isGroupValid);

  const flatSelectedOptions = Object.values(selections).flat();
  const totalModifierPrice = flatSelectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = item.price + totalModifierPrice;

  const handleSave = () => {
    if (isAllValid) {
      onSubmit(flatSelectedOptions);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-lg border border-border bg-card shadow-glow-sm flex flex-col max-h-[90vh]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">{item.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Customize your item</p>
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

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {groups.map((group) => {
            const groupSelections = selections[group.id] || [];
            const isValid = isGroupValid(group);

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{group.name}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {group.required
                        ? `Required (Choose ${group.minSelections}${
                            group.maxSelections > group.minSelections ? `-${group.maxSelections}` : ""
                          })`
                        : `Optional (Max ${group.maxSelections})`}
                    </p>
                  </div>
                  {group.required && !isValid && (
                    <span className="text-[10px] font-bold text-destructive px-1.5 py-0.5 rounded-sm bg-destructive/10 border border-destructive/20 uppercase tracking-wider">
                      Required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.options.map((option) => {
                    const isSelected = groupSelections.some((opt) => opt.id === option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionToggle(group, option)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-[var(--radius-sm)] border text-left transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center border transition-all",
                              group.maxSelections === 1 ? "rounded-full" : "rounded-sm",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/50"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                          </div>
                          <span className="text-xs font-medium">{option.name}</span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-xs font-semibold text-accent">
                            +${option.price.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-border/50 pt-4 bg-card/25">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
              Total Price
            </span>
            <span className="text-xl font-black text-accent mt-1">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 sm:flex-none" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={isAllValid ? "gradient" : "outline"}
              className="flex-1 sm:flex-none font-bold"
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