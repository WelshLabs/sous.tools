import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { executeCypherQueryTool } from "../commands-tools";
import { Neo4jService } from "../../neo4j-sync/neo4j.service";

@Command(executeCypherQueryTool)
export class ExecuteCypherQueryTool implements CommandTool {
  constructor(private readonly neo4jService: Neo4jService) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Querying the Core Matrix...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    try {
      const result = await this.neo4jService.runQuery(
        args.query as string,
        (args.params as Record<string, any>) ?? {},
      );
      const records = result.records.map((r: any) => r.toObject());
      return {
        success: true,
        records,
        count: records.length,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
