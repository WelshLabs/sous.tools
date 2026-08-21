"use client";

import {
  PlusCircle,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
  onSelect,
  onNewChat,
}: ConversationHistoryViewProps) {
  if (isCollapsed) {
    return (
      <aside
        className="border-border bg-card/60 flex h-full w-12 shrink-0 flex-col items-center gap-3 border-r py-4 backdrop-blur-sm transition-all"
        aria-label="Conversation history (collapsed)"
      >
        {onToggleCollapse && (
          <button
            type="button"
            aria-label="Expand conversation history"
            onClick={onToggleCollapse}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer rounded-lg p-2 transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          aria-label="Start new chat"
          onClick={onNewChat}
          className="text-primary hover:bg-primary/10 cursor-pointer rounded-lg p-2 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="border-border bg-card/60 flex h-full w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r py-4 backdrop-blur-sm transition-all"
      aria-label="Conversation history"
    >
      {/* Header */}
      <div className="border-border/40 flex items-center justify-between border-b px-3 pb-2">
        <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          Conversations
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="new-chat-btn"
            aria-label="Start new chat"
            onClick={onNewChat}
            className="text-primary hover:bg-primary/10 cursor-pointer rounded-lg p-1.5 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          {onToggleCollapse && (
            <button
              type="button"
              aria-label="Collapse conversations panel"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer rounded-lg p-1.5 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-1 px-2 pt-2">
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
        <ul className="flex flex-col gap-0.5 px-2 pt-2" role="listbox">
          {conversations.map((convo) => {
            const isActive = convo.id === activeId;
            return (
              <li key={convo.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  id={`convo-${convo.id}`}
                  onClick={() => onSelect(convo.id)}
                  className={`flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? "bg-primary/15 text-foreground border-primary/30 border font-medium"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span className="line-clamp-1 text-sm leading-snug font-medium">
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
