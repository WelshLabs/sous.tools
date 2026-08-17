"use client";

import { useState } from "react";
import { Sparkles, User, Bot, Loader2, CheckCircle2, X, Maximize2 } from "lucide-react";
import { type OmniMessage } from "@soustools/api-types";
import { MarkdownMessageContent } from "./MarkdownContent";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessageBubbleProps {
  message: OmniMessage;
  isLastMessage?: boolean;
  isProcessing?: boolean;
}

function formatTimestamp(ts: Date | string | undefined): string {
  if (!ts) return "";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessageBubble({
  message,
  isLastMessage = false,
  isProcessing = false,
}: ChatMessageBubbleProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const isUser = message.role === "user";
  const isAgentStep = message.role === "agent_step";
  const isRenderComponent = (message.role as string) === "render_component";

  if (isRenderComponent) return null;

  const isStepActive = isAgentStep && isLastMessage && isProcessing;

  return (
    <>
      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            key="chat-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              key="chat-lightbox-panel"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative max-h-[92vh] max-w-5xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setLightboxUrl(null)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={lightboxUrl}
                alt="Attachment full view"
                className="block max-h-[90vh] w-auto object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
            isUser
              ? "border-secondary/30 bg-secondary/10 text-secondary"
              : isAgentStep
                ? isStepActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : isAgentStep ? (
            isStepActive ? (
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>

        {/* Bubble */}
        <div
          className={`flex max-w-[82%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              isUser
                ? "bg-secondary/25 text-foreground border-secondary/30 rounded-tr-xs border"
                : isAgentStep
                  ? isStepActive
                    ? "bg-muted/60 text-foreground border-primary/40 rounded-tl-xs border font-mono text-xs"
                    : "bg-muted/30 text-muted-foreground border-border rounded-tl-xs border font-mono text-xs"
                  : "bg-card/90 text-foreground border-border rounded-tl-xs border backdrop-blur-md"
            }`}
            style={{
              boxShadow: isUser
                ? "0 1px 8px rgb(var(--ds-neon-primary-rgb) / 0.08)"
                : "0 2px 12px rgb(0 0 0 / 0.2)",
            }}
          >
            {/* Attachments — clickable thumbnails */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {message.attachments.map(
                  (att: { url?: string }, i: number) =>
                    att.url ? (
                      <button
                        key={i}
                        type="button"
                        aria-label="View attachment full size"
                        onClick={() => setLightboxUrl(att.url!)}
                        className="group relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-700 transition hover:border-zinc-500"
                      >
                        <img
                          src={att.url}
                          alt="Attachment"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/30">
                          <Maximize2 className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      </button>
                    ) : null,
                )}
              </div>
            )}

            {isUser ? (
              <p className="m-0 font-sans text-sm whitespace-pre-wrap">
                {message.content.replace(/^\[\d+ attachments?\]\s*/, "")}
              </p>
            ) : isAgentStep ? (
              <p className="m-0 font-mono text-xs">{message.content}</p>
            ) : (
              <MarkdownMessageContent content={message.content} />
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-muted-foreground/60 px-1 text-[10px] ${isLastMessage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </>
  );
}

export interface ProcessingBubbleProps {
  label?: string;
}

export function ProcessingBubble({
  label = "Heard, Chef. Systems online and processing your prompt...",
}: ProcessingBubbleProps) {
  return (
    <div className="flex w-full flex-row gap-3">
      <div className="border-primary/30 bg-primary/10 text-primary mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
        <Bot className="h-4 w-4 animate-bounce" />
      </div>
      <div className="border-border bg-card text-primary rounded-2xl rounded-tl-xs border px-4 py-3 font-mono text-sm shadow-sm">
        {label}
      </div>
    </div>
  );
}

export interface EmptyStateBubbleProps {
  message?: string;
}

export function EmptyStateBubble({
  message = "Heard, Chef. Systems are online and ready. What's the move — prepping, ordering, or digging into data?",
}: EmptyStateBubbleProps) {
  return (
    <div className="flex w-full flex-row gap-3">
      <div className="border-primary/30 bg-primary/10 text-primary mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>
      <div className="border-border bg-card text-foreground rounded-2xl rounded-tl-xs border px-4 py-3 text-sm leading-relaxed shadow-sm">
        <p className="m-0">{message}</p>
      </div>
    </div>
  );
}
