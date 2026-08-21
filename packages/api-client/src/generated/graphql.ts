/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type DashboardStatsPayload = {
  __typename?: "DashboardStatsPayload";
  inventoryAlerts: Array<InventoryAlertItem>;
  revenue: Array<RevenueChartItem>;
  summary: DashboardSummary;
  ticketTimes: Array<TicketTimeChartItem>;
};

export type DashboardSummary = {
  __typename?: "DashboardSummary";
  activeTables: Scalars["Int"]["output"];
  activeTablesSubtitle?: Maybe<Scalars["String"]["output"]>;
  averageTicketTime: Scalars["String"]["output"];
  averageTicketTimeChange?: Maybe<Scalars["String"]["output"]>;
  dailyRevenue: Scalars["String"]["output"];
  dailyRevenueChange?: Maybe<Scalars["String"]["output"]>;
  totalOrders: Scalars["Int"]["output"];
  totalOrdersChange?: Maybe<Scalars["String"]["output"]>;
};

export type HealthStatus = {
  __typename?: "HealthStatus";
  status: Scalars["String"]["output"];
  timestamp: Scalars["String"]["output"];
};

export type InventoryAlertItem = {
  __typename?: "InventoryAlertItem";
  item: Scalars["String"]["output"];
  quantity: Scalars["String"]["output"];
  status: Scalars["String"]["output"];
};

export type Query = {
  __typename?: "Query";
  dashboardStats: DashboardStatsPayload;
  healthCheck: HealthStatus;
};

export type QueryDashboardStatsArgs = {
  orgId?: InputMaybe<Scalars["String"]["input"]>;
};

export type RevenueChartItem = {
  __typename?: "RevenueChartItem";
  name: Scalars["String"]["output"];
  processingFee?: Maybe<Scalars["Float"]["output"]>;
  sales?: Maybe<Scalars["Float"]["output"]>;
  tax?: Maybe<Scalars["Float"]["output"]>;
  tips?: Maybe<Scalars["Float"]["output"]>;
  value: Scalars["Float"]["output"];
};

export type Subscription = {
  __typename?: "Subscription";
  dashboardStatsUpdated: DashboardStatsPayload;
};

export type SubscriptionDashboardStatsUpdatedArgs = {
  orgId?: InputMaybe<Scalars["String"]["input"]>;
};

export type TicketTimeChartItem = {
  __typename?: "TicketTimeChartItem";
  minutes: Scalars["Float"]["output"];
  time: Scalars["String"]["output"];
};

export type HealthCheckQueryVariables = Exact<{ [key: string]: never }>;

export type HealthCheckQuery = {
  healthCheck: { status: string; timestamp: string };
};

export type DashboardStatsQueryVariables = Exact<{
  orgId?: string | null | undefined;
}>;

export type DashboardStatsQuery = {
  dashboardStats: {
    revenue: Array<{
      name: string;
      value: number;
      sales: number | null;
      tax: number | null;
      tips: number | null;
      processingFee: number | null;
    }>;
    ticketTimes: Array<{ time: string; minutes: number }>;
    inventoryAlerts: Array<{ item: string; status: string; quantity: string }>;
    summary: {
      totalOrders: number;
      averageTicketTime: string;
      dailyRevenue: string;
      activeTables: number;
      dailyRevenueChange: string | null;
      totalOrdersChange: string | null;
      averageTicketTimeChange: string | null;
      activeTablesSubtitle: string | null;
    };
  };
};

export type DashboardStatsUpdatedSubscriptionVariables = Exact<{
  orgId?: string | null | undefined;
}>;

export type DashboardStatsUpdatedSubscription = {
  dashboardStatsUpdated: {
    revenue: Array<{
      name: string;
      value: number;
      sales: number | null;
      tax: number | null;
      tips: number | null;
      processingFee: number | null;
    }>;
    ticketTimes: Array<{ time: string; minutes: number }>;
    inventoryAlerts: Array<{ item: string; status: string; quantity: string }>;
    summary: {
      totalOrders: number;
      averageTicketTime: string;
      dailyRevenue: string;
      activeTables: number;
      dailyRevenueChange: string | null;
      totalOrdersChange: string | null;
      averageTicketTimeChange: string | null;
      activeTablesSubtitle: string | null;
    };
  };
};

export const HealthCheckDocument = gql`
  query HealthCheck {
    healthCheck {
      status
      timestamp
    }
  }
`;

export function useHealthCheckQuery(
  options?: Omit<Urql.UseQueryArgs<HealthCheckQueryVariables>, "query">,
) {
  return Urql.useQuery<HealthCheckQuery, HealthCheckQueryVariables>({
    query: HealthCheckDocument,
    ...options,
  });
}
export const DashboardStatsDocument = gql`
  query DashboardStats($orgId: String) {
    dashboardStats(orgId: $orgId) {
      revenue {
        name
        value
        sales
        tax
        tips
        processingFee
      }
      ticketTimes {
        time
        minutes
      }
      inventoryAlerts {
        item
        status
        quantity
      }
      summary {
        totalOrders
        averageTicketTime
        dailyRevenue
        activeTables
        dailyRevenueChange
        totalOrdersChange
        averageTicketTimeChange
        activeTablesSubtitle
      }
    }
  }
`;

export function useDashboardStatsQuery(
  options?: Omit<Urql.UseQueryArgs<DashboardStatsQueryVariables>, "query">,
) {
  return Urql.useQuery<DashboardStatsQuery, DashboardStatsQueryVariables>({
    query: DashboardStatsDocument,
    ...options,
  });
}
export const DashboardStatsUpdatedDocument = gql`
  subscription DashboardStatsUpdated($orgId: String) {
    dashboardStatsUpdated(orgId: $orgId) {
      revenue {
        name
        value
        sales
        tax
        tips
        processingFee
      }
      ticketTimes {
        time
        minutes
      }
      inventoryAlerts {
        item
        status
        quantity
      }
      summary {
        totalOrders
        averageTicketTime
        dailyRevenue
        activeTables
        dailyRevenueChange
        totalOrdersChange
        averageTicketTimeChange
        activeTablesSubtitle
      }
    }
  }
`;

export function useDashboardStatsUpdatedSubscription<
  TData = DashboardStatsUpdatedSubscription,
>(
  options?: Omit<
    Urql.UseSubscriptionArgs<DashboardStatsUpdatedSubscriptionVariables>,
    "query"
  >,
  handler?: Urql.SubscriptionHandler<DashboardStatsUpdatedSubscription, TData>,
) {
  return Urql.useSubscription<
    DashboardStatsUpdatedSubscription,
    TData,
    DashboardStatsUpdatedSubscriptionVariables
  >({ query: DashboardStatsUpdatedDocument, ...options }, handler);
}
