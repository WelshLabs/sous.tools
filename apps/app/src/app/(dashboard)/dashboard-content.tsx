"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * DashboardPage renders the active order queue for back-of-house staff.
 * It integrates the shared UI Button component and custom anti-glare oklch backgrounds.
 */
export default function DashboardPage() {
  const handleCompleteTicket = (ticketId: string): void => {
    alert(`Ticket ${ticketId} completed!`);
  };

  const handleClockOut = (): void => {
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen p-6 bg-[oklch(0.1_0.01_180)] text-zinc-900 dark:text-slate-100">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-[oklch(0.2_0.02_180)]">
        <div>
          <h1 className="text-2xl font-bold text-[oklch(0.85_0.08_140)]">
            Kitchen Dashboard
          </h1>
          <p className="text-sm text-[oklch(0.65_0.03_180)]">
            Station: Cook Line 1
          </p>
        </div>
        <Button onClick={handleClockOut}>Clock Out</Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket 1 */}
        <div className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[oklch(0.75_0.1_40)]">
              Ticket #104
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.3_0.1_40)] text-[oklch(0.85_0.1_40)] font-bold">
              RUSH
            </span>
          </div>
          <p className="text-sm mb-4">2x Truffle Burger (Medium-Rare)</p>
          <div className="flex justify-end">
            <Button onClick={() => handleCompleteTicket("#104")}>
              Complete
            </Button>
          </div>
        </div>

        {/* Ticket 2 */}
        <div className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[oklch(0.75_0.05_180)]">
              Ticket #105
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
              Normal
            </span>
          </div>
          <p className="text-sm mb-4">1x Caesar Salad, 1x Tomato Soup</p>
          <div className="flex justify-end">
            <Button onClick={() => handleCompleteTicket("#105")}>
              Complete
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
