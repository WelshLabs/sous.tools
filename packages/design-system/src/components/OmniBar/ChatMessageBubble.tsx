/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Sparkles, User, Bot, Loader2 } from "lucide-react";
import { type OmniMessage } from "@soustools/api-types";
import { MarkdownMessageContent } from "./MarkdownContent";

export interface ChatMessageBubbleProps {
  message: OmniMessage;
  isLastMessage?: boolean;
}

function formatTimestamp(ts: Date | string | undefined): string {
  if (!ts) return "";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessageBubble({
  message,
  isLastMessage = false,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const isAgentStep = message.role === "agent_step";
  const isRenderComponent = message.role === ("render_component" as any);

  if (isRenderComponent) return null; // Handled by the parent transcript layer

  return (
    <div
      className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          isUser
            ? "border-secondary/30 bg-secondary/10 text-secondary"
            : isAgentStep
              ? "border-border bg-muted text-muted-foreground"
              : "border-primary/30 bg-primary/10 text-primary"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isAgentStep ? (
          <Loader2 className="h-4 w-4 animate-spin" />
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
              ? "bg-secondary/25 text-foreground border-secondary/30 border rounded-tr-xs"
              : isAgentStep
                ? "bg-muted/50 text-muted-foreground border-border border rounded-tl-xs font-mono text-xs"
                : "bg-card/90 text-foreground border-border border rounded-tl-xs backdrop-blur-md"
          }`}
          style={{
            boxShadow: isUser
              ? "0 1px 8px rgb(var(--ds-neon-primary-rgb) / 0.08)"
              : "0 2px 12px rgb(0 0 0 / 0.2)",
          }}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.attachments.map((att: any, i: number) =>
                att.url ? (
                  <img
                    key={i}
                    src={att.url}
                    alt="Attachment"
                    className="border-border h-20 w-20 rounded-lg border object-cover shadow-sm"
                  />
                ) : null,
              )}
            </div>
          )}

          {isUser ? (
            <p className="m-0 whitespace-pre-wrap font-sans text-sm">
              {message.content.replace(/^\[\d+ attachments?\]\s*/, "")}
            </p>
          ) : isAgentStep ? (
            <p className="m-0 font-mono text-xs">
              {message.content}
            </p>
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
      <div className="border-border bg-card text-primary rounded-2xl rounded-tl-xs border px-4 py-3 text-sm font-mono shadow-sm">
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
