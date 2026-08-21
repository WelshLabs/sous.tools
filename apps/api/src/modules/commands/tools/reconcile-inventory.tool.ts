import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { reconcileInventoryTool } from "../commands-tools";

@Command(reconcileInventoryTool)
export class ReconcileInventoryTool implements CommandTool {
  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Setting inventory for ${args.itemId} to ${args.quantity} ${args.unit}...`;
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
      message: `Inventory reconciled.`,
    };
  }
}
