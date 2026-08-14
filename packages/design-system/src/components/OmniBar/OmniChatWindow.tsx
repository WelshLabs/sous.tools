import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { OmniMessage } from "@soustools/api-types";
import { UnifiedReviewPanel } from "./UnifiedReviewPanel";
import { useOmniActions } from "./use-omni-actions.hook";
import { api } from "@soustools/api-client";
import Link from "next/link";
import {
  ActivityIndicator,
  EventIcon,
  MetricEventCard,
  type OmniMetric,
} from "./OmniChatAtoms";

export type { OmniMetric } from "./OmniChatAtoms";

export interface OmniChatWindowProps {
  chatHistory: OmniMessage[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onClearHistory: () => void;
}

export function OmniChatWindow({
  chatHistory,
  scrollRef,
  onClearHistory,
}: OmniChatWindowProps) {
  const [masterIngredients, setMasterIngredients] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // NOTE: pre-existing Container/View violation — do not move without a
  // dedicated container extraction task.
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await api.GET("/items", {
          params: { query: { search: "" } },
        });
        if (error) throw new Error(String(error));
        if (data && data.data) {
          const items = data.data as Array<{ id: string; name: string }>;
          setMasterIngredients(items.map((d) => ({ id: d.id, name: d.name })));
        }
      } catch (err) {
        console.error("Failed to load items in OmniChatWindow", err);
      }
    };
    fetchItems();
  }, []);

  const {
    handleConfirmAlias,
    handleUpdateIngredient,
    handleUpdateInvoiceItem,
    handleSaveInvoice,
    handleSaveRecipe,
  } = useOmniActions();

  if (chatHistory.length === 0) return null;

  return (
    <section
      aria-label="Conversation with sous chef"
      className="pointer-events-auto relative w-full"
    >
      {/* ── Header + clear ── */}
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[.2em] uppercase">
          Sous chef
        </p>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors"
          aria-label="Clear conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* ── Scrollable timeline ── */}
      <div
        ref={scrollRef}
        className="[&::-webkit-scrollbar-thumb]:bg-accent/50 hover:[&::-webkit-scrollbar-thumb]:bg-accent/70 flex max-h-[min(62vh,520px)] flex-col gap-3 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent_0,black_6%,black_100%)] px-1 pb-4 transition-colors [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <AnimatePresence initial={false}>
          {chatHistory.map((msg, index) => {
            const isUser = msg.role === "user";
            const isAgentStep = msg.role === "agent_step";
            const metrics = (
              msg as OmniMessage & { metricsData?: OmniMetric[] }
            ).metricsData;

            if (metrics && metrics.length > 0) {
              return (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MetricEventCard metrics={metrics} />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
              >
                <EventIcon role={msg.role} />

                <div
                  className={`flex w-fit min-w-0 flex-col gap-1.5 ${msg.recipeData || msg.invoiceData ? "max-w-none" : "max-w-[85%]"}`}
                >
                  {isAgentStep ? (
                    <div className="text-muted-foreground border-border/70 bg-muted/45 flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs">
                      {msg.isLoading !== false && <ActivityIndicator />}
                      {msg.content}
                    </div>
                  ) : msg.recipeData || msg.invoiceData ? (
                    <UnifiedReviewPanel
                      payload={msg.recipeData || msg.invoiceData}
                      masterIngredients={masterIngredients}
                      onConfirmAlias={(raw, id) => handleConfirmAlias(raw, id)}
                      onUpdateItem={(itemIndex, updates) => {
                        if (msg.recipeData) {
                          handleUpdateIngredient(index, itemIndex, updates);
                        } else {
                          handleUpdateInvoiceItem(index, itemIndex, updates);
                        }
                      }}
                      onSaveRecipe={handleSaveRecipe}
                      onSaveInvoice={handleSaveInvoice}
                      onItemCreated={(newItem) => {
                        setMasterIngredients((prev) => [...prev, newItem]);
                      }}
                    />
                  ) : (
                    <div
                      className={`rounded-xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        isUser
                          ? "bg-primary/[.08] border-primary/15 text-foreground rounded-tr-sm border"
                          : "bg-card/78 border-border text-foreground rounded-tl-sm border backdrop-blur-xl"
                      }`}
                    >
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex gap-3">
                          {msg.attachments.map((att: any, i: number) =>
                            att.url ? (
                              <motion.div
                                key={i}
                                layoutId={`active-task-container-${msg.id}-${i}`}
                                className="border-accent/30 shadow-glow-accent relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border"
                              >
                                <img
                                  src={att.url}
                                  alt="Attachment thumbnail"
                                  className="h-full w-full object-cover"
                                />
                              </motion.div>
                            ) : null,
                          )}
                        </div>
                      )}
                      <span>
                        {msg.content
                          .replace(/^\[\d+ attachments?\]\s*/, "")
                          .split(/(\[[^\]]+\]\([^)]+\))/g)
                          .map((part, i) => {
                            const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                            if (match) {
                              return (
                                <Link
                                  key={i}
                                  href={match[2]}
                                  className="text-accent font-medium hover:underline"
                                >
                                  {match[1]}
                                </Link>
                              );
                            }
                            return <span key={i}>{part}</span>;
                          })}
                      </span>
                      {msg.timestamp && (
                        <span className="text-muted-foreground mt-1.5 block text-[10px] tracking-[.16em] uppercase">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
