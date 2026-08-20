/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import {
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Check,
  LayoutGrid,
  ChefHat,
} from "lucide-react";
import { Button, OmniBar } from "@soustools/design-system";
import { WaffleMenuDropdown } from "@soustools/design-system";
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
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
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
    <div className="dark:bg-card relative flex min-h-screen flex-col space-y-4 overflow-hidden bg-zinc-50 p-5 text-zinc-900 dark:text-zinc-100">
      {/* KDS Header with Waffle Launcher, Title, Filter Tabs, Omnibar, and Settings */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/5 pb-3">
        {/* Left: Waffle Menu & App Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWaffleOpen((prev) => !prev)}
              aria-label="App Launcher"
              className="hover:bg-muted text-foreground flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:scale-105 active:scale-95"
            >
              <LayoutGrid className="h-5 w-5 text-sky-400" />
            </button>

            {isWaffleOpen && (
              <WaffleMenuDropdown
                onCloseMenus={() => setIsWaffleOpen(false)}
                isAdmin={true}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-400" />
            <h1 className="text-foreground hidden text-base font-black tracking-tight sm:block">
              Kitchen Display
            </h1>
          </div>
        </div>

        {/* Center: Open / Completed Tabs */}
        <div className="flex justify-center">
          <div className="flex rounded-xl border border-black/5 bg-black/5 p-1 text-xs font-semibold dark:border-white/5 dark:bg-black/40">
            <button
              onClick={() => onSetViewFilter("OPEN")}
              className={`cursor-pointer rounded-lg px-4 py-2 transition-all ${
                viewFilter === "OPEN"
                  ? "text-foreground bg-black/10 font-bold dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Open ({tickets.filter((t) => t.status === "OPEN").length})
            </button>
            <button
              onClick={() => onSetViewFilter("CLOSED")}
              className={`cursor-pointer rounded-lg px-4 py-2 transition-all ${
                viewFilter === "CLOSED"
                  ? "text-foreground bg-black/10 font-bold dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({tickets.filter((t) => t.status === "CLOSED").length})
            </button>
          </div>
        </div>

        {/* Right: Omnibar & Settings Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <OmniBar />
          </div>

          <button
            onClick={onOpenSettings}
            title="KDS Settings"
            className="text-muted-foreground hover:text-foreground flex-shrink-0 cursor-pointer rounded-xl border border-black/10 bg-black/5 p-2.5 transition-colors hover:bg-black/10 dark:border-white/10 dark:hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-100px)] min-h-0 flex-1 gap-6 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={`grid flex-1 overflow-y-auto pr-1 ${gridClasses} pb-10`}
          >
            {filteredTickets.length === 0 ? (
              <div className="glass-panel text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center rounded-2xl p-12">
                <CheckCircle className="mb-3 h-12 w-12 text-emerald-400 opacity-60" />
                <p className="text-foreground text-lg font-bold">
                  All tickets completed!
                </p>
                <p className="mt-1 text-sm">
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
                    className={`glass-panel animate-in fade-in slide-in-from-bottom-4 zoom-in-95 flex max-h-[360px] flex-col justify-between overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                      ticket.isRush
                        ? "border-amber-500/40 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "shadow-lg hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between border-b border-black/5 pb-2 dark:border-white/5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-black tracking-tight ${fontClasses.title} ${
                                ticket.isRush
                                  ? "text-amber-500"
                                  : "text-foreground"
                              }`}
                            >
                              Ticket #{ticket.ticketNumber}
                            </span>
                            {ticket.isRush && (
                              <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-500 uppercase">
                                RUSH
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground text-[10px]">
                            {ticket.tableNumber}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{ageMinutes}m</span>
                        </div>
                      </div>

                      <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                        {ticket.items.map((item) => {
                          const isDone = item.status === "COMPLETED";
                          return (
                            <div
                              key={item.id}
                              onClick={() =>
                                ticket.status === "OPEN" &&
                                onToggleLineItem(ticket.id, item)
                              }
                              className={`cursor-pointer rounded-lg border p-2 transition-all select-none ${
                                isDone
                                  ? "border-black/5 bg-black/5 line-through opacity-50 dark:border-white/5 dark:bg-white/5"
                                  : "border-black/10 bg-white/40 hover:border-sky-500/50 dark:border-white/10 dark:bg-black/30"
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
                                  <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
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

                    {ticket.status === "OPEN" && (
                      <div className="mt-4 border-t border-black/5 pt-3 dark:border-white/5">
                        <Button
                          onClick={() => onCompleteTicket(ticket.id)}
                          className="w-full justify-center rounded-lg bg-white py-2.5 text-xs font-bold text-black transition-all hover:bg-zinc-200"
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

        <aside className="glass-panel flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl">
          <div className="bg-card flex items-center justify-between border-b border-black/5 bg-black/5 p-4 dark:border-white/5">
            <h2 className="text-foreground flex items-center gap-1.5 text-sm font-bold">
              <AlertTriangle className="h-4 w-4 text-sky-500" /> All-Day Summary
            </h2>
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-500 uppercase">
              Prep
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {allDayPrep.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center text-xs">
                No active items to prepare.
              </div>
            ) : (
              allDayPrep.map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-3 transition-colors dark:border-white/5 dark:bg-black/20"
                >
                  <span className="text-foreground text-sm font-bold">
                    {name}
                  </span>
                  <span className="rounded border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-black text-sky-400">
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
