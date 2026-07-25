"use client";

import { useState, useMemo } from "react";
import { UniversalReviewComponent } from "../ReviewComponent/UniversalReviewComponent";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Chip,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  RevenueChart,
  TicketTimeChart,
  useOmnibarContext,
} from "@soustools/design-system";
import { Sparkles, Bot, CheckSquare, Search, BookOpen, Layers, ExternalLink } from "lucide-react";

export interface AnswerViewProps {
  initialQuery?: string;
  initialReviewId?: string;
}

export function AnswerView({ initialQuery = "", initialReviewId }: AnswerViewProps) {
  const { chatHistory } = useOmnibarContext();
  const [activeReviewId] = useState<string | undefined>(initialReviewId);
  const [prepListItems, setPrepListItems] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "1", text: "Dice 10lbs yellow onions for soup base", done: false },
    { id: "2", text: "Trim & portion ribeye loins (12oz steaks)", done: false },
    { id: "3", text: "Simmer beef bone broth (8 hours low heat)", done: true },
    { id: "4", text: "Grate Gruyère cheese for crock topping", done: false },
  ]);

  // Extract the latest AI model output and user prompt from chatHistory
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
    const q = latestUserMessage.toLowerCase();
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
    return "INGESTION_REVIEW"; // Default fallback
  }, [activeReviewId, componentDirective, latestUserMessage]);

  // Toggle item in prep list
  const togglePrepItem = (id: string) => {
    setPrepListItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // Mock revenue & ticket time data for charts
  const revenueData = [
    { name: "Mon", value: 3400 },
    { name: "Tue", value: 4200 },
    { name: "Wed", value: 3900 },
    { name: "Thu", value: 5100 },
    { name: "Fri", value: 7800 },
    { name: "Sat", value: 8900 },
    { name: "Sun", value: 6500 },
  ];

  const ticketTimeData = [
    { time: "11:00 AM", minutes: 8 },
    { time: "12:00 PM", minutes: 14 },
    { time: "1:00 PM", minutes: 18 },
    { time: "2:00 PM", minutes: 10 },
    { time: "5:00 PM", minutes: 12 },
    { time: "6:00 PM", minutes: 22 },
    { time: "7:00 PM", minutes: 26 },
    { time: "8:00 PM", minutes: 15 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-4 md:p-6 pb-24">
      {/* ── TRACK 1: AI Summary & Conversational Intelligence Panel ── */}
      <Card className="w-full border-cyan-500/30 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                Track 1 — AI Intelligence Summary
              </CardTitle>
              <p className="text-xs text-zinc-400">
                Query: &ldquo;{latestUserMessage || "Universal Search & Command"}&rdquo;
              </p>
            </div>
          </div>
          <Chip selected={true} size="sm" className="text-[10px] uppercase font-mono">
            Conversational Agent
          </Chip>
        </CardHeader>

        <CardContent className="p-5 flex flex-col gap-4 text-sm text-zinc-200">
          {latestModelMessage ? (
            <div className="prose prose-invert max-w-none text-zinc-200 leading-relaxed font-sans">
              <p className="whitespace-pre-wrap">{latestModelMessage}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-cyan-400 font-mono">
              <Bot className="w-4 h-4 animate-bounce text-cyan-400" />
              <span>Heard, Chef. Analyzing prompt and executing database queries...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── TRACK 2: Polymorphic Matched Data View ── */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Track 2 — Matched Polymorphic Data View</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Active view: {track2Type}</span>
        </div>

        {track2Type === "INGESTION_REVIEW" && (
          <UniversalReviewComponent reviewId={activeReviewId} />
        )}

        {track2Type === "REVENUE_CHART" && (
          <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                Weekly Revenue & Sales Metrics
              </CardTitle>
              <p className="text-xs text-zinc-400">Real-time Square & POS aggregate sales trends</p>
            </CardHeader>
            <RevenueChart data={revenueData} />
          </Card>
        )}

        {track2Type === "TICKET_TIME_CHART" && (
          <Card className="w-full border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-2xl">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                Kitchen Ticket Fulfillment Times
              </CardTitle>
              <p className="text-xs text-zinc-400">KDS throttle metrics and station turnaround speeds</p>
            </CardHeader>
            <TicketTimeChart data={ticketTimeData} />
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
                <p className="text-xs text-zinc-400">Interactive prep list — speak to Omnibar to add or check items</p>
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
    </div>
  );
}
