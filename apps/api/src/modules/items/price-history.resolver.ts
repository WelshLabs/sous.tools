import { Resolver, Query, Args } from "@nestjs/graphql";
import { PriceHistoryService } from "./price-history.service";
import { PriceHistoryGQL } from "./items.types";

@Resolver(() => PriceHistoryGQL)
export class PriceHistoryResolver {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Query(() => [PriceHistoryGQL], { name: "priceHistory" })
  async getPriceHistory(@Args("itemId") itemId: string): Promise<any[]> {
    return this.priceHistoryService.getHistory(itemId);
  }
}
