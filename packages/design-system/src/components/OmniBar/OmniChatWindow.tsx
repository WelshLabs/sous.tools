import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { OmniMessage } from "@soustools/api-types";
import { UnifiedReviewPanel } from "./UnifiedReviewPanel";
import { useOmniActions } from "./use-omni-actions.hook";
import { useOmnibarContext } from "./OmniBarContext";
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

  const { apiInstance } = useOmnibarContext();

  if (!apiInstance) {
    throw new Error(
      "[OmniChatWindow] apiInstance not found in context. " +
      "Pass apiInstance to OmniBarProvider from your app entry point."
    );
  }

  const api = apiInstance;

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
      className="relative w-full pointer-events-auto"
    >
      {/* ── Header + clear ── */}
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
          Sous chef
        </p>
        <button
          type="button"
          onClick={onClearHistory}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* ── Scrollable timeline ── */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 max-h-[min(62vh,520px)] overflow-y-auto px-1 pb-4
          [mask-image:linear-gradient(to_bottom,transparent_0,black_6%,black_100%)]
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-accent/50
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-accent/70
          transition-colors"
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
                  className={`min-w-0 w-fit flex flex-col gap-1.5 ${msg.recipeData || msg.invoiceData ? "max-w-none" : "max-w-[85%]"}`}
                >
                  {isAgentStep ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono rounded-xl px-3 py-1.5 border border-border/70 bg-muted/45">
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
                      className={`px-4 py-3 rounded-xl text-sm leading-6 shadow-sm ${
                        isUser
                          ? "bg-primary/[.08] border border-primary/15 text-foreground rounded-tr-sm"
                          : "bg-card/78 border border-border text-foreground rounded-tl-sm backdrop-blur-xl"
                      }`}
                    >
                      {msg.content.match(/(https?|blob|data):[^\s]+/) && (
                        <motion.div
                          layoutId={`active-task-container-${msg.id}`}
                          className="mb-2 w-48 h-32 rounded-xl overflow-hidden border border-accent/30 shadow-glow-accent relative"
                        >
                          <img src={msg.content.match(/(https?|blob|data):[^\s]+/)![0]} alt="Uploaded file" className="w-full h-full object-cover" />
                        </motion.div>
                      )}
                      <span>
                        {msg.content
                          .split(/(\[[^\]]+\]\([^)]+\))/g)
                          .map((part, i) => {
                            const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                            if (match) {
                              return (
                                <Link
                                  key={i}
                                  href={match[2]}
                                  className="text-accent hover:underline font-medium"
                                >
                                  {match[1]}
                                </Link>
                              );
                            }
                            return (
                              <span key={i}>
                                {part.replace(/(https?|blob|data):[^\s]+/, "")}
                              </span>
                            );
                          })}
                      </span>
                      {msg.timestamp && (
                        <span className="mt-1.5 block text-[10px] uppercase tracking-[.16em] text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
