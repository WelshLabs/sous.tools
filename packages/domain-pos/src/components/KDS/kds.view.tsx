"use client";

import Link from "next/link";
import {
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Button, OmniBar } from "@soustools/design-system";
import { type KDSTicket, type KDSTicketItem } from "./kds.types";

interface KDSViewProps {
  tickets: KDSTicket[];
  viewFilter: "OPEN" | "CLOSED";
  onSetViewFilter: (filter: "OPEN" | "CLOSED") => void;
  onOpenSettings: () => void;
  onCompleteTicket: (ticketId: string) => void;
  onToggleLineItem: (ticketId: string, item: KDSTicketItem) => void;
  allDayPrep: Array<[string, number]>;
  density: "compact" | "standard" | "spacious";
  textSize: "sm" | "md" | "lg";
}

export function KDSView({
  tickets,
  viewFilter,
  onSetViewFilter,
  onOpenSettings,
  onCompleteTicket,
  onToggleLineItem,
  allDayPrep,
  density,
  textSize,
}: KDSViewProps) {
  const filteredTickets = tickets.filter((t) => t.status === viewFilter);

  const gridClasses = {
    compact: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3",
    standard: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
    spacious: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
  }[density];

  const fontClasses = {
    sm: { title: "text-xs font-bold", body: "text-xs", notes: "text-[10px]" },
    md: { title: "text-sm font-bold", body: "text-sm", notes: "text-xs" },
    lg: { title: "text-base font-bold", body: "text-base", notes: "text-sm" },
  }[textSize];

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-zinc-50 dark:bg-card text-zinc-900 dark:text-zinc-100 p-6 space-y-6 relative overflow-hidden">
      <header className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-shrink-0">
            <OmniBar />
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => onSetViewFilter("OPEN")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewFilter === "OPEN"
                  ? "bg-black/10 dark:bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Open ({tickets.filter((t) => t.status === "OPEN").length})
            </button>
            <button
              onClick={() => onSetViewFilter("CLOSED")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewFilter === "CLOSED"
                  ? "bg-black/10 dark:bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({tickets.filter((t) => t.status === "CLOSED").length})
            </button>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 bg-card hover:bg-black/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 h-[calc(100vh-230px)]">
        <div className="flex-1 flex flex-col min-w-0">
          <div
            className={`flex-1 overflow-y-auto pr-1 grid ${gridClasses} pb-10`}
          >
            {filteredTickets.length === 0 ? (
              <div className="glass-panel col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground rounded-2xl h-64">
                <CheckCircle className="w-12 h-12 mb-3 opacity-60" />
                <p className="font-bold text-lg text-foreground">
                  All tickets completed!
                </p>
                <p className="text-sm mt-1">
                  Ready for incoming transactions...
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const ageMinutes = Math.floor(
                  (Date.now() - new Date(ticket.createdAt).getTime()) /
                    (60 * 1000),
                );
                return (
                  <div
                    key={ticket.id}
                    className={`glass-panel flex flex-col justify-between rounded-xl p-4 transition-all duration-300 max-h-[360px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95 ${
                      ticket.isRush
                        ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/5"
                        : "shadow-lg hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-black tracking-tight ${fontClasses.title} ${ticket.isRush ? "text-amber-500" : "text-foreground"}`}
                            >
                              Ticket #{ticket.ticketNumber}
                            </span>
                            {ticket.isRush && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-extrabold uppercase">
                                RUSH
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {ticket.tableNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{ageMinutes}m</span>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {ticket.items.map((item) => {
                          const isDone = item.status === "COMPLETED";
                          return (
                            <div
                              key={item.id}
                              onClick={() =>
                                ticket.status === "OPEN" &&
                                onToggleLineItem(ticket.id, item)
                              }
                              className={`p-2 rounded-lg border transition-all cursor-pointer select-none ${
                                isDone
                                  ? "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-50 line-through"
                                  : "bg-white/40 dark:bg-black/30 border-black/10 dark:border-white/10 hover:border-sky-500/50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span
                                  className={`font-bold ${fontClasses.body} ${isDone ? "text-muted-foreground" : "text-foreground"}`}
                                >
                                  {item.qty}x {item.name}
                                </span>
                                {isDone && (
                                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                )}
                              </div>
                              {item.notes && (
                                <span
                                  className={`text-orange-400 font-semibold italic mt-0.5 block ${fontClasses.notes}`}
                                >
                                  * {item.notes}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {ticket.status === "OPEN" && (
                      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                        <Button
                          onClick={() => onCompleteTicket(ticket.id)}
                          className="w-full justify-center bg-white text-black hover:bg-zinc-200 py-2.5 font-bold transition-all text-xs rounded-lg"
                        >
                          Complete Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <aside className="glass-panel w-72 rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 bg-black/5 bg-card border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-sky-500" /> All-Day Summary
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold uppercase">
              Prep
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allDayPrep.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No active items to prepare.
              </div>
            ) : (
              allDayPrep.map(([name, count]) => (
                <div
                  key={name}
                  className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">
                    {name}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black">
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
