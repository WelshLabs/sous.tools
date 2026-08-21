import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { adjustThrottleTimeTool } from "../commands-tools";

@Command(adjustThrottleTimeTool)
export class AdjustThrottleTimeTool implements CommandTool {
  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Adding ${args.minutes} minutes to throttle time...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }
    return {
      success: true,
      message: `Throttle time adjusted.`,
    };
  }
}
