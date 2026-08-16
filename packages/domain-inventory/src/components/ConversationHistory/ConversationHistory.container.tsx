/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@soustools/api-client";
import {
  ConversationHistoryView,
  type ConversationItem,
} from "./ConversationHistory.view";

export interface ConversationHistoryContainerProps {
  activeId?: string;
}

export function ConversationHistoryContainer({
  activeId,
}: ConversationHistoryContainerProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .GET("/commands/conversations" as any, {})
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
        console.error("Failed to fetch conversation history:", err),
      )
      .finally(() => setIsLoading(false));
  }, []);

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
      onSelect={handleSelect}
      onNewChat={handleNewChat}
    />
  );
}
