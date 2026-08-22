import { Field, ObjectType, Int, Float } from "@nestjs/graphql";

@ObjectType()
export class RevenueChartItem {
  @Field()
  name!: string;

  @Field(() => Float)
  value!: number;

  @Field(() => Float, { nullable: true })
  sales?: number;

  @Field(() => Float, { nullable: true })
  tax?: number;

  @Field(() => Float, { nullable: true })
  tips?: number;

  @Field(() => Float, { nullable: true })
  processingFee?: number;
}

@ObjectType()
export class TicketTimeChartItem {
  @Field()
  time!: string;

  @Field(() => Float)
  minutes!: number;
}

@ObjectType()
export class InventoryAlertItem {
  @Field()
  item!: string;

  @Field()
  status!: string;

  @Field()
  quantity!: string;
}

@ObjectType()
export class DashboardSummary {
  @Field(() => Int)
  totalOrders!: number;

  @Field(() => Int, { nullable: true })
  weeklyOrders?: number;

  @Field(() => Int, { nullable: true })
  allTimeOrders?: number;

  @Field()
  averageTicketTime!: string;

  @Field({ nullable: true })
  weeklyAverageTicketTime?: string;

  @Field()
  dailyRevenue!: string;

  @Field({ nullable: true })
  weeklyRevenue?: string;

  @Field({ nullable: true })
  allTimeRevenue?: string;

  @Field(() => Int)
  activeTables!: number;

  @Field({ nullable: true })
  dailyRevenueChange?: string;

  @Field({ nullable: true })
  totalOrdersChange?: string;

  @Field({ nullable: true })
  averageTicketTimeChange?: string;

  @Field({ nullable: true })
  activeTablesSubtitle?: string;
}

@ObjectType()
export class DashboardStatsPayload {
  @Field(() => [RevenueChartItem])
  revenue!: RevenueChartItem[];

  @Field(() => [TicketTimeChartItem])
  ticketTimes!: TicketTimeChartItem[];

  @Field(() => [InventoryAlertItem])
  inventoryAlerts!: InventoryAlertItem[];

  @Field(() => DashboardSummary)
  summary!: DashboardSummary;
}
