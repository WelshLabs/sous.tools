import { Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { randomUUID } from "crypto";
import { OmniMessage } from "@soustools/api-types";
import { supabase } from "../../../core/database/supabase";
import { ChatPersistenceService } from "../chat-persistence.service";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { ingestDocumentTool } from "../commands-tools";

@Command(ingestDocumentTool)
export class IngestDocumentTool implements CommandTool {
  private readonly logger = new Logger(IngestDocumentTool.name);

  constructor(
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue,
    private readonly chatPersistence: ChatPersistenceService,
  ) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Document received. Sending to the ingestion pipeline...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    const userId = context.userId || "d0000000-0000-0000-0000-000000000000";
    const orgId = context.orgId;
    const conversationId = context.conversationId;

    const fileUrlToIngest =
      typeof args?.fileUrl === "string" &&
      (args.fileUrl.startsWith("data:") ||
        args.fileUrl.startsWith("http://") ||
        args.fileUrl.startsWith("https://"))
        ? args.fileUrl
        : context.lastUserMessage?.attachments?.[0]?.url ||
          context.payload?.attachments?.[0]?.url ||
          (typeof args?.fileUrl === "string" ? args.fileUrl : "");

    const { data: review, error } = await supabase
      .from("ingestion_reviews")
      .insert({
        organization_id: orgId,
        user_id: userId,
        source: "omnibar",
        source_document_url: fileUrlToIngest,
        raw_text: "",
        parsed_data: { processing: true },
        status: "PENDING",
      })
      .select()
      .single();

    if (!error && review) {
      await this.ingestionQueue.add(
        "process-ingestion",
        {
          organizationId: orgId,
          userId: userId,
          source: "omnibar",
          documentType: "recipe",
          sourceDocumentUrl: fileUrlToIngest,
          reviewId: review.id,
          conversationId: conversationId,
        },
        { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
      );

      // Create real-time notification record in Postgres
      try {
        await supabase.from("notifications").insert({
          organization_id: orgId,
          user_id: userId,
          title: "Document Ingestion Started",
          message: `Document processing queued (${review.id.substring(0, 8)}).`,
          link: `/home?chat=${conversationId}`,
          is_read: false,
        });
      } catch (notifErr) {
        this.logger.warn("Failed to create notification record:", notifErr);
      }

      // Emit and persist render_component message so /home and /answer UI switches to UniversalReviewComponent
      const renderMsg: OmniMessage = {
        id: randomUUID(),
        role: "render_component" as any,
        content: JSON.stringify({
          componentName: "INGESTION_REVIEW",
          props: { reviewId: review.id },
        }),
        timestamp: new Date(),
      };

      if (context.emitMessage) {
        context.emitMessage(renderMsg);
      }
      await this.chatPersistence.appendMessage(
        conversationId,
        orgId,
        userId,
        renderMsg,
      );

      return {
        success: true,
        reviewId: review.id,
        message: `Successfully queued document for ingestion. Review panel opened.`,
      };
    } else {
      return {
        success: false,
        error: `Failed to create ingestion review: ${error?.message}`,
      };
    }
  }
}
