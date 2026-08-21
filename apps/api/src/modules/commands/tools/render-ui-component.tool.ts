import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { renderUiComponentTool } from "../commands-tools";

@Command(renderUiComponentTool)
export class RenderUiComponentTool implements CommandTool {
  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Rendering ${args.componentName} component...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
      // Emit a dedicated socket event so the frontend can intercept and swap the bubble
      context.emitMessage({
        id: randomUUID(),
        role: "render_component" as any,
        content: JSON.stringify({
          componentName: args.componentName,
          props: args.props,
        }),
        timestamp: new Date(),
      });
    }
    return {
      success: true,
      rendered: true,
      componentName: args.componentName,
    };
  }
}
