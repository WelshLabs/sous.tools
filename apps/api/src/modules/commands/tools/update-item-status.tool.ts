import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { updateItemStatusTool } from "../commands-tools";

@Command(updateItemStatusTool)
export class UpdateItemStatusTool implements CommandTool {
  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Updating item ${args.itemId} status to ${args.status}...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }
    return { success: true, message: `Status updated.` };
  }
}
