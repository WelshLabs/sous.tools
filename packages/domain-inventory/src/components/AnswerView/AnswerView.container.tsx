/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useOmnibarContext } from "@soustools/design-system";
import { api } from "@soustools/api-client";
import { AnswerViewView } from "./AnswerView.view";

export interface AnswerViewContainerProps {
  initialQuery?: string;
  initialReviewId?: string;
}

export function AnswerViewContainer({
  initialQuery = "",
  initialReviewId,
}: AnswerViewContainerProps) {
  const { chatHistory, setChatHistory, isProcessing, setIsProcessing, socket } =
    useOmnibarContext();

  const [prepListItems, setPrepListItems] = useState<
    Array<{ id: string; text: string; done: boolean }>
  >([
    { id: "1", text: "Dice 10lbs yellow onions for soup base", done: false },
    { id: "2", text: "Trim & portion ribeye loins (12oz steaks)", done: false },
    { id: "3", text: "Simmer beef bone broth (8 hours low heat)", done: true },
    { id: "4", text: "Grate Gruyère cheese for crock topping", done: false },
  ]);

  const [realRevenueData, setRealRevenueData] = useState<
    Array<{ name: string; value: number }>
  >([
    { name: "Mon", value: 193 },
    { name: "Tue", value: 213 },
    { name: "Wed", value: 130 },
    { name: "Thu", value: 172 },
    { name: "Fri", value: 54 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
  ]);
  const [realTicketTimeData, setRealTicketTimeData] = useState<
    Array<{ time: string; minutes: number }>
  >([]);

  // Fetch real dashboard metrics
  useEffect(() => {
    api
      .GET("/dashboard/stats" as any, {
        params: {
          query: { orgId: "d0000000-0000-0000-0000-000000000000" },
        } as any,
      })
      .then(({ data }: any) => {
        if (data?.revenue && Array.isArray(data.revenue)) {
          setRealRevenueData(data.revenue);
        }
        if (data?.ticketTimes && Array.isArray(data.ticketTimes)) {
          setRealTicketTimeData(data.ticketTimes);
        }
      })
      .catch((err: any) =>
        console.error("Failed to fetch real dashboard metrics:", err),
      );
  }, []);

  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  // Fetch chat history from DB on load
  useEffect(() => {
    if (initialReviewId) {
      api
        .GET(`/commands/conversations/${initialReviewId}/messages` as any, {})
        .then(({ data }: any) => {
          const messages = data?.data || data;
          if (messages && Array.isArray(messages) && messages.length > 0) {
            setChatHistory(messages);
          }
        })
        .catch((err: any) =>
          console.error("Failed to fetch chat history:", err),
        )
        .finally(() => setHasFetchedHistory(true));
    } else {
      setHasFetchedHistory(true);
    }
  }, [initialReviewId, setChatHistory]);

  // Handle URL query prompt when visiting /home?chat=...&prompt=... directly
  useEffect(() => {
    if (!hasFetchedHistory) return;
    if (initialQuery && initialQuery.trim().length > 0) {
      const hasUserMsg = chatHistory.some(
        (m) => m.role === "user" && m.content.includes(initialQuery),
      );
      if (!hasUserMsg) {
        setIsProcessing(true);
        const newMsg = {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: initialQuery,
          timestamp: new Date(),
        };

        if (socket && socket.connected) {
          socket.emit("executeCommand", {
            chatHistory: [...chatHistory, newMsg],
            source: "omnibar",
            path: "/home",
            context: { conversationId: initialReviewId },
          });
        } else {
          api
            .POST("/commands/execute" as any, {
              body: {
                command: initialQuery,
                history: [...chatHistory, newMsg],
              } as any,
            })
            .then(({ data }: any) => {
              setIsProcessing(false);
              if (data?.response) {
                setChatHistory([
                  ...chatHistory,
                  newMsg,
                  {
                    id: crypto.randomUUID(),
                    role: "model" as const,
                    content: data.response,
                    timestamp: new Date(),
                  },
                ]);
              }
            })
            .catch((err: any) => {
              console.error("Failed to execute answer query:", err);
              setIsProcessing(false);
            });
        }
      }
    }
  }, [initialQuery, hasFetchedHistory]);

  // Auto-scroll the page
  useEffect(() => {
    const main = document.getElementById("workspace-main");
    if (main) {
      setTimeout(() => {
        main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
      }, 50);
    }
  }, [chatHistory.length, isProcessing]);

  const latestUserMessage = useMemo(() => {
    const userMsgs = chatHistory.filter((m) => m.role === "user");
    return userMsgs[userMsgs.length - 1]?.content || initialQuery;
  }, [chatHistory, initialQuery]);

  const componentDirective = useMemo(() => {
    const renderMsg = chatHistory.find(
      (m) => m.role === ("render_component" as any),
    );
    if (renderMsg?.content) {
      try {
        return JSON.parse(renderMsg.content);
      } catch {
        // no-op
      }
    }
    return null;
  }, [chatHistory]);

  const track2Type = useMemo(() => {
    if (componentDirective?.componentName) {
      return componentDirective.componentName;
    }
    const q = (latestUserMessage || "").toLowerCase().trim();
    if (!q) return null;
    if (q.includes("revenue") || q.includes("sales") || q.includes("chart"))
      return "REVENUE_CHART";
    if (q.includes("ticket") || q.includes("time") || q.includes("throttle"))
      return "TICKET_TIME_CHART";
    if (q.includes("prep") || q.includes("task") || q.includes("todo"))
      return "PREP_LIST";
    if (q.includes("search") || q.includes("find") || q.includes("google"))
      return "SEARCH_RESULTS";
    if (q.includes("item") || q.includes("inventory") || q.includes("supplier"))
      return "INGREDIENT_TABLE";
    return null;
  }, [initialReviewId, componentDirective, latestUserMessage]);

  const handleTogglePrepItem = (id: string) => {
    setPrepListItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  return (
    <AnswerViewView
      chatHistory={chatHistory}
      isProcessing={isProcessing}
      track2Type={track2Type}
      realRevenueData={realRevenueData}
      realTicketTimeData={realTicketTimeData}
      prepListItems={prepListItems}
      onTogglePrepItem={handleTogglePrepItem}
    />
  );
}
