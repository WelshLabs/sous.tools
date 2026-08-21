import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { ingestKnowledgeSourceTool } from "../commands-tools";

@Command(ingestKnowledgeSourceTool)
export class IngestKnowledgeSourceTool implements CommandTool {
  constructor(
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue,
  ) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Ingesting knowledge source (${args.scope} scope)...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    try {
      const job = await this.ingestionQueue.add(
        "ingest-knowledge",
        {
          organizationId: context.orgId,
          sourceUrl: args.sourceUrl,
          sourceName: args.sourceName ?? null,
          scope: args.scope,
          instructions: args.instructions,
        },
        { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
      );
      return {
        success: true,
        jobId: job.id,
        scope: args.scope,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
