"use client";

import React from "react";
import { cn } from "@soustools/design-system";

export interface POSRegisterViewProps {
  catalog: React.ReactNode;
  ticket: React.ReactNode;
  header?: React.ReactNode;
  pinScreen?: React.ReactNode;
  className?: string;
}

export function POSRegisterView({
  catalog,
  ticket,
  header,
  pinScreen,
  className,
}: POSRegisterViewProps) {
  return (
    <div
      className={cn(
        "bg-background text-foreground relative flex h-screen w-full flex-col overflow-hidden font-sans",
        className,
      )}
    >
      {/* Optional Top Navigation / App Bar */}
      {header && header}

      {/* Main Layout: Catalog Area & Ticket Sidebar */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Square-Style Catalog Area */}
        <section className="bg-background flex flex-1 flex-col overflow-y-auto p-5 md:p-6">
          {catalog}
        </section>

        {/* Right: Modern Ticket / Checkout Panel */}
        <aside className="border-border bg-card/40 flex h-full w-96 shrink-0 flex-col overflow-hidden border-l backdrop-blur-xl lg:w-104">
          {ticket}
        </aside>
      </main>

      {/* Fullscreen PIN Lock Screen Overlay */}
      {pinScreen && pinScreen}
    </div>
  );
}
POSRegisterView.displayName = "POSRegisterView";
