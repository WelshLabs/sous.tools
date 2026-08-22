"use client";
/* eslint-disable max-lines */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/kds",
  useSearchParams: () => new URLSearchParams(),
}));

import { KDSView } from "./kds.view";
import { KDSAppBar } from "./components/kds-appbar";
import { KDSSettingsModal } from "./kds-settings-modal";
import {
  formatTicketAge,
  formatCompletedTime,
  formatFulfillmentDuration,
  filterTicketsByDate,
  getTicketUrgency,
  mapOrderToKDSTicket,
} from "./kds.helpers";
import { type KDSTicket, type KDSSettings } from "./kds.types";

const mockOpenTicket: KDSTicket = {
  id: "ticket-1",
  ticketNumber: "104",
  tableNumber: "Table 4",
  createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4m ago
  status: "OPEN",
  items: [
    {
      id: "li-1",
      name: "Double Smashburger",
      qty: 2,
      notes: "No onions",
      status: "OPEN",
    },
    { id: "li-2", name: "Truffle Fries", qty: 1, status: "OPEN" },
  ],
};

const mockClosedTicket: KDSTicket = {
  id: "ticket-2",
  ticketNumber: "tKZY",
  tableNumber: "To Go / Takeout",
  createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  closedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  status: "CLOSED",
  externalId: "LB0RP5AM6XG7E",
  totalMoney: 24.5,
  items: [
    {
      id: "li-3",
      name: "Crispy Chicken Sandwich",
      qty: 1,
      status: "COMPLETED",
    },
  ],
};

const mockSettings: KDSSettings = {
  textSize: "md",
  density: "standard",
  soundsEnabled: true,
  soundVolume: 0.5,
  timerAlertSounds: true,
  warningMinutes: 10,
  rushMinutes: 15,
  ticketSortOrder: "oldest_first",
  stationFilter: "ALL",
  autoRefreshInterval: 10,
};

describe("KDS Helpers & Formatters", () => {
  it("formats ticket age cleanly across durations", () => {
    const now = Date.now();
    const age30s = new Date(now - 30 * 1000).toISOString();
    expect(formatTicketAge(age30s, now)).toBe("30s");

    const age5m20s = new Date(now - (5 * 60 + 20) * 1000).toISOString();
    expect(formatTicketAge(age5m20s, now)).toBe("5m 20s");

    const age75m = new Date(now - 75 * 60 * 1000).toISOString();
    expect(formatTicketAge(age75m, now)).toBe("1h 15m");
  });

  it("formats completed time and turnaround prep duration", () => {
    const created = new Date("2026-08-21T10:00:00.000Z").toISOString();
    const closed = new Date("2026-08-21T10:08:30.000Z").toISOString();

    const duration = formatFulfillmentDuration(created, closed);
    expect(duration).toBe("8m 30s");

    const completedFormatted = formatCompletedTime(closed);
    expect(completedFormatted).toContain("at");
  });

  it("calculates ticket urgency based on configurable thresholds", () => {
    const now = Date.now();
    const normalTime = new Date(now - 3 * 60 * 1000).toISOString();
    const warningTime = new Date(now - 12 * 60 * 1000).toISOString();
    const rushTime = new Date(now - 18 * 60 * 1000).toISOString();

    expect(getTicketUrgency(normalTime, 10, 15, now)).toBe("normal");
    expect(getTicketUrgency(warningTime, 10, 15, now)).toBe("warning");
    expect(getTicketUrgency(rushTime, 10, 15, now)).toBe("rush");
  });

  it("filters completed tickets by date range (today, yesterday, all)", () => {
    const now = new Date();
    const todayTicket: KDSTicket = {
      ...mockClosedTicket,
      id: "t-today",
      closedAt: now.toISOString(),
    };

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayTicket: KDSTicket = {
      ...mockClosedTicket,
      id: "t-yesterday",
      closedAt: yesterday.toISOString(),
    };

    const list = [todayTicket, yesterdayTicket];
    const todayFiltered = filterTicketsByDate(list, "today");
    expect(todayFiltered).toHaveLength(1);
    expect(todayFiltered[0].id).toBe("t-today");

    const yesterdayFiltered = filterTicketsByDate(list, "yesterday");
    expect(yesterdayFiltered).toHaveLength(1);
    expect(yesterdayFiltered[0].id).toBe("t-yesterday");

    const allFiltered = filterTicketsByDate(list, "all");
    expect(allFiltered).toHaveLength(2);
  });

  it("maps API order object to KDSTicket", () => {
    const rawOrder = {
      id: "ord-12345",
      external_id: "SQ-ORD-9876",
      state: "COMPLETED",
      total_money: 18.5,
      location_id: "Main Dining",
      order_type: "for_here",
      created_at: new Date().toISOString(),
      closed_at: new Date().toISOString(),
      pos_order_line_items: [
        {
          id: "li-10",
          name: "Latte",
          quantity: 2,
          base_price_money: 4.5,
          status: "COMPLETED",
        },
      ],
    };

    const ticket = mapOrderToKDSTicket(rawOrder);
    expect(ticket.id).toBe("ord-12345");
    expect(ticket.ticketNumber).toBe("-9876");
    expect(ticket.status).toBe("CLOSED");
    expect(ticket.items).toHaveLength(1);
    expect(ticket.items[0].name).toBe("Latte");
    expect(ticket.items[0].qty).toBe(2);
  });
});

