"use client";

import React, { useMemo, useState } from "react";
import { Receipt, BookOpen } from "lucide-react";
import { UnifiedItemRow } from "./UnifiedItemRow";
import { DocumentViewer } from "./DocumentViewer";
import { type RecipeExtractionDTO } from "@soustools/api-types";

export interface UnifiedLineItem {
  rawName: string;
  suggestedInternalName?: string | null;
  category: "INGREDIENT" | "PACKAGING" | "CLEANING" | "SMALLWARES" | "FEE" | "OTHER";
  amount: number;
  unit: string;
  price: number;
  itemId?: string | null;
  confidence?: number | null;
  isNonInventoryExpense?: boolean;
  boundingBox?: number[] | null;
  suggestions?: Array<{
    itemId: string;
    name: string;
    similarity: number;
    matchColor: "green" | "yellow" | "orange";
  }>;
  [key: string]: unknown;
}

export interface UnifiedReviewPanelProps {
  payload: {
    documentType: "INVOICE" | "RECIPE" | "OTHER";
    lineItems: UnifiedLineItem[];
    extractedMetadata: Record<string, unknown>;
    vendorName?: string;
    invoiceNumber?: string;
    recipeName?: string;
    yieldAmount?: number;
    yieldUnit?: string;
    prepTimeMinutes?: number;
    instructions?: string[];
  };
  masterIngredients: Array<{ id: string; name: string }>;
  disabled?: boolean;
  onConfirmAlias?: (rawString: string, masterId: string) => void;
  onUpdateItem?: (index: number, updates: Partial<UnifiedLineItem>) => void;
  onSaveInvoice?: (payload: {
    vendorName: string;
    invoiceNumber?: string;
    items: Array<{
      rawName: string;
      itemId?: string | null;
      quantity?: number;
      pricePerUnit?: number;
      each_weight_g?: number | null;
    }>;
  }) => void;
  onSaveRecipe?: (payload: RecipeExtractionDTO) => void;
  onItemCreated?: (newItem: { id: string; name: string }) => void;
}

export function UnifiedReviewPanel({
  payload,
  masterIngredients,
  disabled = false,
  onConfirmAlias,
  onUpdateItem,
  onSaveInvoice,
  onSaveRecipe,
  onItemCreated,
}: UnifiedReviewPanelProps) {
  const { documentType, lineItems, extractedMetadata } = payload;
  const isInvoice = documentType === "INVOICE";
  const sourceUrl = extractedMetadata?.sourceUrl as string | undefined;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isSaveDisabled = useMemo(() => {
    if (!lineItems || lineItems.length === 0) return true;
    return lineItems.some((item) => !item.itemId && !item.isNonInventoryExpense);
  }, [lineItems]);

  const handleSave = () => {
    if (isInvoice) {
      onSaveInvoice?.({
        vendorName: payload.vendorName || (extractedMetadata?.vendorName as string) || "Unknown Vendor",
        invoiceNumber: payload.invoiceNumber || (extractedMetadata?.invoiceNumber as string) || "",
        items: lineItems.map((li) => ({
          rawName: li.rawName,
          itemId: li.itemId || null,
          quantity: li.amount,
          pricePerUnit: li.price,
          each_weight_g: (li.each_weight_g as number) || null,
        })),
      });
    } else {
      onSaveRecipe?.({
        recipeName: payload.recipeName || (extractedMetadata?.recipeName as string) || "Untitled Recipe",
        yieldAmount: payload.yieldAmount || (extractedMetadata?.yieldAmount as number) || 1,
        yieldUnit: payload.yieldUnit || (extractedMetadata?.yieldUnit as string) || "EACH",
        prepTimeMinutes: payload.prepTimeMinutes || (extractedMetadata?.prepTimeMinutes as number) || 0,
        instructions: payload.instructions || [],
        ingredients: lineItems.map((li) => ({
          rawString: li.rawName,
          baseIngredient: li.suggestedInternalName || li.rawName,
          quantity: li.amount,
          unit: li.unit || "EACH",
          itemId: li.itemId || null,
          confidence: li.confidence || 1.0,
          preparationNote: (li.preparationNote as string) || "",
        })),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full text-left max-h-[80vh] overflow-y-auto pr-1">
      {/* Left Pane: Zoomable Document Viewer */}
      <DocumentViewer sourceUrl={sourceUrl} lineItems={lineItems} hoveredIndex={hoveredIndex} />

      {/* Right Pane: Mapping Rows and Details */}
      <div className="flex flex-col gap-4">
        <div className="backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
              {isInvoice ? <Receipt className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              {isInvoice ? "Extracted Invoice" : "Extracted Recipe"}
            </span>
            <h2 className="text-lg font-bold text-foreground mt-0.5">
              {isInvoice
                ? payload.vendorName || (extractedMetadata?.vendorName as string) || "Unknown Vendor"
                : payload.recipeName || (extractedMetadata?.recipeName as string) || "Untitled Recipe"}
            </h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono border-b border-white/10 pb-1">Line Items</div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1">
            {lineItems && lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <UnifiedItemRow
                  key={index}
                  item={item}
                  index={index}
                  disabled={disabled}
                  masterIngredients={masterIngredients}
                  onConfirmAlias={onConfirmAlias}
                  onUpdateItem={onUpdateItem}
                  onItemCreated={onItemCreated}
                  isHovered={hoveredIndex === index}
                  onHoverChange={(hovered) => setHoveredIndex(hovered ? index : null)}
                />
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No line items extracted.</span>
            )}
          </div>
        </div>

        {/* Recipe Instructions Support */}
        {!isInvoice && payload.instructions && payload.instructions.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono border-b border-white/10 pb-1">Instructions</div>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
              {payload.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start text-xs text-muted-foreground leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 flex items-center justify-center flex-shrink-0 font-mono mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            type="button"
            disabled={isSaveDisabled || disabled}
            onClick={handleSave}
            className="w-full px-6 py-3 font-semibold text-sm rounded-xl text-zinc-950 dark:text-white bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:bg-cyan-400/20 disabled:text-muted-foreground/60 dark:disabled:bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer disabled:cursor-not-allowed transition-all active:scale-98"
          >
            {isInvoice ? "Confirm & Commit Invoice" : "Confirm & Save Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
