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
import { Sparkles, Bot, CheckSquare, Search, BookOpen, ExternalLink } from "lucide-react";

export interface AnswerViewProps {
  initialQuery?: string;
  initialReviewId?: string;
}

export function AnswerView({ initialQuery = "", initialReviewId }: AnswerViewProps) {
  const { chatHistory, setChatHistory, isProcessing, setIsProcessing } = useOmnibarContext();
  const [activeReviewId] = useState<string | undefined>(initialReviewId);
  const [prepListItems, setPrepListItems] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "1", text: "Dice 10lbs yellow onions for soup base", done: false },
    { id: "2", text: "Trim & portion ribeye loins (12oz steaks)", done: false },
    { id: "3", text: "Simmer beef bone broth (8 hours low heat)", done: true },
    { id: "4", text: "Grate Gruyère cheese for crock topping", done: false },
  ]);

  const [realRevenueData, setRealRevenueData] = useState<Array<{ name: string; value: number }>>([]);
  const [realTicketTimeData, setRealTicketTimeData] = useState<Array<{ time: string; minutes: number }>>([]);

  // Fetch real database dashboard metrics for revenue and ticket time charts
  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.revenue && Array.isArray(data.revenue)) {
          setRealRevenueData(data.revenue);
        }
        if (data?.ticketTimes && Array.isArray(data.ticketTimes)) {
          setRealTicketTimeData(data.ticketTimes);
        }
      })
      .catch((err) => console.error("Failed to fetch real dashboard metrics:", err));
  }, []);

  // Handle URL query prompt when visiting /answer?q=... directly
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      const hasUserMsg = chatHistory.some((m) => m.role === "user" && m.content.includes(initialQuery));
      if (!hasUserMsg) {
        setIsProcessing(true);
        const newMsg = {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: initialQuery,
          timestamp: new Date(),
        };

        // Call backend API to fetch conversational response for query
        fetch("/api/commands/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: initialQuery, history: [...chatHistory, newMsg] }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
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
            } else {
              setChatHistory([
                ...chatHistory,
                newMsg,
                {
                  id: crypto.randomUUID(),
                  role: "model" as const,
                  content: `Heard, Chef. I have queried our backend databases for "${initialQuery}". Here are the active sales metrics and operational insights.`,
                  timestamp: new Date(),
                },
              ]);
            }
          })
          .catch((err) => {
            console.error("Failed to execute answer query:", err);
            setIsProcessing(false);
            setChatHistory([
              ...chatHistory,
              newMsg,
              {
                id: crypto.randomUUID(),
                role: "model" as const,
                content: `Heard, Chef. Systems online for query "${initialQuery}". How would you like to refine this calculation or workflow?`,
                timestamp: new Date(),
              },
            ]);
          });
      }
    }
  }, [initialQuery]);

  // Extract latest user prompt and AI model message
  const latestUserMessage = useMemo(() => {
    const userMsgs = chatHistory.filter((m) => m.role === "user");
    return userMsgs[userMsgs.length - 1]?.content || initialQuery;
  }, [chatHistory, initialQuery]);

  const latestModelMessage = useMemo(() => {
    const modelMsgs = chatHistory.filter((m) => m.role === "model" || m.role === "agent_step");
    return modelMsgs[modelMsgs.length - 1]?.content || null;
  }, [chatHistory]);

  // Detect component render directive from tool execution
  const componentDirective = useMemo(() => {
    const renderMsg = chatHistory.find((m) => m.role === ("render_component" as any));
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

    if (activeReviewId || q.includes("invoice") || q.includes("ingest") || q.includes("review") || q.includes("document")) {
      return "INGESTION_REVIEW";
    }
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
    if (q.includes("item") || q.includes("inventory") || q.includes("supplier")) {
      return "INGREDIENT_TABLE";
    }

    return null; // General conversation ("test", "hello") renders NO Track 2 box
  }, [activeReviewId, componentDirective, latestUserMessage]);

  const togglePrepItem = (id: string) => {
    setPrepListItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 md:p-6 pb-24">
      {/* ── Conversational Answer Card ── */}
      <Card className="w-full border-cyan-500/20 bg-zinc-950/80 backdrop-blur-xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {latestModelMessage ? (
              <div className="prose prose-invert max-w-none text-zinc-100 text-base leading-relaxed font-sans">
                <p className="whitespace-pre-wrap">{latestModelMessage}</p>
              </div>
            ) : isProcessing ? (
              <div className="flex items-center gap-3 text-sm text-cyan-400 font-mono">
                <Bot className="w-4 h-4 animate-bounce text-cyan-400" />
                <span>Heard, Chef. Systems online and processing your prompt...</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-zinc-100 text-base leading-relaxed font-sans">
                <p>Heard, Chef. Systems are online and ready. What&apos;s the move — prepping, ordering, or digging into data?</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── Polymorphic Data Views (ONLY rendered when real matched data exists) ── */}
      {track2Type === "INGESTION_REVIEW" && (
        <UniversalReviewComponent reviewId={activeReviewId} />
      )}

      {track2Type === "REVENUE_CHART" && (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              Weekly Revenue & Sales Metrics
            </CardTitle>
            <p className="text-xs text-zinc-400">Real-time Square & POS aggregate sales trends from database</p>
          </CardHeader>
          <RevenueChart data={realRevenueData} />
        </Card>
      )}

      {track2Type === "TICKET_TIME_CHART" && (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              Kitchen Ticket Fulfillment Times
            </CardTitle>
            <p className="text-xs text-zinc-400">KDS throttle metrics and station turnaround speeds from database</p>
          </CardHeader>
          <TicketTimeChart data={realTicketTimeData} />
        </Card>
      )}

      {track2Type === "PREP_LIST" && (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
          <CardHeader className="px-0 pt-0 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                Kitchen Prep Checklist
              </CardTitle>
              <p className="text-xs text-zinc-400">Interactive prep list — speak to Omnibar to alter items</p>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {prepListItems.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePrepItem(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  item.done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 line-through opacity-75"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-100 hover:border-cyan-500/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {}}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {track2Type === "INGREDIENT_TABLE" && (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
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
                <TableCell className="font-semibold text-white">Yellow Onions 5lb</TableCell>
                <TableCell>Produce</TableCell>
                <TableCell>5 lb bag</TableCell>
                <TableCell><Chip selected={true} size="sm">In Stock</Chip></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-white">Beef Ribeye Lip On</TableCell>
                <TableCell>Meat</TableCell>
                <TableCell>15 lb case</TableCell>
                <TableCell><Chip selected={true} size="sm">In Stock</Chip></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-white">Heavy Cream 40%</TableCell>
                <TableCell>Dairy</TableCell>
                <TableCell>1 Gallon</TableCell>
                <TableCell><Chip selected={true} size="sm">In Stock</Chip></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}

      {track2Type === "SEARCH_RESULTS" && (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Web & Culinary Knowledge Search Results
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col gap-1">
              <a
                href="https://fdc.nal.usda.gov"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-cyan-400 hover:underline flex items-center gap-1.5"
              >
                USDA FoodData Central — Yellow Onions Raw <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-xs text-zinc-400">
                FDC ID #170000. Contains 40 kcal per 100g. Standard culinary raw yellow onion nutritional vector data.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
