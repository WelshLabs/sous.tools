import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { getRecipeCostTool } from "../commands-tools";
import { RecipeCostService } from "../../recipe/recipe-cost.service";

@Command(getRecipeCostTool)
export class GetRecipeCostTool implements CommandTool {
  constructor(private readonly recipeCostService: RecipeCostService) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Calculating cost for recipe...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    try {
      const cost = await this.recipeCostService.getRecipeCost(args.recipeId);
      return { success: true, cost };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
