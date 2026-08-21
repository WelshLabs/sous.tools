/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Check,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Receipt,
  Layers,
} from "lucide-react";
import { Button } from "@soustools/design-system";
import {
  type KDSTicket,
  type KDSTicketItem,
  type KDSTextSize,
  type KDSDensity,
  type KDSCompletedDateFilter,
  type KDSStationFilter,
  type KDSUser,
} from "./kds.types";
import { KDSAppBar } from "./components/kds-appbar";
import {
  formatTicketAge,
  formatCompletedTime,
  formatFulfillmentDuration,
  formatRelativeTimeAgo,
  filterTicketsByDate,
  getTicketUrgency,
} from "./kds.helpers";

const PAGE_SIZE = 12;

export interface KDSViewProps {
  tickets: KDSTicket[];
  viewFilter: "OPEN" | "CLOSED";
  onSetViewFilter: (filter: "OPEN" | "CLOSED") => void;
  onOpenSettings: () => void;
  onCompleteTicket: (ticketId: string) => void;
  onReopenTicket: (ticketId: string) => void;
  onToggleLineItem: (ticketId: string, item: KDSTicketItem) => void;
  onSyncSquare: () => Promise<void>;
  isSyncingSquare: boolean;
  stationFilter: KDSStationFilter;
  onSelectStation: (station: KDSStationFilter) => void;
  allDayPrep: Array<[string, number]>;
  density: KDSDensity;
  textSize: KDSTextSize;
  warningMinutes: number;
  rushMinutes: number;
  currentUser?: KDSUser | null;
  isAdmin?: boolean;
}

