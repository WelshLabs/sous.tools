import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { addToWhiteboardTool } from "../commands-tools";
import { WhiteboardService } from "../../items/whiteboard.service";

@Command(addToWhiteboardTool)
export class AddToWhiteboardTool implements CommandTool {
  constructor(private readonly whiteboardService: WhiteboardService) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Adding ${args.quantity} ${args.unit} ${args.itemName} to the Whiteboard...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    const rawName = `${args.quantity} ${args.unit} ${args.itemName}`.trim();
    await this.whiteboardService.create({ raw_name: rawName });
    return {
      success: true,
      message: `Added to whiteboard.`,
    };
  }
}
