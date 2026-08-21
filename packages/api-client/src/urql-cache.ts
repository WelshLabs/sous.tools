import type { CacheExchangeOpts } from "@urql/exchange-graphcache";

/**
 * Default GraphCache configuration with optimistic UI support.
 */
export const defaultCacheConfig: CacheExchangeOpts = {
  keys: {
    HealthStatus: () => null,
    DashboardSummary: () => null,
    DashboardStatsPayload: () => null,
    RevenueChartItem: () => null,
    TicketTimeChartItem: () => null,
    InventoryAlertItem: () => null,
  },
  resolvers: {},
  updates: {
    Subscription: {
      dashboardStatsUpdated(result, _args, cache) {
        if (result.dashboardStatsUpdated) {
          cache.updateQuery(
            { query: `query DashboardStats { dashboardStats { ... } }` },
            (data: any) => {
              if (!data) return data;
              return {
                ...data,
                dashboardStats: result.dashboardStatsUpdated,
              };
            },
          );
        }
      },
    },
  },
};
