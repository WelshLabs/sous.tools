/* eslint-disable max-lines */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ReviewProseBlock } from "./ReviewProseBlock";
import { ReviewInvoiceBlock } from "./ReviewInvoiceBlock";
import { ReviewRecipeBlock } from "./ReviewRecipeBlock";
import {
  BrandLoader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  useOmnibarContext,
} from "@soustools/design-system";
import {
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
  Sparkles,
  X,
  ExternalLink,
  ChefHat,
} from "lucide-react";
import { graphqlClient } from "@soustools/api-client";
import { motion, AnimatePresence } from "framer-motion";

export interface UniversalReviewComponentProps {
  reviewId?: string;
  initialPayload?: any;
  onCommitSuccess?: () => void;
}

const GET_INGESTION_REVIEW_QUERY = `
  query GetIngestionReview($id: String!) {
    ingestionReview(id: $id) {
      id
      source
      source_name
      source_document_url
      parsed_data
      created_at
      updated_at
    }
  }
`;

const UPDATE_INGESTION_REVIEW_MUTATION = `
  mutation UpdateIngestionReview($id: String!, $parsedData: JSON!) {
    updateIngestionReviewRecord(id: $id, parsedData: $parsedData) {
      id
      parsed_data
    }
  }
`;

const COMMIT_INGESTION_REVIEW_MUTATION = `
  mutation CommitIngestionReview($reviewId: String!, $approvedPayload: JSON!) {
    commitIngestionReview(reviewId: $reviewId, approvedPayload: $approvedPayload)
  }
`;

