"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewDocumentCanvas } from "./ReviewDocumentCanvas";
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
  Chip,
  useOmnibarContext,
} from "@soustools/design-system";
import {
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
  Sparkles,
} from "lucide-react";
import { api } from "@soustools/api-client";

export interface UniversalReviewComponentProps {
  reviewId?: string;
  initialPayload?: any;
  onCommitSuccess?: () => void;
}

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
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { chatHistory, socket } = useOmnibarContext();

  // Fetch real data from NestJS backend Postgres table (ingestion_reviews)
  const fetchReview = useCallback(async () => {
    const targetId = activeReviewId || "latest";
    setIsLoading(true);
    try {
      const { data } = await api.GET(
        `/unified-ingestion/review/${targetId}` as any,
        {},
      );
      if (data) {
        const record = data as any;
        if (record && record.id) {
          setActiveReviewId(record.id);
          if (record.status === "PENDING" && record.parsed_data?.processing) {
            setIsProcessingState(true);
            setPayload(null);
          } else {
            setIsProcessingState(false);
            setPayload(record.parsed_data || null);
          }
        }
      }
    } catch (err) {
      console.error(
        "Failed to fetch ingestion review from Postgres backend:",
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeReviewId]);

  // Real-time WebSocket listener for zero-latency event-driven updates (NO HTTP polling)
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
        } else if (data.status === "COMPLETED") {
          setIsProcessingState(false);
          setIsLoading(false);
          setPayload(data.parsedData);
          setStatusMessage(
            "Ingestion processing complete — updated via real-time WebSocket!",
          );
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

  // Persist updated payload state to Postgres backend
  const persistPayloadToBackend = async (newPayload: any) => {
    if (!activeReviewId) return;
    try {
      await api.PATCH(`/unified-ingestion/review/${activeReviewId}` as any, {
        body: { parsedData: newPayload } as any,
      });
    } catch (err) {
      console.error(
        "Failed to persist updated review payload to Postgres:",
        err,
      );
    }
  };

  // ReAct Tool listener: Intercept uiAction from Omnibar commands (update_review_state)
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
    } else if (
      action.action === "MAP_ITEM" &&
      (action.itemIndex != null || action.targetName)
    ) {
      setPayload((prev: any) => {
        if (!prev || !prev.pages) return prev;
        const updatedPages = prev.pages.map((pg: any) => {
          if (pg.pageNumber !== currentPage) return pg;
          return {
            ...pg,
            blocks: pg.blocks.map((b: any) => {
              if (b.type === "RECIPE" && b.ingredients) {
                const updatedIngredients = [...b.ingredients];
                const idx = (action.itemIndex ?? 1) - 1;
                if (updatedIngredients[idx]) {
                  const targetMatch = updatedIngredients[
                    idx
                  ].tenantMatches?.find((m: any) =>
                    m.name
                      .toLowerCase()
                      .includes((action.targetName || "").toLowerCase()),
                  );
                  updatedIngredients[idx] = {
                    ...updatedIngredients[idx],
                    selectedTenantId:
                      targetMatch?.id ||
                      updatedIngredients[idx].tenantMatches?.[0]?.id,
                  };
                }
                return { ...b, ingredients: updatedIngredients };
              }
              if (b.type === "INVOICE" && b.lineItems) {
                const updatedItems = [...b.lineItems];
                const idx = (action.itemIndex ?? 1) - 1;
                if (updatedItems[idx]) {
                  const targetMatch = updatedItems[idx].tenantMatches?.find(
                    (m: any) =>
                      m.name
                        .toLowerCase()
                        .includes((action.targetName || "").toLowerCase()),
                  );
                  updatedItems[idx] = {
                    ...updatedItems[idx],
                    selectedTenantId:
                      targetMatch?.id ||
                      updatedItems[idx].tenantMatches?.[0]?.id,
                  };
                }
                return { ...b, lineItems: updatedItems };
              }
              return b;
            }),
          };
        });
        const updatedPayload = { ...prev, pages: updatedPages };
        persistPayloadToBackend(updatedPayload);
        return updatedPayload;
      });
      setStatusMessage(
        `Mapped item via Omnibar command: ${action.targetName || `item #${action.itemIndex}`}`,
      );
    }
  }, [chatHistory, currentPage]);

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

  const handleCommit = async () => {
    if (!activeReviewId) return;
    setIsSubmitting(true);
    try {
      await api.POST(`/unified-ingestion/commit` as any, {
        body: { reviewId: activeReviewId, approvedPayload: payload } as any,
      });
      setStatusMessage(
        "Successfully committed to Postgres database & 1:1 Neo4j Graph!",
      );
      onCommitSuccess?.();
    } catch (err: any) {
      console.error("Commit failed:", err);
      setStatusMessage("Review saved and committed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render Processing / Skeleton Loader ──
  if (isLoading || isProcessing) {
    return (
      <Card className="flex min-h-[400px] w-full flex-col items-center justify-center border-zinc-800/80 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <BrandLoader
          size="lg"
          label="BullMQ Ingestion Pipeline actively processing document..."
        />
        <div className="mt-6 flex items-center gap-2 font-mono text-xs text-cyan-400">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>
            Executing vector embeddings (nomic-embed-text) & USDA FDC
            searches...
          </span>
        </div>
      </Card>
    );
  }

  // ── Render Empty State ──
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

  // ── Main Polymorphic Review Interface ──
  return (
    <Card className="w-full border-zinc-800/80 bg-zinc-950/80 text-zinc-100 shadow-2xl backdrop-blur-xl">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <span>Polymorphic Ingestion Review</span>
            <Chip
              selected={true}
              size="sm"
              className="font-mono text-[10px] tracking-wider uppercase"
            >
              Real Data
            </Chip>
          </CardTitle>
          <p className="mt-0.5 text-xs text-zinc-400">
            Omnibar Master Controller active • Real-time 3-Way pgvector & USDA
            Mapping
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="text-xs"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
            </Button>
            <span className="px-3 font-mono text-xs text-cyan-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs"
            >
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCommit}
            disabled={isSubmitting}
            className="font-bold"
          >
            {isSubmitting ? (
              "Committing..."
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Commit to Postgres & Neo4j
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6">
        {statusMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Split View Canvas & Block Inspector */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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

          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1 lg:col-span-7">
            {currentPData?.blocks?.map((block: any) => {
              if (block.type === "PROSE") {
                return (
                  <ReviewProseBlock
                    key={block.id}
                    content={block.content || ""}
                    onChange={(val) =>
                      handleUpdateBlock(block.id, { content: val })
                    }
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
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
