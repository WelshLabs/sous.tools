import { Field, ObjectType, Int } from "@nestjs/graphql";

@ObjectType()
export class RevenueChartItem {
  @Field()
  name!: string;

  @Field(() => Int)
  value!: number;

  @Field(() => Number, { nullable: true })
  sales?: number;

  @Field(() => Number, { nullable: true })
  tax?: number;

  @Field(() => Number, { nullable: true })
  tips?: number;

  @Field(() => Number, { nullable: true })
  processingFee?: number;
}

@ObjectType()
export class TicketTimeChartItem {
  @Field()
  time!: string;

  @Field(() => Int)
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

  @Field()
  averageTicketTime!: string;

  @Field()
  dailyRevenue!: string;

  @Field(() => Int)
  activeTables!: number;
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
