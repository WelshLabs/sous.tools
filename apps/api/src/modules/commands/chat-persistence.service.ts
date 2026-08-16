import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { OmniMessage } from "@soustools/api-types";
import { supabase } from "../../lib/supabase";

@Injectable()
export class ChatPersistenceService {
  private readonly logger = new Logger(ChatPersistenceService.name);

  /**
   * Single choke point for every write to chat_conversations / chat_messages.
   * Both the live WebSocket gateway/service and the BullMQ ingestion processor
   * must call this method so message ordering and org/user attribution stay
   * consistent no matter which process writes the message.
   */
  public async appendMessage(
    conversationId: string,
    orgId: string,
    userId: string | undefined,
    msg: OmniMessage,
  ): Promise<void> {
    if (!conversationId || !orgId) {
      this.logger.warn(
        `appendMessage called without conversationId or orgId (conversationId=${conversationId}, orgId=${orgId}); skipping write.`,
      );
      return;
    }

    const { data: existingConv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();

    if (!existingConv) {
      const title =
        msg.role === "user" && msg.content
          ? msg.content.slice(0, 80)
          : "New Conversation";
      await supabase.from("chat_conversations").insert({
        id: conversationId,
        organization_id: orgId,
        user_id: userId || null,
        title,
      });
    } else {
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    await supabase.from("chat_messages").insert({
      id: msg.id || randomUUID(),
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments || [],
    });
  }
}
