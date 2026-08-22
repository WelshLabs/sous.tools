import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardView, type DashboardStats } from "./Dashboard.view";
import { DashboardContainer } from "./Dashboard.container";
import { graphqlClient } from "@soustools/api-client";

// Mock recharts ResponsiveContainer and charts to avoid resize observer / canvas issues in jsdom
vi.mock("recharts", async () => {
  const actual: any = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const mockStats: DashboardStats = {
  revenue: [
    {
      name: "Mon 8/17",
      value: 175.0,
      sales: 150.0,
      tax: 9.0,
      tips: 16.0,
      processingFee: -4.8,
    },
  ],
  ticketTimes: [
    {
      time: "12:00",
      minutes: 12,
    },
  ],
  inventoryAlerts: [
    {
      item: "Organic Brioche",
      status: "CRITICAL",
      quantity: "2.4kg",
    },
  ],
  summary: {
    totalOrders: 42,
    averageTicketTime: "12m",
    dailyRevenue: "$150.00",
    activeTables: 5,
    dailyRevenueChange: "+15% from yesterday",
    totalOrdersChange: "+4 from yesterday",
    averageTicketTimeChange: "-2m from yesterday",
    activeTablesSubtitle: "5 active orders",
  },
};

describe("DashboardView", () => {
  it("renders all KPI cards with formatted values and dynamic comparisons", () => {
    render(<DashboardView stats={mockStats} isLive={true} />);

    expect(screen.getByText("Operations Pulse")).toBeInTheDocument();
    expect(screen.getByText("Live Sync")).toBeInTheDocument();

    // KPI values
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("12m")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Subtitles
    expect(screen.getByText("+15% from yesterday")).toBeInTheDocument();
    expect(screen.getByText("+4 from yesterday")).toBeInTheDocument();
    expect(screen.getByText("-2m from yesterday")).toBeInTheDocument();
    expect(screen.getByText("5 active orders")).toBeInTheDocument();

    // Inventory Alerts
    expect(screen.getByText("Organic Brioche")).toBeInTheDocument();
    expect(screen.getByText("2.4kg remaining")).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });
});

describe("DashboardContainer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("subscribes to GraphQL dashboard stats updates and updates state when new data arrives", () => {
    let nextCallback: ((data: any) => void) | undefined;
    const mockUnsubscribe = vi.fn();

    vi.spyOn(graphqlClient, "subscribe").mockImplementation((options: any) => {
      nextCallback = options.onNext;
      return mockUnsubscribe;
    });

    const { unmount } = render(<DashboardContainer initialStats={mockStats} />);

    expect(graphqlClient.subscribe).toHaveBeenCalled();
    expect(screen.getByText("$150.00")).toBeInTheDocument();

    // Simulate incoming real-time subscription update
    const updatedStats: DashboardStats = {
      ...mockStats,
      summary: {
        ...mockStats.summary,
        dailyRevenue: "$275.50",
        totalOrders: 65,
      },
    };

    act(() => {
      nextCallback?.({
        dashboardStatsUpdated: updatedStats,
      });
    });

    expect(screen.getByText("$275.50")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
