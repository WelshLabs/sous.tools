"use client";

import { PlusCircle, MessageSquare } from "lucide-react";

export interface ConversationItem {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt?: string;
}

export interface ConversationHistoryViewProps {
  conversations: ConversationItem[];
  activeId?: string;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function ConversationHistoryView({
  conversations,
  activeId,
  isLoading = false,
  onSelect,
  onNewChat,
}: ConversationHistoryViewProps) {
  return (
    <aside
      className="border-border bg-card/60 flex h-full w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r py-4 backdrop-blur-sm"
      aria-label="Conversation history"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Conversations
        </span>
        <button
          type="button"
          id="new-chat-btn"
          aria-label="Start new chat"
          onClick={onNewChat}
          className="text-primary hover:bg-primary/10 rounded-lg p-1.5 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-1 px-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-muted/40 h-10 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-8 text-center">
          <MessageSquare className="h-8 w-8 opacity-30" />
          <p className="text-xs">No conversations yet</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-0.5 px-2" role="listbox">
          {conversations.map((convo) => {
            const isActive = convo.id === activeId;
            return (
              <li key={convo.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  id={`convo-${convo.id}`}
                  onClick={() => onSelect(convo.id)}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? "bg-primary/12 text-foreground border-primary/20 border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span className="line-clamp-1 text-sm font-medium leading-snug">
                    {convo.title || "Untitled conversation"}
                  </span>
                  <div className="flex w-full items-center justify-between gap-1">
                    {convo.lastMessage && (
                      <span className="text-muted-foreground/70 line-clamp-1 flex-1 text-[10px]">
                        {convo.lastMessage}
                      </span>
                    )}
                    <span className="text-muted-foreground/50 shrink-0 text-[10px]">
                      {timeAgo(convo.updatedAt)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
