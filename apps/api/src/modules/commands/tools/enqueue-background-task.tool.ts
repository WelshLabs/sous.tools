import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { enqueueBackgroundTaskTool } from "../commands-tools";

@Command(enqueueBackgroundTaskTool)
export class EnqueueBackgroundTaskTool implements CommandTool {
  constructor(
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue,
  ) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Queuing background task: ${args.jobName}...`;
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
        args.jobName as string,
        args.payload as Record<string, any>,
        {
          priority: (args.priority as number) ?? 5,
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        },
      );
      return {
        success: true,
        jobId: job.id,
        jobName: args.jobName,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
