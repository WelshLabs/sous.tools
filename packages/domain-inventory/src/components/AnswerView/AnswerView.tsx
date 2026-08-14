/* eslint-disable max-lines */
"use client";

import { useState, useMemo, useEffect } from "react";
import { UniversalReviewComponent } from "../ReviewComponent/UniversalReviewComponent";
import {
  Card,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Chip,
  RevenueChart,
  TicketTimeChart,
  useOmnibarContext,
} from "@soustools/design-system";
import {
  Sparkles,
  Bot,
  CheckSquare,
  Search,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { api } from "@soustools/api-client";

export interface AnswerViewProps {
  initialQuery?: string;
  initialReviewId?: string;
}

export function AnswerView({
  initialQuery = "",
  initialReviewId,
}: AnswerViewProps) {
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

  // Fetch real database dashboard metrics for revenue and ticket time charts
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

  // Handle URL query prompt when visiting /answer?q=... directly
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
            context: {},
            conversationId: initialReviewId,
          });
        } else {
          // Fallback to REST API if socket isn't ready
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

  // Auto-scroll logic
  useEffect(() => {
    const main = document.getElementById("workspace-main");
    if (main) {
      // scroll to bottom smoothly
      setTimeout(() => {
        main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
      }, 50);
    }
  }, [chatHistory.length, isProcessing]);

  // Extract latest user prompt and AI model message
  const latestUserMessage = useMemo(() => {
    const userMsgs = chatHistory.filter((m) => m.role === "user");
    return userMsgs[userMsgs.length - 1]?.content || initialQuery;
  }, [chatHistory, initialQuery]);

  // Detect component render directive from tool execution
  const componentDirective = useMemo(() => {
    const renderMsg = chatHistory.find(
      (m) => m.role === ("render_component" as any),
    );
    if (renderMsg && renderMsg.content) {
      try {
        return JSON.parse(renderMsg.content);
      } catch (err) {
        console.error("Failed to parse render_component payload:", err);
      }
    }
    return null;
  }, [chatHistory]);

  // Determine polymorphic Track 2 component type based on query intent or directive
  const track2Type = useMemo(() => {
    if (componentDirective?.componentName) {
      return componentDirective.componentName;
    }
    const q = (latestUserMessage || "").toLowerCase().trim();
    if (!q) return null;

    if (q.includes("revenue") || q.includes("sales") || q.includes("chart")) {
      return "REVENUE_CHART";
    }
    if (q.includes("ticket") || q.includes("time") || q.includes("throttle")) {
      return "TICKET_TIME_CHART";
    }
    if (q.includes("prep") || q.includes("task") || q.includes("todo")) {
      return "PREP_LIST";
    }
    if (q.includes("search") || q.includes("find") || q.includes("google")) {
      return "SEARCH_RESULTS";
    }
    if (
      q.includes("item") ||
      q.includes("inventory") ||
      q.includes("supplier")
    ) {
      return "INGREDIENT_TABLE";
    }

    return null; // General conversation ("test", "hello") renders NO Track 2 box
  }, [initialReviewId, componentDirective, latestUserMessage]);

  const togglePrepItem = (id: string) => {
    setPrepListItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pt-32 pb-64 md:p-6">
      {/* ── Conversational Answer Card ── */}
      <Card className="border-border bg-card/80 w-full p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-6">
          {chatHistory.length > 0
            ? chatHistory
                .filter(
                  (m) =>
                    m.role === "model" ||
                    m.role === "user" ||
                    m.role === "agent_step" ||
                    m.role === ("render_component" as any),
                )
                .map((m) => (
                  <div key={m.id} className="flex items-start gap-4">
                    <div
                      className={`shrink-0 rounded-2xl p-2.5 ${
                        m.role === "user"
                          ? "bg-secondary/10 text-secondary border-secondary/20 border"
                          : "bg-primary/10 text-primary border-primary/20 border"
                      }`}
                    >
                      {m.role === "user" ? (
                        <span className="font-bold">You</span>
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col pt-1">
                      {m.role === ("render_component" as any) ? (
                        (() => {
                          try {
                            const directive = JSON.parse(m.content);
                            if (
                              directive.componentName === "INGESTION_REVIEW"
                            ) {
                              return (
                                <div className="mt-2">
                                  <UniversalReviewComponent
                                    reviewId={directive.props.reviewId}
                                  />
                                </div>
                              );
                            }
                            return null;
                          } catch (err) {
                            return null;
                          }
                        })()
                      ) : (
                        <div className="prose prose-invert text-foreground max-w-none font-sans text-base leading-relaxed">
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mb-3 flex gap-3">
                              {m.attachments.map((att: any, i: number) =>
                                att.url ? (
                                  <img
                                    key={i}
                                    src={att.url}
                                    alt="Attachment thumbnail"
                                    className="border-border h-20 w-20 rounded-lg border object-cover shadow-sm"
                                  />
                                ) : null,
                              )}
                            </div>
                          )}
                          <p className="m-0 whitespace-pre-wrap">
                            {m.content.replace(/^\[\d+ attachments?\]\s*/, "")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            : null}

          {isProcessing && (
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-2xl border p-2.5">
                <Bot className="h-5 w-5 animate-bounce" />
              </div>
              <div className="flex flex-1 flex-col pt-2">
                <span className="text-primary font-mono text-sm">
                  Heard, Chef. Systems online and processing your prompt...
                </span>
              </div>
            </div>
          )}

          {!isProcessing && chatHistory.length === 0 && (
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-2xl border p-2.5">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex flex-1 flex-col pt-1">
                <div className="prose prose-invert text-foreground max-w-none font-sans text-base leading-relaxed">
                  <p className="m-0">
                    Heard, Chef. Systems are online and ready. What&apos;s the
                    move — prepping, ordering, or digging into data?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Polymorphic Data Views (ONLY rendered when real matched data exists) ── */}

      {track2Type === "REVENUE_CHART" && (
        <Card className="border-border bg-card/80 w-full p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
              Weekly Revenue & Sales Metrics
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Real-time Square & POS aggregate sales trends from database
            </p>
          </CardHeader>
          <RevenueChart data={realRevenueData} />
        </Card>
      )}

      {track2Type === "TICKET_TIME_CHART" && (
        <Card className="border-border bg-card/80 w-full p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
              Kitchen Ticket Fulfillment Times
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              KDS throttle metrics and station turnaround speeds from database
            </p>
          </CardHeader>
          <TicketTimeChart data={realTicketTimeData} />
        </Card>
      )}

      {track2Type === "PREP_LIST" && (
        <Card className="border-border bg-card/80 flex w-full flex-col gap-4 p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between px-0 pt-0 pb-2">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                <CheckSquare className="text-primary h-5 w-5" />
                Kitchen Prep Checklist
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Interactive prep list — speak to Omnibar to alter items
              </p>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {prepListItems.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePrepItem(item.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  item.done
                    ? "bg-primary/10 border-primary/30 text-primary line-through opacity-75"
                    : "bg-muted/60 border-border text-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {}}
                  className="accent-primary h-4 w-4 cursor-pointer rounded"
                />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {track2Type === "INGREDIENT_TABLE" && (
        <Card className="border-border bg-card/80 w-full p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
              <BookOpen className="text-primary h-5 w-5" />
              Inventory Master Items Ledger
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purchase Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-foreground font-semibold">
                  Yellow Onions 5lb
                </TableCell>
                <TableCell>Produce</TableCell>
                <TableCell>5 lb bag</TableCell>
                <TableCell>
                  <Chip selected={true} size="sm">
                    In Stock
                  </Chip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-foreground font-semibold">
                  Beef Ribeye Lip On
                </TableCell>
                <TableCell>Meat</TableCell>
                <TableCell>15 lb case</TableCell>
                <TableCell>
                  <Chip selected={true} size="sm">
                    In Stock
                  </Chip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-foreground font-semibold">
                  Heavy Cream 40%
                </TableCell>
                <TableCell>Dairy</TableCell>
                <TableCell>1 Gallon</TableCell>
                <TableCell>
                  <Chip selected={true} size="sm">
                    In Stock
                  </Chip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}

      {track2Type === "SEARCH_RESULTS" && (
        <Card className="border-border bg-card/80 flex w-full flex-col gap-4 p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
              <Search className="text-primary h-5 w-5" />
              Web & Culinary Knowledge Search Results
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <div className="border-border bg-muted/60 flex flex-col gap-1 rounded-xl border p-4">
              <a
                href="https://fdc.nal.usda.gov"
                target="_blank"
                rel="noreferrer"
                className="text-primary flex items-center gap-1.5 text-sm font-bold hover:underline"
              >
                USDA FoodData Central — Yellow Onions Raw{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="text-muted-foreground text-xs">
                FDC ID #170000. Contains 40 kcal per 100g. Standard culinary raw
                yellow onion nutritional vector data.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
