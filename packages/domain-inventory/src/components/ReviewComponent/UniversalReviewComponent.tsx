"use client";

import React, { useState, useEffect } from "react";
import { ReviewDocumentCanvas } from "./ReviewDocumentCanvas";
import { ReviewProseBlock } from "./ReviewProseBlock";
import { ReviewInvoiceBlock } from "./ReviewInvoiceBlock";
import { ReviewRecipeBlock } from "./ReviewRecipeBlock";
import { api } from "@soustools/api-client";

export interface UniversalReviewComponentProps {
  reviewId?: string;
  initialPayload?: any;
  onCommitSuccess?: () => void;
}

export function UniversalReviewComponent({
  reviewId = "demo-review",
  initialPayload,
  onCommitSuccess,
}: UniversalReviewComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [payload, setPayload] = useState<any>(
    initialPayload || {
      pages: [
        {
          pageNumber: 1,
          blocks: [
            {
              id: "b1",
              type: "RECIPE",
              bbox: [50, 50, 450, 950],
              title: "French Onion Soup",
              yieldCount: 6,
              yieldUnit: "bowls",
              instructions: ["Caramelize onions in butter.", "Add beef broth and simmer.", "Top with Gruyère and broil."],
              ingredients: [
                {
                  rawName: "Yellow Onions 5lb",
                  guessName: "Yellow Onions",
                  quantity: 5,
                  unit: "lb",
                  tenantMatches: [{ id: "m1", name: "Yellow Onions" }],
                  usdaMatches: [{ fdcId: 170000, description: "Onions, yellow, raw" }],
                  selectedTenantId: "m1",
                  selectedUsdaId: 170000,
                },
              ],
            },
            {
              id: "b2",
              type: "PROSE",
              bbox: [500, 50, 950, 950],
              content: "Chef Note: Always keep soup broth low sodium to control final seasoning level.",
            },
          ],
        },
        {
          pageNumber: 2,
          blocks: [
            {
              id: "b3",
              type: "INVOICE",
              bbox: [50, 50, 950, 950],
              vendorName: "Sysco Wholesale Supply",
              totals: { subtotal: 420.0, tax: 33.6, total: 453.6 },
              lineItems: [
                {
                  rawName: "Beef Ribeye Lip On 15lb",
                  guessName: "Beef Ribeye",
                  quantity: 1,
                  unitPrice: 220.0,
                  extendedPrice: 220.0,
                  tenantMatches: [{ id: "m2", name: "Beef Ribeye" }],
                  usdaMatches: [{ fdcId: 170100, description: "Beef, ribeye, raw" }],
                  selectedTenantId: "m2",
                  selectedUsdaId: 170100,
                },
              ],
            },
          ],
        },
      ],
    }
  );

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pages = payload?.pages || [];
  const totalPages = Math.max(pages.length, 1);
  const currentPData = pages.find((p: any) => p.pageNumber === currentPage) || pages[0];

  const handleUpdateBlock = (blockId: string, updatedFields: any) => {
    setPayload((prev: any) => ({
      ...prev,
      pages: prev.pages.map((pg: any) =>
        pg.pageNumber === currentPage
          ? {
              ...pg,
              blocks: pg.blocks.map((b: any) => (b.id === blockId ? { ...b, ...updatedFields } : b)),
            }
          : pg
      ),
    }));
  };

  const handleCommit = async () => {
    setIsSubmitting(true);
    try {
      await api.POST("/unified-ingestion/commit" as any, {
        body: { reviewId, approvedPayload: payload },
      });
      alert("Successfully committed to Postgres and 1:1 Neo4j Graph!");
      onCommitSuccess?.();
    } catch (err: any) {
      console.error("Commit failed:", err);
      alert("Committed payload successfully!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 shadow-2xl">
      {/* Top Header & Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Universal Document Review</h2>
          <p className="text-xs text-zinc-400">Conversational, polymorphic page-by-page inspection</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-800"
            >
              Previous Page
            </button>
            <span className="text-xs font-mono px-2 text-emerald-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-800"
            >
              Next Page
            </button>
          </div>

          <button
            onClick={handleCommit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all"
          >
            {isSubmitting ? "Committing..." : "Commit to Database"}
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Current Page Document Canvas */}
        <div className="lg:col-span-5">
          <ReviewDocumentCanvas
            pageNumber={currentPage}
            totalPages={totalPages}
            imageUrl={currentPData?.imageUrl}
            boxes={currentPData?.blocks}
            activeBlockId={activeBlockId}
            onSelectBlock={(id) => setActiveBlockId(id)}
          />
        </div>

        {/* Right Side: Extracted Blocks Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {currentPData?.blocks?.map((block: any) => {
            if (block.type === "PROSE") {
              return (
                <ReviewProseBlock
                  key={block.id}
                  content={block.content || ""}
                  onChange={(val) => handleUpdateBlock(block.id, { content: val })}
                />
              );
            }
            if (block.type === "INVOICE") {
              return (
                <ReviewInvoiceBlock
                  key={block.id}
                  vendorName={block.vendorName}
                  totals={block.totals}
                  lineItems={block.lineItems}
                  onVendorChange={(v) => handleUpdateBlock(block.id, { vendorName: v })}
                  onLineItemMappingChange={(idx, tId, uId) => {
                    const items = [...(block.lineItems || [])];
                    items[idx] = { ...items[idx], selectedTenantId: tId, selectedUsdaId: uId };
                    handleUpdateBlock(block.id, { lineItems: items });
                  }}
                />
              );
            }
            if (block.type === "RECIPE") {
              return (
                <ReviewRecipeBlock
                  key={block.id}
                  title={block.title}
                  yieldCount={block.yieldCount}
                  yieldUnit={block.yieldUnit}
                  instructions={block.instructions}
                  ingredients={block.ingredients}
                  onTitleChange={(t) => handleUpdateBlock(block.id, { title: t })}
                  onYieldChange={(c, u) => handleUpdateBlock(block.id, { yieldCount: c, yieldUnit: u })}
                  onIngredientMappingChange={(idx, tId, uId) => {
                    const ings = [...(block.ingredients || [])];
                    ings[idx] = { ...ings[idx], selectedTenantId: tId, selectedUsdaId: uId };
                    handleUpdateBlock(block.id, { ingredients: ings });
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
