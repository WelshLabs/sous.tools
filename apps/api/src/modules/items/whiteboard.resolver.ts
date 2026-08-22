import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { WhiteboardService } from "./whiteboard.service";
import {
  WhiteboardItemGQL,
  CreateWhiteboardInputGQL,
} from "./items.types";

@Resolver(() => WhiteboardItemGQL)
export class WhiteboardResolver {
  constructor(private readonly whiteboardService: WhiteboardService) {}

  @Query(() => [WhiteboardItemGQL], { name: "whiteboard" })
  async getWhiteboard(): Promise<any[]> {
    const items = await this.whiteboardService.findAllActive();
    return items.map((i) => ({
      ...i,
      custom_name: i.raw_name,
    }));
  }

  @Mutation(() => WhiteboardItemGQL, { name: "createWhiteboardItem" })
  async createWhiteboardItem(
    @Args("input") input: CreateWhiteboardInputGQL,
  ): Promise<any> {
    const item = await this.whiteboardService.create({
      raw_name: input.custom_name || "New Item",
    });
    return {
      ...item,
      custom_name: item.raw_name,
    };
  }

  @Mutation(() => Boolean, { name: "deleteWhiteboardItem" })
  async deleteWhiteboardItem(@Args("id") id: string): Promise<boolean> {
    await this.whiteboardService.remove(id);
    return true;
  }
}
