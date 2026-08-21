"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@soustools/api-client";
import { useOmnibarContext } from "@soustools/design-system";
import {
  ConversationHistoryView,
  type ConversationItem,
} from "./ConversationHistory.view";

export interface ConversationHistoryContainerProps {
  activeId?: string;
  defaultCollapsed?: boolean;
}

export function ConversationHistoryContainer({
  activeId,
  defaultCollapsed,
}: ConversationHistoryContainerProps) {
  const router = useRouter();
  const { socket } = useOmnibarContext();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(
    defaultCollapsed !== undefined ? defaultCollapsed : !activeId,
  );

  const fetchConversations = useCallback(() => {
    (api.GET as any)("/commands/conversations", {})
      .then(({ data }: any) => {
        const raw: any[] = data?.data || data || [];
        const mapped: ConversationItem[] = raw.map((c: any) => ({
          id: c.id,
          title: c.title || c.first_message || "Conversation",
          lastMessage: c.last_message || "",
          updatedAt: c.updated_at,
        }));
        setConversations(mapped);
      })
      .catch((err: any) =>
        console.warn("Failed to fetch conversation history:", err),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, activeId]);

  useEffect(() => {
    if (activeId) {
      setIsCollapsed(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchConversations();
    };
    socket.on("chat_message", handleUpdate);
    socket.on("ingestion:updated", handleUpdate);
    return () => {
      socket.off("chat_message", handleUpdate);
      socket.off("ingestion:updated", handleUpdate);
    };
  }, [socket, fetchConversations]);

  const handleSelect = (id: string) => {
    router.push(`/home?chat=${id}`);
  };

  const handleNewChat = () => {
    router.push("/home");
  };

  return (
    <ConversationHistoryView
      conversations={conversations}
      activeId={activeId}
      isLoading={isLoading}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      onSelect={handleSelect}
      onNewChat={handleNewChat}
    />
  );
}
