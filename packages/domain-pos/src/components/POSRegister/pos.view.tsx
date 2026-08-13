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
        "flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground",
        className,
      )}
    >
      {/* Top Navigation / Header slot if provided */}
      {header && (
        <header className="flex shrink-0 items-center border-b border-border bg-card/40 backdrop-blur-md">
          {header}
        </header>
      )}

      {/* Main Grid: Catalog vs Ticket */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left/Main Side: Catalog Area */}
        <section className="flex flex-1 flex-col overflow-y-auto bg-background p-6">
          {catalog}
        </section>

        {/* Right Side: Ticket Area */}
        <aside className="w-100 shrink-0 border-l border-border bg-card/35 backdrop-blur-xl flex flex-col h-full overflow-hidden">
          {ticket}
        </aside>
      </main>
    </div>
  );
}
POSRegisterView.displayName = "POSRegisterView";
