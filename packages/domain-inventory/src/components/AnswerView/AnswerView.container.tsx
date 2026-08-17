"use client";

import { useState, useMemo, useEffect } from "react";
import { useOmnibarContext } from "@soustools/design-system";
import { api } from "@soustools/api-client";
import { type OmniMessage } from "@soustools/api-types";
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

  const [prepListItems, setPrepListItems] = useState([
    { id: "1", text: "Dice 10lbs yellow onions for soup base", done: false },
    { id: "2", text: "Trim & portion ribeye loins (12oz steaks)", done: false },
    { id: "3", text: "Simmer beef bone broth (8 hours low heat)", done: true },
    { id: "4", text: "Grate Gruyère cheese for crock topping", done: false },
  ]);

  const [realRevenueData, setRealRevenueData] = useState([
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

  useEffect(() => {
    (api as any)
      .GET("/dashboard/stats", {
        params: { query: { orgId: "d0000000-0000-0000-0000-000000000000" } },
      })
      .then((res: any) => {
        if (Array.isArray(res.data?.revenue))
          setRealRevenueData(res.data.revenue);
        if (Array.isArray(res.data?.ticketTimes))
          setRealTicketTimeData(res.data.ticketTimes);
      })
      .catch((err: unknown) =>
        console.error("Failed to fetch dashboard stats:", err),
      );
  }, []);

  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  useEffect(() => {
    if (!initialReviewId) {
      setHasFetchedHistory(true);
      return;
    }
    (api as any)
      .GET(`/commands/conversations/${initialReviewId}/messages`, {})
      .then((res: any) => {
        const msgs = (
          res.data && "data" in res.data ? res.data.data : res.data
        ) as OmniMessage[] | undefined;
        if (Array.isArray(msgs) && msgs.length > 0) setChatHistory(msgs);
      })
      .catch((err: unknown) =>
        console.error("Failed to fetch chat history:", err),
      )
      .finally(() => setHasFetchedHistory(true));
  }, [initialReviewId, setChatHistory]);

  useEffect(() => {
    if (!hasFetchedHistory || !initialQuery || !initialQuery.trim()) return;
    const exists = chatHistory.some(
      (m) => m.role === "user" && m.content.includes(initialQuery),
    );
    if (exists) return;

    setIsProcessing(true);
    const newMsg: OmniMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: initialQuery,
      timestamp: new Date(),
    };

    if (socket?.connected) {
      socket.emit("executeCommand", {
        chatHistory: [...chatHistory, newMsg],
        source: "omnibar",
        path: "/home",
        context: { conversationId: initialReviewId },
      });
    } else {
      (api as any)
        .POST("/commands/execute", {
          body: { command: initialQuery, history: [...chatHistory, newMsg] },
        })
        .then((res: any) => {
          setIsProcessing(false);
          if (res.data?.response) {
            setChatHistory([
              ...chatHistory,
              newMsg,
              {
                id: crypto.randomUUID(),
                role: "model",
                content: res.data.response,
                timestamp: new Date(),
              },
            ]);
          }
        })
        .catch((err: unknown) => {
          console.error("Failed to execute answer query:", err);
          setIsProcessing(false);
        });
    }
  }, [
    initialQuery,
    hasFetchedHistory,
    chatHistory,
    initialReviewId,
    setChatHistory,
    setIsProcessing,
    socket,
  ]);

  useEffect(() => {
    const main = document.getElementById("workspace-main");
    if (main) {
      setTimeout(
        () => main.scrollTo({ top: main.scrollHeight, behavior: "smooth" }),
        50,
      );
    }
  }, [chatHistory.length, isProcessing]);

  const latestUserMessage = useMemo(() => {
    const userMsgs = chatHistory.filter((m) => m.role === "user");
    return userMsgs[userMsgs.length - 1]?.content || initialQuery;
  }, [chatHistory, initialQuery]);

  const componentDirective = useMemo(() => {
    const renderMsg = chatHistory.findLast(
      (m) => (m.role as string) === "render_component",
    );
    if (renderMsg?.content) {
      try {
        return JSON.parse(renderMsg.content) as { componentName?: string };
      } catch {
        // no-op
      }
    }
    return null;
  }, [chatHistory]);

  const track2Type = useMemo(() => {
    if (componentDirective?.componentName)
      return componentDirective.componentName;
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
  }, [componentDirective, latestUserMessage]);

  const handleTogglePrepItem = (id: string) => {
    setPrepListItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
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
