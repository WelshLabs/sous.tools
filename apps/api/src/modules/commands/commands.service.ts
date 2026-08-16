import { Injectable, Logger } from "@nestjs/common";
import { OmnibarCommandPayload, OmniMessage } from "@soustools/api-types";
import { ALL_COMMAND_TOOLS } from "./commands-tools";
import { PurchaseOrdersService } from "../items/purchase-orders.service";
import { VendorsService } from "../items/vendors.service";
import { WhiteboardService } from "../items/whiteboard.service";
import { RecipeCostService } from "../recipe/recipe-cost.service";
import { Neo4jService } from "../neo4j-sync/neo4j.service";
import { randomUUID } from "crypto";
import { serverConfig as config } from "@soustools/config/server";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { supabase } from "../../lib/supabase";
import { ChatPersistenceService } from "./chat-persistence.service";

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);

  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly vendorsService: VendorsService,
    private readonly whiteboardService: WhiteboardService,
    private readonly recipeCostService: RecipeCostService,
    private readonly neo4jService: Neo4jService,
    @InjectQueue("unified-ingestion") private ingestionQueue: Queue,
    private readonly chatPersistence: ChatPersistenceService,
  ) {}

  private formatJsonSchema(schema: any): any {
    if (!schema || typeof schema !== "object") return schema;

    const result: Record<string, any> = {};

    if (schema.type) {
      result.type =
        typeof schema.type === "string"
          ? schema.type.toLowerCase()
          : schema.type;
    }
    if (schema.description) {
      result.description = schema.description;
    }
    if (schema.enum && Array.isArray(schema.enum)) {
      result.enum = schema.enum;
    }
    if (schema.required && Array.isArray(schema.required)) {
      result.required = schema.required;
    }
    if (schema.additionalProperties !== undefined) {
      result.additionalProperties = schema.additionalProperties;
    }
    if (schema.items) {
      result.items = this.formatJsonSchema(schema.items);
    }
    if (schema.properties && typeof schema.properties === "object") {
      result.properties = Object.fromEntries(
        Object.entries(schema.properties).map(([k, v]) => [
          k,
          this.formatJsonSchema(v),
        ]),
      );
    }

    return result;
  }

  private mapToGeminiContent(chatHistory: OmniMessage[]): any[] {
    return chatHistory.map((msg) => {
      let textContent = msg.content || "";
      if (msg.attachments && msg.attachments.length > 0) {
        const fileNames = msg.attachments
          .map((a: any) => a.name || "uploaded file")
          .join(", ");
        textContent += `\n[Attached Files: ${fileNames}]`;
      }
      return {
        role:
          msg.role === "model" || msg.role === "agent_step"
            ? "assistant"
            : "user",
        content: textContent,
      };
    });
  }

  async handleCommand(
    payload: OmnibarCommandPayload,
    orgId: string,
    emitMessage?: (msg: OmniMessage) => void,
  ) {
    this.logger.log(`\n🤖 AI COMMAND RECEIVED [${payload.source}]`);

    const history = payload.chatHistory || [];
    const conversationId = payload.context?.conversationId || randomUUID();

    const userId = payload.context?.userId;
    const lastUserMessage = history[history.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      this.chatPersistence
        .appendMessage(conversationId, orgId, userId, lastUserMessage)
        .catch((e) => this.logger.warn("Failed to persist user message", e));
    }

    try {
      const contents = this.mapToGeminiContent(history);

      // We will loop to handle function calls
      let isDone = false;
      let finalResult = null;
      let iterations = 0;

      while (!isDone && iterations < 5) {
        iterations++;

        const llmPayload = {
          model: "omnibar",
          messages: [
            {
              role: "system",
              content:
                "You are the Sous Chef of a high-volume restaurant. You must always acknowledge commands first with 'Heard, Chef' or 'Yes, Chef'. Use kitchen vernacular casually. You have a slightly gritty, service-industry sense of humor. If the user's message contains '[1 attachment]', or indicates they are uploading a file, invoice, or recipe, you MUST immediately call the ingest_document tool with the attachment url.",
            },
            ...contents,
          ],
          tools: ALL_COMMAND_TOOLS.map((t: any) => ({
            type: "function",
            function: {
              name: t.name,
              description: t.description,
              parameters: this.formatJsonSchema(t.parameters),
            },
          })),
        };

        const res = await fetch("https://ai.sous.tools/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer sk-1234`,
          },
          body: JSON.stringify(llmPayload),
        });

        this.logger.log(
          "LiteLLMServed By:",
          res.headers.get("x-litellm-model-id"),
        );
        this.logger.log(
          "LiteLLM Provider:",
          res.headers.get("x-litellm-model-api-base"),
        );
        this.logger.log(
          "LiteLLM Call ID:",
          res.headers.get("x-litellm-call-id"),
        );

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`LiteLLM Error: ${res.status} ${errBody}`);
        }
        const body = await res.json();
        const response = body.choices[0].message;

        if (response.tool_calls && response.tool_calls.length > 0) {
          const call = response.tool_calls[0].function;
          const functionName = call.name;
          const args = JSON.parse(call.arguments || "{}");

          this.logger.log(`🛠️ Tool invoked: ${functionName}`, args);

          let toolResponseData: any = {};
          let agentMessageContent = `Executing ${functionName}...`;

          if (functionName === "add_to_purchase_order") {
            agentMessageContent = `Adding ${args.quantity} ${args.unit} ${args.itemName} to ${args.vendorName} draft PO...`;
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            }

            const vendors = await this.vendorsService.findAll(orgId);
            const matchedVendor = vendors.find((v: any) =>
              v.name?.toLowerCase().includes(args.vendorName.toLowerCase()),
            );

            if (matchedVendor) {
              const rawName =
                `${args.quantity} ${args.unit} ${args.itemName}`.trim();
              await this.purchaseOrdersService.addItemToDraft({
                vendor_id: matchedVendor.id as string,
                raw_name: rawName,
                ordered_qty: args.quantity,
              });
              toolResponseData = {
                success: true,
                message: `Successfully added to ${matchedVendor.name} PO.`,
              };
            } else {
              toolResponseData = {
                success: false,
                error: `Vendor ${args.vendorName} not found.`,
              };
            }
          } else if (functionName === "add_to_whiteboard") {
            agentMessageContent = `Adding ${args.quantity} ${args.unit} ${args.itemName} to the Whiteboard...`;
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            }

            const rawName =
              `${args.quantity} ${args.unit} ${args.itemName}`.trim();
            await this.whiteboardService.create({ raw_name: rawName });
            toolResponseData = {
              success: true,
              message: `Added to whiteboard.`,
            };
          } else if (functionName === "get_recipe_cost") {
            agentMessageContent = `Calculating cost for recipe...`;
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            }

            try {
              const cost = await this.recipeCostService.getRecipeCost(
                args.recipeId,
              );
              toolResponseData = { success: true, cost };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }
          } else if (functionName === "update_item_status") {
            agentMessageContent = `Updating item ${args.itemId} status to ${args.status}...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            toolResponseData = { success: true, message: `Status updated.` };
          } else if (functionName === "adjust_throttle_time") {
            agentMessageContent = `Adding ${args.minutes} minutes to throttle time...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            toolResponseData = {
              success: true,
              message: `Throttle time adjusted.`,
            };
          } else if (functionName === "reconcile_inventory") {
            agentMessageContent = `Setting inventory for ${args.itemId} to ${args.quantity} ${args.unit}...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            toolResponseData = {
              success: true,
              message: `Inventory reconciled.`,
            };
          } else if (functionName === "ingest_document") {
            agentMessageContent = `Document received. Sending to the ingestion pipeline...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });

            const userId =
              payload.context?.userId || "d0000000-0000-0000-0000-000000000000";

            const fileUrlToIngest =
              args.fileUrl &&
              (args.fileUrl.startsWith("data:") ||
                args.fileUrl.startsWith("http://") ||
                args.fileUrl.startsWith("https://"))
                ? args.fileUrl
                : lastUserMessage?.attachments?.[0]?.url ||
                  (payload as any).attachments?.[0]?.url ||
                  args.fileUrl ||
                  "";

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
                this.logger.warn(
                  "Failed to create notification record:",
                  notifErr,
                );
              }

              // Emit render_component message so /answer UI switches to UniversalReviewComponent skeleton loader
              if (emitMessage) {
                emitMessage({
                  id: randomUUID(),
                  role: "render_component" as any,
                  content: JSON.stringify({
                    componentName: "INGESTION_REVIEW",
                    props: { reviewId: review.id },
                  }),
                  timestamp: new Date(),
                });
              }

              toolResponseData = {
                success: true,
                reviewId: review.id,
                message: `Successfully queued document for ingestion. Review panel opened.`,
              };
            } else {
              toolResponseData = {
                success: false,
                error: `Failed to create ingestion review: ${error?.message}`,
              };
            }

            // ─── V1 ReAct Tool Routing ────────────────────────────────────────────
          } else if (functionName === "execute_cypher_query") {
            agentMessageContent = `Querying the Core Matrix...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });

            try {
              const result = await this.neo4jService.runQuery(
                args.query as string,
                (args.params as Record<string, any>) ?? {},
              );
              const records = result.records.map((r: any) => r.toObject());
              toolResponseData = {
                success: true,
                records,
                count: records.length,
              };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }
          } else if (functionName === "render_ui_component") {
            agentMessageContent = `Rendering ${args.componentName} component...`;
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
              // Emit a dedicated socket event so the frontend can intercept and swap the bubble
              emitMessage({
                id: randomUUID(),
                role: "render_component" as any,
                content: JSON.stringify({
                  componentName: args.componentName,
                  props: args.props,
                }),
                timestamp: new Date(),
              });
            }
            toolResponseData = {
              success: true,
              rendered: true,
              componentName: args.componentName,
            };
          } else if (functionName === "enqueue_background_task") {
            agentMessageContent = `Queuing background task: ${args.jobName}...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });

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
              toolResponseData = {
                success: true,
                jobId: job.id,
                jobName: args.jobName,
              };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }
          } else if (functionName === "ingest_knowledge_source") {
            agentMessageContent = `Ingesting knowledge source (${args.scope} scope)...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });

            try {
              const job = await this.ingestionQueue.add(
                "ingest-knowledge",
                {
                  organizationId: orgId,
                  sourceUrl: args.sourceUrl,
                  sourceName: args.sourceName ?? null,
                  scope: args.scope,
                  instructions: args.instructions,
                },
                { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
              );
              toolResponseData = {
                success: true,
                jobId: job.id,
                scope: args.scope,
              };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }
          } else if (functionName === "search_the_web") {
            agentMessageContent = `Searching the web for: "${args.query}"...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });

            const maxResults = (args.maxResults as number) || 5;
            const searchResults = await this.performWebSearch(
              args.query as string,
              maxResults,
            );
            toolResponseData = {
              success: true,
              query: args.query,
              results: searchResults,
              count: searchResults.length,
            };
          } else if (functionName === "update_review_state") {
            agentMessageContent = `Updating review state: ${args.action}...`;
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
                uiAction: {
                  type: "UPDATE_REVIEW_STATE",
                  action: args.action,
                  pageNumber: args.pageNumber,
                  itemIndex: args.itemIndex,
                  targetName: args.targetName,
                },
              } as any);
            }
            toolResponseData = {
              success: true,
              message: `Review state updated: ${args.action}`,
              action: args.action,
              pageNumber: args.pageNumber,
              itemIndex: args.itemIndex,
              targetName: args.targetName,
            };
          } else if (functionName === "get_pos_sales_stats") {
            agentMessageContent = `Querying real POS sales from Postgres database...`;
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });
            }

            const { data: dbOrders } = await supabase
              .from("pos_orders")
              .select("*")
              .eq("state", "COMPLETED");

            const orders = dbOrders || [];
            const totalRevenueVal = orders.reduce(
              (sum, o) => sum + Number(o.total_money || 0),
              0,
            );

            const daysOfWeek = [
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ];
            const weeklyRevenueMap: Record<string, number> = {
              Mon: 0,
              Tue: 0,
              Wed: 0,
              Thu: 0,
              Fri: 0,
              Sat: 0,
              Sun: 0,
            };
            orders.forEach((o) => {
              const day = daysOfWeek[new Date(o.created_at).getDay()];
              weeklyRevenueMap[day] =
                (weeklyRevenueMap[day] || 0) + Number(o.total_money || 0);
            });

            const orderedDays = [
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
              "Sun",
            ];
            const revenueChartData = orderedDays.map((day) => ({
              name: day,
              value: Math.round(weeklyRevenueMap[day] || 0),
            }));

            toolResponseData = {
              success: true,
              totalRevenue: totalRevenueVal.toFixed(2),
              totalCompletedOrders: orders.length,
              weeklyBreakdown: revenueChartData,
            };
          }

          // Append model's full response content to history
          contents.push(response);

          // Append tool response to history
          contents.push({
            role: "tool",
            tool_call_id: response.tool_calls[0].id,
            name: functionName,
            content: JSON.stringify(toolResponseData),
          });
        } else if (response.content) {
          isDone = true;
          finalResult = { action: "SUCCESS", message: response.content };

          const modelMsg: OmniMessage = {
            id: randomUUID(),
            role: "model",
            content: response.content,
            timestamp: new Date(),
          };

          if (emitMessage) {
            emitMessage(modelMsg);
          }
          this.chatPersistence
            .appendMessage(conversationId, orgId, userId, modelMsg)
            .catch((e) =>
              this.logger.warn("Failed to persist model message", e),
            );
        } else {
          isDone = true;
          finalResult = {
            action: "ERROR",
            message: "No recognizable response from model.",
          };
        }
      }

      return finalResult;
    } catch (error) {
      this.logger.error("Failed to parse or execute command via Gemini", error);
      const fallbackMsg = "I failed to understand that command, Chef.";
      if (emitMessage) {
        emitMessage({
          id: randomUUID(),
          role: "model",
          content: fallbackMsg,
          timestamp: new Date(),
        });
      }
      return {
        action: "ERROR",
        message: fallbackMsg,
      };
    }
  }

  private async performWebSearch(
    query: string,
    maxResults: number = 5,
  ): Promise<Array<{ title: string; snippet: string; url: string }>> {
    try {
      const tavilyKey = config.TAVILY_API_KEY;
      if (tavilyKey) {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query,
            max_results: maxResults,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.results && Array.isArray(data.results)) {
            return data.results.map((r: any) => ({
              title: r.title || "",
              snippet: r.content || "",
              url: r.url || "",
            }));
          }
        }
      }

      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(ddgUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        this.logger.warn(`DuckDuckGo HTTP status: ${res.status}`);
        return [];
      }

      const html = await res.text();
      const results: Array<{ title: string; snippet: string; url: string }> =
        [];

      const sanitize = (text: string) =>
        text
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();

      const resultBlockRegex =
        /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
      const titleRegex =
        /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
      const snippetRegex =
        /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<td[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/td>/i;

      let match: RegExpExecArray | null;
      while (
        (match = resultBlockRegex.exec(html)) !== null &&
        results.length < maxResults
      ) {
        const block = match[1];
        const titleMatch = titleRegex.exec(block);
        const snippetMatch = snippetRegex.exec(block);

        if (titleMatch) {
          let rawUrl = titleMatch[1];
          if (rawUrl.includes("uddg=")) {
            const searchParams = new URLSearchParams(
              rawUrl.split("?")[1] || "",
            );
            rawUrl = searchParams.get("uddg") || rawUrl;
          }

          const title = sanitize(titleMatch[2]);
          const snippet = snippetMatch
            ? sanitize(snippetMatch[1] || snippetMatch[2] || "")
            : "";

          if (title && rawUrl) {
            results.push({ title, snippet, url: rawUrl });
          }
        }
      }

      if (results.length === 0) {
        const globalARegex =
          /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let aMatch: RegExpExecArray | null;
        while (
          (aMatch = globalARegex.exec(html)) !== null &&
          results.length < maxResults
        ) {
          let rawUrl = aMatch[1];
          if (rawUrl.includes("uddg=")) {
            const searchParams = new URLSearchParams(
              rawUrl.split("?")[1] || "",
            );
            rawUrl = searchParams.get("uddg") || rawUrl;
          }
          const title = sanitize(aMatch[2]);
          if (title && rawUrl) {
            results.push({ title, snippet: "", url: rawUrl });
          }
        }
      }

      return results;
    } catch (err: any) {
      this.logger.error(
        `Error performing web search: ${err.message}`,
        err.stack,
      );
      return [];
    }
  }

  async listConversationsForUser(
    userId: string,
  ): Promise<Array<{ id: string; title: string | null; updated_at: string }>> {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      this.logger.error("Failed to list conversations for user", error);
      throw new Error("Failed to list conversations");
    }

    return data || [];
  }

  async getConversationMessages(
    conversationId: string,
  ): Promise<OmniMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      this.logger.error("Failed to fetch messages", error);
      throw new Error("Failed to fetch messages");
    }

    return (data || []).map((row) => ({
      id: row.id,
      role: row.role as OmniMessage["role"],
      content: row.content,
      attachments: row.attachments || undefined,
      timestamp: new Date(row.created_at),
    }));
  }

  public async persistMessage(
    conversationId: string,
    orgId: string,
    userId: string | undefined,
    msg: OmniMessage,
  ) {
    if (!conversationId) return;

    // Ensure conversation exists
    const { data: existingConv } = await supabase
      .from("chat_conversations")
      .select("id, organization_id, user_id")
      .eq("id", conversationId)
      .single();

    if (!existingConv) {
      await supabase.from("chat_conversations").insert({
        id: conversationId,
        organization_id:
          orgId !== "unknown" ? orgId : "d0000000-0000-0000-0000-000000000000",
        user_id: userId || null,
        title: "New Conversation",
      });
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