describe("KDSAppBar Component", () => {
  it("renders launcher, tabs, station filter, and triggers actions", () => {
    const onSetViewFilter = vi.fn();
    const onOpenSettings = vi.fn();
    const onSyncSquare = vi.fn().mockResolvedValue(undefined);
    const onSelectStation = vi.fn();

    render(
      <KDSAppBar
        viewFilter="OPEN"
        onSetViewFilter={onSetViewFilter}
        openTicketsCount={3}
        closedTicketsCount={8}
        onOpenSettings={onOpenSettings}
        onSyncSquare={onSyncSquare}
        isSyncingSquare={false}
        stationFilter="ALL"
        onSelectStation={onSelectStation}
      />,
    );

    expect(screen.getByText("Kitchen Display")).toBeDefined();
    expect(screen.getByText("Open")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getByText("8")).toBeDefined();

    // Click Completed Tab
    fireEvent.click(screen.getByText("Completed"));
    expect(onSetViewFilter).toHaveBeenCalledWith("CLOSED");

    // Click Sync Square
    const syncBtn = screen.getByTitle("Sync Square Orders & Catalog");
    fireEvent.click(syncBtn);
    expect(onSyncSquare).toHaveBeenCalled();

    // Click Settings
    const settingsBtn = screen.getByTitle("KDS Display & Sound Settings");
    fireEvent.click(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalled();
  });
});

describe("KDSView Component", () => {
  it("renders OPEN tickets with complete ticket action and all-day prep summary", () => {
    const onCompleteTicket = vi.fn();
    const onToggleLineItem = vi.fn();
    const onReopenTicket = vi.fn();

    render(
      <KDSView
        tickets={[mockOpenTicket, mockClosedTicket]}
        viewFilter="OPEN"
        onSetViewFilter={vi.fn()}
        onOpenSettings={vi.fn()}
        onCompleteTicket={onCompleteTicket}
        onReopenTicket={onReopenTicket}
        onToggleLineItem={onToggleLineItem}
        onSyncSquare={vi.fn().mockResolvedValue(undefined)}
        isSyncingSquare={false}
        stationFilter="ALL"
        onSelectStation={vi.fn()}
        allDayPrep={[
          ["Double Smashburger", 2],
          ["Truffle Fries", 1],
        ]}
        density="standard"
        textSize="md"
        warningMinutes={10}
        rushMinutes={15}
      />,
    );

    expect(screen.getByText("Ticket #104")).toBeDefined();
    expect(screen.getByText("Table 4")).toBeDefined();
    expect(screen.getByText("2x Double Smashburger")).toBeDefined();
    expect(screen.getByText("* No onions")).toBeDefined();
    expect(screen.getByText("All-Day Summary")).toBeDefined();

    // Toggle line item
    fireEvent.click(screen.getByText("2x Double Smashburger"));
    expect(onToggleLineItem).toHaveBeenCalledWith(
      "ticket-1",
      mockOpenTicket.items[0],
    );

    // Complete ticket
    const completeBtn = screen.getByText("Complete Ticket");
    fireEvent.click(completeBtn);
    expect(onCompleteTicket).toHaveBeenCalledWith("ticket-1");
  });

  it("renders CLOSED tickets with better formatting, prep time, and re-open capability", () => {
    const onReopenTicket = vi.fn();

    render(
      <KDSView
        tickets={[mockOpenTicket, mockClosedTicket]}
        viewFilter="CLOSED"
        onSetViewFilter={vi.fn()}
        onOpenSettings={vi.fn()}
        onCompleteTicket={vi.fn()}
        onReopenTicket={onReopenTicket}
        onToggleLineItem={vi.fn()}
        onSyncSquare={vi.fn().mockResolvedValue(undefined)}
        isSyncingSquare={false}
        stationFilter="ALL"
        onSelectStation={vi.fn()}
        allDayPrep={[]}
        density="standard"
        textSize="md"
        warningMinutes={10}
        rushMinutes={15}
      />,
    );

    expect(screen.getByText("Ticket #tKZY")).toBeDefined();
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getByText("To Go / Takeout")).toBeDefined();
    expect(screen.getByText(/Ref:/)).toBeDefined();
    expect(screen.getByText("1x Crispy Chicken Sandwich")).toBeDefined();

    // Click Re-open Ticket
    const reopenBtn = screen.getByText("Re-open Ticket");
    fireEvent.click(reopenBtn);
    expect(onReopenTicket).toHaveBeenCalledWith("ticket-2");
  });
});

describe("KDSSettingsModal Component", () => {
  it("renders settings options and allows saving updated configuration", () => {
    const onSaveSettings = vi.fn();
    const onClose = vi.fn();
    const onToggleSoldOut = vi.fn().mockResolvedValue(undefined);

    render(
      <KDSSettingsModal
        isOpen={true}
        onClose={onClose}
        settings={mockSettings}
        onSaveSettings={onSaveSettings}
        posItems={[
          { id: "it-1", name: "Cheeseburger", is_sold_out: false },
          { id: "it-2", name: "Cold Brew", is_sold_out: true },
        ]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onToggleSoldOut={onToggleSoldOut}
      />,
    );

    expect(screen.getByText("Kitchen Display Settings")).toBeDefined();
    expect(screen.getByText("Ticket Font & Text Size")).toBeDefined();
    expect(screen.getByText("Grid Layout Density")).toBeDefined();

    // Select Large text size
    fireEvent.click(screen.getByText("Large (High-Vis)"));

    // Select Spacious density
    fireEvent.click(screen.getByText("Spacious (2-3 Cols)"));

    // Save Settings
    fireEvent.click(screen.getByText("Apply & Save Settings"));
    expect(onSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        textSize: "lg",
        density: "spacious",
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
