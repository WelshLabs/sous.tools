/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect } from "react";
import { type OmniMessage } from "@soustools/api-types";
import {
  ChatMessageBubble,
  ProcessingBubble,
  EmptyStateBubble,
} from "./ChatMessageBubble";

export interface OmniTranscriptTimelineProps {
  messages: OmniMessage[];
  isProcessing?: boolean;
  /** Slot for inline component directives (e.g. INGESTION_REVIEW card) keyed by message id */
  renderComponentDirective?: (message: OmniMessage) => React.ReactNode;
  className?: string;
}

export function OmniTranscriptTimeline({
  messages,
  isProcessing = false,
  renderComponentDirective,
  className = "",
}: OmniTranscriptTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isProcessing]);

  const visibleMessages = messages.filter(
    (m) =>
      m.role === "user" ||
      m.role === "model" ||
      m.role === "agent_step" ||
      m.role === ("render_component" as any),
  );

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {visibleMessages.length === 0 && !isProcessing ? (
        <EmptyStateBubble />
      ) : (
        visibleMessages.map((m, idx) => {
          const isLast = idx === visibleMessages.length - 1;

          if (m.role === ("render_component" as any)) {
            if (renderComponentDirective) {
              const node = renderComponentDirective(m);
              if (node) {
                return (
                  <div key={m.id} className="mt-2">
                    {node}
                  </div>
                );
              }
            }
            return null;
          }

          return (
            <div key={m.id} className="group">
              <ChatMessageBubble message={m} isLastMessage={isLast} />
            </div>
          );
        })
      )}

      {isProcessing && <ProcessingBubble />}

      {/* Sentinel for auto-scroll */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
