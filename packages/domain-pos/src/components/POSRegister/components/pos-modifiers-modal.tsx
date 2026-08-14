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
  const [selections, setSelections] = useState<
    Record<string, ModifierOption[]>
  >({});

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
  const totalModifierPrice = flatSelectedOptions.reduce(
    (sum, opt) => sum + opt.price,
    0,
  );
  const totalPrice = item.price + totalModifierPrice;

  const handleSave = () => {
    if (isAllValid) {
      onSubmit(flatSelectedOptions);
    }
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-lg flex-col border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-foreground text-xl font-bold">
              {item.name}
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Customize your item
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
          {groups.map((group) => {
            const groupSelections = selections[group.id] || [];
            const isValid = isGroupValid(group);

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-foreground text-sm font-semibold">
                      {group.name}
                    </h4>
                    <p className="text-muted-foreground text-[11px]">
                      {group.required
                        ? `Required (Choose ${group.minSelections}${
                            group.maxSelections > group.minSelections
                              ? `-${group.maxSelections}`
                              : ""
                          })`
                        : `Optional (Max ${group.maxSelections})`}
                    </p>
                  </div>
                  {group.required && !isValid && (
                    <span className="text-destructive bg-destructive/10 border-destructive/20 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
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
                          "flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border p-3 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80 text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center border transition-all",
                              group.maxSelections === 1
                                ? "rounded-full"
                                : "rounded-sm",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/50",
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 stroke-[3px]" />
                            )}
                          </div>
                          <span className="text-xs font-medium">
                            {option.name}
                          </span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-accent text-xs font-semibold">
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

        <CardFooter className="border-border/50 bg-card/25 flex flex-col items-stretch justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] leading-none font-bold tracking-wider uppercase">
              Total Price
            </span>
            <span className="text-accent mt-1 text-xl font-black">
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
              className="flex-1 font-bold sm:flex-none"
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
