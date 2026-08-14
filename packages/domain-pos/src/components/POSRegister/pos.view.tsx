"use client";

import React from "react";
import { cn } from "@soustools/design-system";

export interface POSRegisterViewProps {
  catalog: React.ReactNode;
  ticket: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function POSRegisterView({
  catalog,
  ticket,
  header,
  className,
}: POSRegisterViewProps) {
  return (
    <div
      className={cn(
        "bg-background text-foreground flex h-screen w-full flex-col overflow-hidden font-sans",
        className,
      )}
    >
      {/* Top Navigation / Header slot if provided */}
      {header && (
        <header className="border-border bg-card/40 flex shrink-0 items-center border-b backdrop-blur-md">
          {header}
        </header>
      )}

      {/* Main Grid: Catalog vs Ticket */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left/Main Side: Catalog Area */}
        <section className="bg-background flex flex-1 flex-col overflow-y-auto p-6">
          {catalog}
        </section>

        {/* Right Side: Ticket Area */}
        <aside className="border-border bg-card/35 flex h-full w-100 shrink-0 flex-col overflow-hidden border-l backdrop-blur-xl">
          {ticket}
        </aside>
      </main>
    </div>
  );
}
POSRegisterView.displayName = "POSRegisterView";