export function KDSView({
  tickets,
  viewFilter,
  onSetViewFilter,
  onOpenSettings,
  onCompleteTicket,
  onReopenTicket,
  onToggleLineItem,
  onSyncSquare,
  isSyncingSquare,
  stationFilter,
  onSelectStation,
  allDayPrep,
  density,
  textSize,
  warningMinutes,
  rushMinutes,
  currentUser,
  isAdmin = true,
}: KDSViewProps) {
  // Date filter for completed tickets: default to "today"
  const [completedDateFilter, setCompletedDateFilter] =
    useState<KDSCompletedDateFilter>("today");
  const [completedPage, setCompletedPage] = useState(1);

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const closedTickets = tickets.filter((t) => t.status === "CLOSED");

  // Filter completed tickets by date range
  const dateFilteredClosedTickets = filterTicketsByDate(
    closedTickets,
    completedDateFilter,
  );

  // Pagination for completed tickets
  const totalCompletedPages = Math.max(
    1,
    Math.ceil(dateFilteredClosedTickets.length / PAGE_SIZE),
  );
  const currentCompletedPage = Math.min(completedPage, totalCompletedPages);
  const paginatedClosedTickets = dateFilteredClosedTickets.slice(
    (currentCompletedPage - 1) * PAGE_SIZE,
    currentCompletedPage * PAGE_SIZE,
  );

  // Dynamic layout grid classes
  const gridClasses = {
    compact:
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3",
    standard: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    spacious: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  }[density];

  // Dynamic font sizing classes
  const fontClasses = {
    sm: {
      title: "text-xs font-black",
      body: "text-xs",
      notes: "text-[10px]",
      meta: "text-[10px]",
      badge: "text-[9px] px-1.5 py-0.5",
    },
    md: {
      title: "text-sm font-black",
      body: "text-sm",
      notes: "text-xs",
      meta: "text-xs",
      badge: "text-[10px] px-2 py-0.5",
    },
    lg: {
      title: "text-base font-black",
      body: "text-base",
      notes: "text-sm",
      meta: "text-sm",
      badge: "text-xs px-2.5 py-1",
    },
  }[textSize];

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col overflow-hidden select-none">
      {/* Top Application Bar matching POS screen */}
      <KDSAppBar
        viewFilter={viewFilter}
        onSetViewFilter={(filter) => {
          onSetViewFilter(filter);
          setCompletedPage(1);
        }}
        openTicketsCount={openTickets.length}
        closedTicketsCount={closedTickets.length}
        onOpenSettings={onOpenSettings}
        onSyncSquare={onSyncSquare}
        isSyncingSquare={isSyncingSquare}
        stationFilter={stationFilter}
        onSelectStation={onSelectStation}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-64px)] min-h-0 flex-1 gap-4 overflow-hidden p-4">
        {/* Left / Center: Tickets Grid Container */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Active View: OPEN TICKETS */}
          {viewFilter === "OPEN" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1">
                {openTickets.length === 0 ? (
                  <div className="border-border bg-card/40 flex h-96 flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-foreground text-xl font-black tracking-tight">
                      All Orders Prepared & Clear!
                    </h3>
                    <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
                      Kitchen display is up to date. New transactions from
                      Square POS or online will stream here in real time.
                    </p>
                    <div className="mt-6 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onSyncSquare}
                        disabled={isSyncingSquare}
                        className="flex items-center gap-1.5 font-bold"
                      >
                        <RotateCcw
                          className={`h-3.5 w-3.5 text-sky-400 ${isSyncingSquare ? "animate-spin" : ""}`}
                        />
                        Check for New Orders
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`grid ${gridClasses} pb-12`}>
                    {openTickets.map((ticket) => {
                      const urgency = getTicketUrgency(
                        ticket.createdAt,
                        warningMinutes,
                        rushMinutes,
                      );
                      const isRush = ticket.isRush || urgency === "rush";
                      const isWarning = urgency === "warning" && !isRush;
                      const ageDisplay = formatTicketAge(ticket.createdAt);

                      return (
                        <div
                          key={ticket.id}
                          className={`animate-in fade-in zoom-in-95 flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-md transition-all duration-300 ${
                            isRush
                              ? "border-red-500/60 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-red-500/40"
                              : isWarning
                                ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
                                : "border-border bg-card/90 hover:border-white/20"
                          }`}
                        >
                          <div>
                            {/* Ticket Header */}
                            <div className="border-border/50 mb-3 flex items-start justify-between border-b pb-2.5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`tracking-tight ${fontClasses.title} ${
                                      isRush
                                        ? "text-red-400"
                                        : isWarning
                                          ? "text-amber-400"
                                          : "text-foreground"
                                    }`}
                                  >
                                    Ticket #{ticket.ticketNumber}
                                  </span>
                                  {isRush && (
                                    <span className="animate-pulse rounded border border-red-500/30 bg-red-500/20 px-1.5 py-0.5 text-[9px] font-black text-red-400 uppercase">
                                      RUSH
                                    </span>
                                  )}
                                  {isWarning && (
                                    <span className="rounded border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400 uppercase">
                                      ALERT
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className={`text-muted-foreground font-semibold ${fontClasses.meta}`}
                                  >
                                    {ticket.tableNumber}
                                  </span>
                                </div>
                              </div>

                              {/* Elapsed Timer Badge */}
                              <div
                                className={`flex items-center gap-1 rounded-lg px-2 py-1 font-mono font-bold ${fontClasses.meta} ${
                                  isRush
                                    ? "border border-red-500/30 bg-red-500/20 text-red-400"
                                    : isWarning
                                      ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                                      : "text-muted-foreground border border-white/10 bg-black/20"
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                <span>{ageDisplay}</span>
                              </div>
                            </div>

                            {/* Line Items List */}
                            <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                              {ticket.items.map((item) => {
                                const isDone = item.status === "COMPLETED";
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      onToggleLineItem(ticket.id, item)
                                    }
                                    className={`cursor-pointer rounded-xl border p-2.5 transition-all select-none ${
                                      isDone
                                        ? "border-border/30 bg-black/20 line-through opacity-40"
                                        : "border-border bg-card/60 hover:border-sky-500/50 hover:bg-sky-500/5 active:scale-[0.99]"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`font-bold ${fontClasses.body} ${
                                          isDone
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {item.qty}x {item.name}
                                      </span>
                                      {isDone && (
                                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                      )}
                                    </div>
                                    {item.notes && (
                                      <span
                                        className={`mt-0.5 block font-semibold text-orange-400 italic ${fontClasses.notes}`}
                                      >
                                        * {item.notes}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Complete Ticket Action Button */}
                          <div className="border-border/50 mt-4 border-t pt-3">
                            <Button
                              onClick={() => onCompleteTicket(ticket.id)}
                              className="w-full justify-center rounded-xl bg-white py-2.5 text-xs font-black text-black shadow-md transition-all hover:bg-zinc-200 active:scale-95"
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                              Complete Ticket
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active View: COMPLETED TICKETS */}
          {viewFilter === "CLOSED" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Date Filter Controls & Summary Bar */}
              <div className="border-border bg-card/40 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3">
                {/* Date Range Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-muted-foreground mr-1.5 flex items-center gap-1 text-xs font-bold tracking-wider uppercase">
                    <Calendar className="h-3.5 w-3.5 text-sky-400" /> Filter:
                  </span>
                  {(
                    [
                      { id: "today", label: "Today" },
                      { id: "yesterday", label: "Yesterday" },
                      { id: "last_7_days", label: "Last 7 Days" },
                      { id: "all", label: "All History" },
                    ] as const
                  ).map((df) => (
                    <button
                      key={df.id}
                      type="button"
                      onClick={() => {
                        setCompletedDateFilter(df.id);
                        setCompletedPage(1);
                      }}
                      className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        completedDateFilter === df.id
                          ? "border-sky-500 bg-sky-500/15 font-black text-sky-400 shadow-sm"
                          : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                      }`}
                    >
                      {df.label}
                    </button>
                  ))}
                </div>

                {/* Summary text */}
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
                  <Receipt className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    Showing {paginatedClosedTickets.length} of{" "}
                    {dateFilteredClosedTickets.length} completed tickets
                  </span>
                </div>
              </div>

              {/* Completed Tickets Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                {dateFilteredClosedTickets.length === 0 ? (
                  <div className="border-border bg-card/40 flex h-72 flex-col items-center justify-center rounded-2xl border p-8 text-center">
                    <Receipt className="text-muted-foreground mb-3 h-10 w-10 opacity-50" />
                    <p className="text-foreground text-base font-bold">
                      No completed tickets for this date range.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Try selecting "All History" or "Last 7 Days" above to
                      review past fulfilled orders.
                    </p>
                  </div>
                ) : (
                  <div className={`grid ${gridClasses} pb-6`}>
                    {paginatedClosedTickets.map((ticket) => {
                      const completedTimeFormatted = formatCompletedTime(
                        ticket.closedAt,
                        ticket.createdAt,
                      );
                      const relativeAgo = formatRelativeTimeAgo(
                        ticket.closedAt || ticket.createdAt,
                      );
                      const prepDuration = formatFulfillmentDuration(
                        ticket.createdAt,
                        ticket.closedAt,
                      );

                      return (
                        <div
                          key={ticket.id}
                          className="border-border bg-card/80 flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-sm transition-all hover:border-white/20"
                        >
                          <div>
                            {/* Completed Card Header */}
                            <div className="border-border/50 mb-3 flex items-start justify-between border-b pb-2.5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-foreground ${fontClasses.title}`}
                                  >
                                    Ticket #{ticket.ticketNumber}
                                  </span>
                                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-400 uppercase">
                                    Completed
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className={`text-muted-foreground font-semibold ${fontClasses.meta}`}
                                  >
                                    {ticket.tableNumber}
                                  </span>
                                  {ticket.externalId && (
                                    <span className="text-muted-foreground/60 font-mono text-[10px]">
                                      • Ref:{" "}
                                      {ticket.externalId
                                        .slice(-6)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Relative Time Pill */}
                              {relativeAgo && (
                                <span className="text-muted-foreground/80 rounded-md border border-white/5 bg-black/20 px-2 py-0.5 text-[10px] font-bold">
                                  {relativeAgo}
                                </span>
                              )}
                            </div>

                            {/* Time & Duration Breakdown */}
                            <div className="border-border/50 mb-3 space-y-1 rounded-xl border bg-black/20 p-2.5 text-xs font-semibold">
                              <div className="text-muted-foreground flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-sky-400" />{" "}
                                  Finished:
                                </span>
                                <span className="text-foreground font-bold">
                                  {completedTimeFormatted}
                                </span>
                              </div>
                              {prepDuration !== "---" && (
                                <div className="text-muted-foreground flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Flame className="h-3 w-3 text-amber-400" />{" "}
                                    Prep Duration:
                                  </span>
                                  <span className="font-mono font-bold text-amber-400">
                                    {prepDuration}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Completed Items */}
                            <div className="max-h-[140px] space-y-1.5 overflow-y-auto pr-1">
                              {ticket.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="border-border/30 flex items-center justify-between rounded-lg border bg-black/10 p-2 text-xs"
                                >
                                  <span className="text-muted-foreground font-semibold">
                                    {item.qty}x {item.name}
                                  </span>
                                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action: Re-open Ticket Button */}
                          <div className="border-border/50 mt-4 border-t pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReopenTicket(ticket.id)}
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border-white/15 bg-white/5 text-xs font-bold hover:bg-white/10"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                              Re-open Ticket
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination Bar */}
              {totalCompletedPages > 1 && (
                <div className="border-border bg-card/50 mt-auto flex items-center justify-between rounded-2xl border px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCompletedPage((p) => Math.max(1, p - 1))}
                    disabled={currentCompletedPage <= 1}
                    className="flex items-center gap-1 text-xs font-bold"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Button>

                  <span className="text-muted-foreground text-xs font-bold">
                    Page {currentCompletedPage} of {totalCompletedPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCompletedPage((p) =>
                        Math.min(totalCompletedPages, p + 1),
                      )
                    }
                    disabled={currentCompletedPage >= totalCompletedPages}
                    className="flex items-center gap-1 text-xs font-bold"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: All-Day Prep Summary */}
        <aside className="border-border bg-card shadow-glow-sm hidden w-72 shrink-0 flex-col overflow-hidden rounded-2xl border lg:flex">
          <div className="border-border/50 flex items-center justify-between border-b bg-black/20 p-4">
            <h2 className="text-foreground flex items-center gap-1.5 text-sm font-black">
              <Layers className="h-4 w-4 text-sky-400" /> All-Day Summary
            </h2>
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-black text-sky-400 uppercase">
              Prep Queue
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {allDayPrep.length === 0 ? (
              <div className="text-muted-foreground py-16 text-center text-xs">
                <p className="font-bold">No active prep items.</p>
                <p className="mt-1 text-[11px]">
                  Incoming orders will populate item prep counts here.
                </p>
              </div>
            ) : (
              allDayPrep.map(([name, count]) => (
                <div
                  key={name}
                  className="border-border flex items-center justify-between rounded-xl border bg-black/20 p-3 transition-colors hover:bg-black/30"
                >
                  <span className="text-foreground truncate pr-2 text-sm font-bold">
                    {name}
                  </span>
                  <span className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-black text-sky-400">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
KDSView.displayName = "KDSView";
