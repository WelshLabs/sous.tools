import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { updateReviewStateTool } from "../commands-tools";

@Command(updateReviewStateTool)
export class UpdateReviewStateTool implements CommandTool {
  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Updating review state: ${args.action}...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
        uiAction: {
          type: "UPDATE_REVIEW_STATE",
          action: args.action,
          pageNumber: args.pageNumber,
          itemIndex: args.itemIndex,
          targetName: args.targetName,
        },
      } as any);
    }
    return {
      success: true,
      message: `Review state updated: ${args.action}`,
      action: args.action,
      pageNumber: args.pageNumber,
      itemIndex: args.itemIndex,
      targetName: args.targetName,
    };
  }
}