export function UniversalReviewComponent({
  reviewId,
  initialPayload,
  onCommitSuccess,
}: UniversalReviewComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReviewId, setActiveReviewId] = useState<string | undefined>(
    reviewId,
  );
  const [payload, setPayload] = useState<any>(initialPayload || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPayload);
  const [isProcessing, setIsProcessingState] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [committedRecipeId, setCommittedRecipeId] = useState<string | null>(
    null,
  );
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const { chatHistory, socket } = useOmnibarContext();

  const fetchReview = useCallback(async () => {
    const targetId = activeReviewId || "latest";
    setIsLoading(true);
    try {
      const res = await graphqlClient.request<{ ingestionReview: any }>(
        GET_INGESTION_REVIEW_QUERY,
        { id: targetId },
      );
      const record = res.data?.ingestionReview;
      if (record && record.id) {
        setActiveReviewId(record.id);
        const pages = record.parsed_data?.pages;
        const hasParsedPages = Array.isArray(pages) && pages.length > 0;
        if (record.parsed_data?.processing || !hasParsedPages) {
          setIsProcessingState(true);
          setPayload(null);
        } else {
          setIsProcessingState(false);
          setPayload(record.parsed_data || null);
        }
      }
    } catch (err) {
      console.error(
        "Failed to fetch ingestion review from GraphQL backend:",
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeReviewId]);

  useEffect(() => {
    if (reviewId && reviewId !== activeReviewId) {
      setActiveReviewId(reviewId);
    }
  }, [reviewId, activeReviewId]);

  useEffect(() => {
    fetchReview();
    if (!socket) return;

    const handleIngestionUpdate = (data: any) => {
      if (
        data?.reviewId &&
        (data.reviewId === activeReviewId ||
          activeReviewId === "latest" ||
          !activeReviewId)
      ) {
        if (data.reviewId) setActiveReviewId(data.reviewId);
        if (data.status === "IN_PROGRESS") {
          setIsProcessingState(true);
          if (data.message) {
            setStatusMessage(data.message);
          }
        } else if (data.status === "COMPLETED") {
          setIsProcessingState(false);
          setIsLoading(false);
          setPayload(data.parsedData);
        }
      }
    };

    socket.on("ingestion:updated", handleIngestionUpdate);
    socket.on("ingestion:complete", handleIngestionUpdate);

    return () => {
      socket.off("ingestion:updated", handleIngestionUpdate);
      socket.off("ingestion:complete", handleIngestionUpdate);
    };
  }, [socket, activeReviewId, fetchReview]);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      fetchReview();
    }, 2000);
    return () => clearInterval(interval);
  }, [isProcessing, fetchReview]);

  const persistPayloadToBackend = useCallback(
    async (newPayload: any) => {
      if (!activeReviewId) return;
      try {
        await graphqlClient.request(UPDATE_INGESTION_REVIEW_MUTATION, {
          id: activeReviewId,
          parsedData: newPayload,
        });
      } catch (err) {
        console.error(
          "Failed to persist updated review payload to GraphQL:",
          err,
        );
      }
    },
    [activeReviewId],
  );

  useEffect(() => {
    if (!chatHistory || chatHistory.length === 0) return;
    const lastMsg = chatHistory[chatHistory.length - 1] as any;
    if (!lastMsg || !lastMsg.uiAction) return;

    const action = lastMsg.uiAction;
    if (action.type !== "UPDATE_REVIEW_STATE") return;

    if (
      action.action === "TURN_PAGE" &&
      typeof action.pageNumber === "number"
    ) {
      setCurrentPage(action.pageNumber);
      setStatusMessage(
        `Navigated to page ${action.pageNumber} via Omnibar command.`,
      );
    } else if (
      action.action === "ACCEPT_ALL_PAGE" ||
      action.action === "ACCEPT_ALL"
    ) {
      setPayload((prev: any) => {
        if (!prev || !prev.pages) return prev;
        const updatedPages = prev.pages.map((pg: any) => {
          if (pg.pageNumber !== currentPage) return pg;
          return {
            ...pg,
            blocks: pg.blocks.map((b: any) => {
              if (b.type === "RECIPE" && b.ingredients) {
                return {
                  ...b,
                  ingredients: b.ingredients.map((ing: any) => ({
                    ...ing,
                    selectedTenantId:
                      ing.selectedTenantId || ing.tenantMatches?.[0]?.id,
                    selectedUsdaId:
                      ing.selectedUsdaId || ing.usdaMatches?.[0]?.fdcId,
                  })),
                };
              }
              if (b.type === "INVOICE" && b.lineItems) {
                return {
                  ...b,
                  lineItems: b.lineItems.map((item: any) => ({
                    ...item,
                    selectedTenantId:
                      item.selectedTenantId || item.tenantMatches?.[0]?.id,
                    selectedUsdaId:
                      item.selectedUsdaId || item.usdaMatches?.[0]?.fdcId,
                  })),
                };
              }
              return b;
            }),
          };
        });
        const updatedPayload = { ...prev, pages: updatedPages };
        persistPayloadToBackend(updatedPayload);
        return updatedPayload;
      });
      setStatusMessage("Accepted all top AI matches on current page.");
    }
  }, [chatHistory, currentPage, persistPayloadToBackend]);

  const pages = payload?.pages || [];
  const totalPages = Math.max(pages.length, 1);
  const currentPData =
    pages.find((p: any) => p.pageNumber === currentPage) || pages[0];

  const handleUpdateBlock = (blockId: string, updatedFields: any) => {
    setPayload((prev: any) => {
      if (!prev || !prev.pages) return prev;
      const nextPages = prev.pages.map((pg: any) =>
        pg.pageNumber === currentPage
          ? {
              ...pg,
              blocks: pg.blocks.map((b: any) =>
                b.id === blockId ? { ...b, ...updatedFields } : b,
              ),
            }
          : pg,
      );
      const newPayload = { ...prev, pages: nextPages };
      persistPayloadToBackend(newPayload);
      return newPayload;
    });
  };

  const handleExcludeBlock = (blockId: string) => {
    setPayload((prev: any) => {
      if (!prev || !prev.pages) return prev;
      const nextPages = prev.pages.map((pg: any) =>
        pg.pageNumber === currentPage
          ? {
              ...pg,
              blocks: pg.blocks.map((b: any) =>
                b.id === blockId ? { ...b, excluded: true } : b,
              ),
            }
          : pg,
      );
      const newPayload = { ...prev, pages: nextPages };
      persistPayloadToBackend(newPayload);
      return newPayload;
    });
    setStatusMessage("Excluded block from review.");
  };

  const handleCommit = async () => {
    if (!activeReviewId) return;
    setIsSubmitting(true);
    try {
      const res = await graphqlClient.request<{ commitIngestionReview: any }>(
        COMMIT_INGESTION_REVIEW_MUTATION,
        {
          reviewId: activeReviewId,
          approvedPayload: payload,
        },
      );
      const data = res.data?.commitIngestionReview;
      const rId = data?.recipeId || data?.recipeIds?.[0] || null;
      if (rId) {
        setCommittedRecipeId(rId);
      }
      setStatusMessage("Recipe and items saved successfully!");
      onCommitSuccess?.();
    } catch (err: any) {
      console.error("Commit failed:", err);
      setStatusMessage("Saved review state.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isProcessing) {
    return (
      <Card className="flex min-h-[400px] w-full flex-col items-center justify-center border-zinc-800/80 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <BrandLoader
          size="lg"
          label="BullMQ Ingestion Pipeline actively processing document..."
        />
        <div className="mt-6 flex items-center gap-2 font-mono text-xs text-cyan-400">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Executing vector embeddings & USDA FDC searches...</span>
        </div>
      </Card>
    );
  }

  if (!payload || !payload.pages || payload.pages.length === 0) {
    return (
      <Card className="flex min-h-[300px] w-full flex-col items-center justify-center border-zinc-800/80 bg-zinc-950/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <FileText className="mb-3 h-12 w-12 text-zinc-600" />
        <h3 className="mb-1 text-lg font-bold text-white">
          No Active Document Ingestion
        </h3>
        <p className="max-w-md text-xs text-zinc-400">
          Type or speak instructions into the Omnibar, or drop a document to
          begin polymorphic AI ingestion review.
        </p>
      </Card>
    );
  }

  return (
    <>
      <AnimatePresence>
        {imageModalOpen && currentPData?.imageUrl && (
          <motion.div
            key="image-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100010] flex items-center justify-center bg-black/85 backdrop-blur-md"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              key="image-modal-panel"
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative max-h-[92vh] max-w-5xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close image preview"
                onClick={() => setImageModalOpen(false)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative">
                <img
                  src={currentPData.imageUrl}
                  alt={`Document page ${currentPage}`}
                  className="block max-h-[88vh] w-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="w-full border-zinc-800/80 bg-zinc-950/80 text-zinc-100 shadow-2xl backdrop-blur-xl">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 p-4">
          <div className="flex min-w-0 items-center gap-3">
            {currentPData?.imageUrl && (
              <button
                type="button"
                aria-label="View document page full size"
                onClick={() => setImageModalOpen(true)}
                className="group relative h-10 w-7 shrink-0 cursor-pointer overflow-hidden rounded border border-zinc-700 bg-zinc-900 transition-all hover:border-zinc-500"
              >
                <img
                  src={currentPData.imageUrl}
                  alt={`Page ${currentPage} thumbnail`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                />
              </button>
            )}
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <ChefHat className="text-primary h-4 w-4 shrink-0" />
              <span>Ingestion Review</span>
            </CardTitle>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 p-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[2.5rem] text-center font-mono text-xs text-zinc-400">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="h-7 px-2 text-xs"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleCommit}
              disabled={isSubmitting}
              className="h-8 gap-1.5 font-semibold"
            >
              {isSubmitting ? (
                "Saving…"
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-0 divide-y divide-zinc-800/50 p-0">
          {statusMessage && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{statusMessage}</span>
              </div>
              {committedRecipeId && (
                <Link
                  href={`/recipes/${committedRecipeId}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/30"
                >
                  <span>View / Edit Recipe</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}

          {currentPData?.blocks?.map((block: any) => {
            if (block.excluded) return null;

            const inner = (() => {
              if (block.type === "PROSE") {
                return (
                  <ReviewProseBlock
                    key={block.id}
                    content={block.content || ""}
                    onChange={(val) =>
                      handleUpdateBlock(block.id, { content: val })
                    }
                    onExclude={() => handleExcludeBlock(block.id)}
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
                    onVendorChange={(v) =>
                      handleUpdateBlock(block.id, { vendorName: v })
                    }
                    onLineItemMappingChange={(idx, tId, uId) => {
                      const items = [...(block.lineItems || [])];
                      items[idx] = {
                        ...items[idx],
                        selectedTenantId: tId,
                        selectedUsdaId: uId,
                      };
                      handleUpdateBlock(block.id, { lineItems: items });
                    }}
                    onLineItemQuantityChange={(idx, q) => {
                      const items = [...(block.lineItems || [])];
                      items[idx] = { ...items[idx], quantity: q };
                      handleUpdateBlock(block.id, { lineItems: items });
                    }}
                    onLineItemUnitChange={(idx, u) => {
                      const items = [...(block.lineItems || [])];
                      items[idx] = { ...items[idx], unit: u };
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
                    onTitleChange={(t) =>
                      handleUpdateBlock(block.id, { title: t })
                    }
                    onYieldChange={(c, u) =>
                      handleUpdateBlock(block.id, {
                        yieldCount: c,
                        yieldUnit: u,
                      })
                    }
                    onIngredientMappingChange={(idx, tId, uId) => {
                      const ings = [...(block.ingredients || [])];
                      ings[idx] = {
                        ...ings[idx],
                        selectedTenantId: tId,
                        selectedUsdaId: uId,
                      };
                      handleUpdateBlock(block.id, { ingredients: ings });
                    }}
                    onIngredientQuantityChange={(idx, q) => {
                      const ings = [...(block.ingredients || [])];
                      ings[idx] = { ...ings[idx], quantity: q };
                      handleUpdateBlock(block.id, { ingredients: ings });
                    }}
                    onIngredientUnitChange={(idx, u) => {
                      const ings = [...(block.ingredients || [])];
                      ings[idx] = { ...ings[idx], unit: u };
                      handleUpdateBlock(block.id, { ingredients: ings });
                    }}
                  />
                );
              }
              return null;
            })();

            return inner ? (
              <div key={block.id} className="p-4 sm:p-5">
                {inner}
              </div>
            ) : null;
          })}
        </CardContent>
      </Card>
    </>
  );
}
