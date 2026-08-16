/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { Receipt, BookOpen } from "lucide-react";
import { UnifiedItemRow } from "./UnifiedItemRow";
import { DocumentViewer } from "./DocumentViewer";
import { type RecipeExtractionDTO } from "@soustools/api-types";

export interface UnifiedLineItem {
  rawName: string;
  suggestedInternalName?: string | null;
  category:
    "INGREDIENT" | "PACKAGING" | "CLEANING" | "SMALLWARES" | "FEE" | "OTHER";
  amount: number;
  unit: string;
  price: number;
  itemId?: string | null;
  confidence?: number | null;
  isNonInventoryExpense?: boolean;
  boundingBox?: number[] | null;
  /** USDA FDC id — present when the tenant item has a verified USDA link */
  usdaFdcId?: number | null;
  /** Canonical USDA food name for display in the Double Match UI */
  usdaName?: string | null;
  /** True when the normalization waterfall resolved a USDA link on this call
   *  and the UI must present the second (USDA) confirmation step */
  needsUsdaVerification?: boolean;
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
    return lineItems.some(
      (item) => !item.itemId && !item.isNonInventoryExpense,
    );
  }, [lineItems]);

  const handleSave = () => {
    if (isInvoice) {
      onSaveInvoice?.({
        vendorName:
          payload.vendorName ||
          (extractedMetadata?.vendorName as string) ||
          "Unknown Vendor",
        invoiceNumber:
          payload.invoiceNumber ||
          (extractedMetadata?.invoiceNumber as string) ||
          "",
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
        recipeName:
          payload.recipeName ||
          (extractedMetadata?.recipeName as string) ||
          "Untitled Recipe",
        yieldAmount:
          payload.yieldAmount ||
          (extractedMetadata?.yieldAmount as number) ||
          1,
        yieldUnit:
          payload.yieldUnit ||
          (extractedMetadata?.yieldUnit as string) ||
          "EACH",
        prepTimeMinutes:
          payload.prepTimeMinutes ||
          (extractedMetadata?.prepTimeMinutes as number) ||
          0,
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
    <div className="grid max-h-[80vh] w-full grid-cols-1 gap-6 overflow-y-auto pr-1 text-left lg:grid-cols-2">
      {/* Left Pane: Zoomable Document Viewer */}
      <DocumentViewer
        sourceUrl={sourceUrl}
        lineItems={lineItems}
        hoveredIndex={hoveredIndex}
      />

      {/* Right Pane: Mapping Rows and Details */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest text-cyan-400 uppercase">
              {isInvoice ? (
                <Receipt className="h-3.5 w-3.5" />
              ) : (
                <BookOpen className="h-3.5 w-3.5" />
              )}
              {isInvoice ? "Extracted Invoice" : "Extracted Recipe"}
            </span>
            <h2 className="text-foreground mt-0.5 text-lg font-bold">
              {isInvoice
                ? payload.vendorName ||
                  (extractedMetadata?.vendorName as string) ||
                  "Unknown Vendor"
                : payload.recipeName ||
                  (extractedMetadata?.recipeName as string) ||
                  "Untitled Recipe"}
            </h2>
          </div>
        </div>

        {/* Metadata strip — peripheral fields outside the line-items loop */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
          {isInvoice ? (
            <>
              {(() => {
                const invNum =
                  payload.invoiceNumber ||
                  (extractedMetadata?.invoiceNumber as string) ||
                  ((
                    extractedMetadata?.invoice_metadata as Record<
                      string,
                      unknown
                    >
                  )?.invoice_number as string);
                return invNum ? (
                  <span className="text-[11px] text-zinc-400">
                    <span className="mr-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
                      Invoice #
                    </span>
                    <span className="text-foreground font-semibold">
                      {invNum}
                    </span>
                  </span>
                ) : null;
              })()}
              {(() => {
                const dateStr =
                  (extractedMetadata?.date as string) ||
                  ((
                    extractedMetadata?.invoice_metadata as Record<
                      string,
                      unknown
                    >
                  )?.date as string);
                return dateStr ? (
                  <span className="text-[11px] text-zinc-400">
                    <span className="mr-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
                      Date
                    </span>
                    <span className="text-foreground font-semibold">
                      {dateStr}
                    </span>
                  </span>
                ) : null;
              })()}
              {(() => {
                const total = (
                  extractedMetadata?.financials as Record<string, unknown>
                )?.invoice_total as number | undefined;
                return total != null ? (
                  <span className="text-[11px] text-zinc-400">
                    <span className="mr-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
                      Total
                    </span>
                    <span className="text-foreground font-semibold">
                      ${total.toFixed(2)}
                    </span>
                  </span>
                ) : null;
              })()}
            </>
          ) : (
            <>
              {(payload.yieldAmount ||
                (extractedMetadata?.yieldAmount as number)) && (
                <span className="text-[11px] text-zinc-400">
                  <span className="mr-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
                    Yield
                  </span>
                  <span className="text-foreground font-semibold">
                    {payload.yieldAmount ||
                      (extractedMetadata?.yieldAmount as number)}{" "}
                    {payload.yieldUnit ||
                      (extractedMetadata?.yieldUnit as string) ||
                      ""}
                  </span>
                </span>
              )}
              {(payload.prepTimeMinutes ||
                (extractedMetadata?.prepTimeMinutes as number)) && (
                <span className="text-[11px] text-zinc-400">
                  <span className="mr-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
                    Prep
                  </span>
                  <span className="text-foreground font-semibold">
                    {payload.prepTimeMinutes ||
                      (extractedMetadata?.prepTimeMinutes as number)}{" "}
                    min
                  </span>
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="border-b border-white/10 pb-1 font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
            Line Items
          </div>
          <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1">
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
                  onHoverChange={(hovered) =>
                    setHoveredIndex(hovered ? index : null)
                  }
                />
              ))
            ) : (
              <span className="text-muted-foreground text-xs italic">
                No line items extracted.
              </span>
            )}
          </div>
        </div>

        {/* Recipe Instructions Support */}
        {!isInvoice &&
          payload.instructions &&
          payload.instructions.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="border-b border-white/10 pb-1 font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                Instructions
              </div>
              <div className="flex max-h-[150px] flex-col gap-2 overflow-y-auto pr-1">
                {payload.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 font-mono text-[10px] font-bold text-cyan-400">
                      {idx + 1}
                    </span>
                    <p className="mt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={isSaveDisabled || disabled}
            onClick={handleSave}
            className="disabled:text-muted-foreground/60 w-full cursor-pointer rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all hover:bg-cyan-500 active:scale-98 disabled:cursor-not-allowed disabled:bg-cyan-400/20 disabled:opacity-50 dark:text-white dark:disabled:bg-cyan-950/20"
          >
            {isInvoice ? "Confirm & Commit Invoice" : "Confirm & Save Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
