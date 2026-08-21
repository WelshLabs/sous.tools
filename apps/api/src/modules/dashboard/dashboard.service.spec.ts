import { DashboardService } from "./dashboard.service";
import { supabase } from "../../core/database/supabase";
import { pubSub } from "../../core/graphql/pubsub";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("../../core/graphql/pubsub", () => ({
  pubSub: {
    publish: jest.fn(),
  },
}));

describe("DashboardService", () => {
  let service: DashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardService();
  });

  const createMockSupabaseQuery = (data: any = []) => {
    const queryObj: any = {
      eq: jest.fn().mockImplementation(() => queryObj),
      then: (resolve: any) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };
    return {
      select: jest.fn().mockReturnValue(queryObj),
    };
  };

  it("calculates sales excluding tips and taxes, and formats daily revenue with cents", async () => {
    const now = new Date();
    const todayIso = now.toISOString();

    const mockOrders = [
      {
        id: "order-1",
        state: "COMPLETED",
        total_money: 165.0, // total collected = sales + tax + tips
        total_tax_money: 9.0,
        total_tip_money: 16.0,
        total_processing_fee_money: 4.5,
        created_at: todayIso,
        closed_at: todayIso,
      },
      {
        id: "order-2",
        state: "COMPLETED",
        total_money: 10.0,
        total_tax_money: 0.0,
        total_tip_money: 0.0,
        total_processing_fee_money: 0.3,
        created_at: todayIso,
        closed_at: todayIso,
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "pos_orders") {
        return createMockSupabaseQuery(mockOrders);
      }
      if (table === "inventory_on_hand") {
        return createMockSupabaseQuery([]);
      }
      return createMockSupabaseQuery([]);
    });

    const stats = await service.getAggregatedStats();

    // Order 1 sales = 165 - 9 - 16 = 140
    // Order 2 sales = 10 - 0 - 0 = 10
    // Total sales = 150.00
    expect(stats.summary.dailyRevenue).toBe("$150.00");
    expect(stats.summary.totalOrders).toBe(2);

    // Weekly chart today's bucket
    const todayLabel = stats.revenue[stats.revenue.length - 1];
    expect(todayLabel.sales).toBe(150);
    expect(todayLabel.tax).toBe(9);
    expect(todayLabel.tips).toBe(16);
    expect(todayLabel.value).toBe(175);
    expect(todayLabel.processingFee).toBe(-4.8);
  });

  it("calculates ticket times and dynamic change subtitles", async () => {
    const now = new Date();
    const todayCreated = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const todayClosed = now.toISOString();

    const mockOrders = [
      {
        id: "order-1",
        state: "COMPLETED",
        total_money: 50.0,
        total_tax_money: 4.0,
        total_tip_money: 6.0,
        created_at: todayCreated,
        closed_at: todayClosed, // 10 minute ticket time
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "pos_orders") {
        return createMockSupabaseQuery(mockOrders);
      }
      return createMockSupabaseQuery([]);
    });

    const stats = await service.getAggregatedStats();

    expect(stats.summary.averageTicketTime).toBe("10m");
    expect(stats.summary.dailyRevenueChange).toContain("from yesterday");
  });

  it("publishes update event to pubSub", async () => {
    (supabase.from as jest.Mock).mockImplementation(() =>
      createMockSupabaseQuery([]),
    );

    await service.publishStatsUpdate("test-org");

    expect(pubSub.publish).toHaveBeenCalledWith(
      "DASHBOARD_STATS_UPDATED",
      expect.objectContaining({
        orgId: "test-org",
      }),
    );
  });
});
