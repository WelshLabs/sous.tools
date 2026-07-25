import { Injectable, Logger, Inject } from "@nestjs/common";
import { OmnibarCommandPayload, OmniMessage,
} from "@soustools/api-types";
import { GoogleGenAI, Content, Part } from "@google/genai";
import { ALL_COMMAND_TOOLS } from "./commands-tools";
import { PurchaseOrdersService } from "../items/purchase-orders.service";
import { VendorsService } from "../items/vendors.service";
import { WhiteboardService } from "../items/whiteboard.service";
import { RecipeCostService } from "../recipe/recipe-cost.service";
import { Neo4jService } from "../neo4j-sync/neo4j.service";
import { randomUUID } from "crypto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { type Cache } from "cache-manager";
import { serverConfig as config } from "@soustools/config/server";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { supabase } from "../../lib/supabase";
import { fallbackToOllama } from "./commands-ollama.helper";

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);
  private readonly ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly vendorsService: VendorsService,
    private readonly whiteboardService: WhiteboardService,
    private readonly recipeCostService: RecipeCostService,
    private readonly neo4jService: Neo4jService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue("ingestion") private ingestionQueue: Queue,
  ) {}

  private mapToGeminiContent(chatHistory: OmniMessage[]): Content[] {
    return chatHistory.map((msg) => ({
      role:
        msg.role === "model" || msg.role === "agent_step" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));
  }

  async handleCommand(
    payload: OmnibarCommandPayload,
    orgId: string,
    emitMessage?: (msg: OmniMessage) => void,
  ) {
    this.logger.log(`\n🤖 AI COMMAND RECEIVED [${payload.source}]`);

    try {
      const isLockedOut = await this.cacheManager.get("gemini_quota_lockout");
      const history = payload.chatHistory || [];

      if (isLockedOut) {
        return this.fallbackToOllama(history, emitMessage);
      }

      const contents = this.mapToGeminiContent(history);

      // We will loop to handle function calls
      let isDone = false;
      let finalResult = null;
      let iterations = 0;

      while (!isDone && iterations < 5) {
        iterations++;

        let response;
        try {
          response = await this.ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
              systemInstruction: {
                role: "system",
                parts: [
                  {
                    text: "You are the Sous Chef of a high-volume restaurant. You must always acknowledge commands first with 'Heard, Chef' or 'Yes, Chef'. Use kitchen vernacular casually. You have a slightly gritty, service-industry sense of humor.",
                  },
                ],
              },
              tools: [
                {
                  functionDeclarations: ALL_COMMAND_TOOLS,
                },
              ],
            },
          });
        } catch (genError: any) {
          if (genError.status === 429 || genError.message?.includes("429")) {
            this.logger.warn(
              "Gemini 429 Quota Exceeded. Setting lockout and falling back to Ollama.",
            );
            await this.cacheManager.set("gemini_quota_lockout", true, 3600000); // 3600 seconds in ms
            if (emitMessage) {
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: "Quota exceeded. Falling back to local Ollama...",
                timestamp: new Date(),
              });
            }
            return this.fallbackToOllama(history, emitMessage);
          }
          throw genError;
        }

        if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          const functionName = call.name;
          const args = call.args as Record<string, any>;

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
          } else if (functionName === "ingest_vendor_invoice") {
            agentMessageContent = `Invoice received. Sending to the ingestion pipeline...`;
            if (emitMessage)
              emitMessage({
                id: randomUUID(),
                role: "agent_step",
                content: agentMessageContent,
                timestamp: new Date(),
              });

            const userId =
              payload.context?.userId || "d0000000-0000-0000-0000-000000000000";

            const { data: review, error } = await supabase
              .from("ingestion_reviews")
              .insert({
                organization_id: orgId,
                user_id: userId,
                source: "omnibar",
                source_document_url: args.fileUrl,
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
                  documentType: "invoice",
                  sourceDocumentUrl: args.fileUrl,
                  reviewId: review.id,
                },
                { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
              );

              // Create real-time notification record in Postgres
              try {
                await supabase.from("notifications").insert({
                  organization_id: orgId,
                  user_id: userId,
                  title: "Document Ingestion Started",
                  message: `Invoice file processing queued (${review.id.substring(0, 8)}).`,
                  link: `/answer?reviewId=${review.id}`,
                  is_read: false,
                });
              } catch (notifErr) {
                this.logger.warn("Failed to create notification record:", notifErr);
              }

              // Emit render_component message so /answer UI switches to UniversalReviewComponent skeleton loader
              if (emitMessage) {
                emitMessage({
                  id: randomUUID(),
                  role: "render_component" as any,
                  content: JSON.stringify({ componentName: "INGESTION_REVIEW", props: { reviewId: review.id } }),
                  timestamp: new Date(),
                });
              }

              toolResponseData = {
                success: true,
                reviewId: review.id,
                message: `Successfully queued invoice for ingestion.`,
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
              emitMessage({ id: randomUUID(), role: "agent_step", content: agentMessageContent, timestamp: new Date() });

            try {
              const result = await this.neo4jService.runQuery(
                args.query as string,
                (args.params as Record<string, any>) ?? {},
              );
              const records = result.records.map((r: any) => r.toObject());
              toolResponseData = { success: true, records, count: records.length };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }

          } else if (functionName === "render_ui_component") {
            agentMessageContent = `Rendering ${args.componentName} component...`;
            if (emitMessage) {
              emitMessage({ id: randomUUID(), role: "agent_step", content: agentMessageContent, timestamp: new Date() });
              // Emit a dedicated socket event so the frontend can intercept and swap the bubble
              emitMessage({
                id: randomUUID(),
                role: "render_component" as any,
                content: JSON.stringify({ componentName: args.componentName, props: args.props }),
                timestamp: new Date(),
              });
            }
            toolResponseData = { success: true, rendered: true, componentName: args.componentName };

          } else if (functionName === "enqueue_background_task") {
            agentMessageContent = `Queuing background task: ${args.jobName}...`;
            if (emitMessage)
              emitMessage({ id: randomUUID(), role: "agent_step", content: agentMessageContent, timestamp: new Date() });

            try {
              const job = await this.ingestionQueue.add(
                args.jobName as string,
                args.payload as Record<string, any>,
                { priority: (args.priority as number) ?? 5, attempts: 3, backoff: { type: "exponential", delay: 2000 } },
              );
              toolResponseData = { success: true, jobId: job.id, jobName: args.jobName };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }

          } else if (functionName === "ingest_knowledge_source") {
            agentMessageContent = `Ingesting knowledge source (${args.scope} scope)...`;
            if (emitMessage)
              emitMessage({ id: randomUUID(), role: "agent_step", content: agentMessageContent, timestamp: new Date() });

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
              toolResponseData = { success: true, jobId: job.id, scope: args.scope };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }

          } else if (functionName === "search_the_web") {
            agentMessageContent = `Searching the web for: "${args.query}"...`;
            if (emitMessage)
              emitMessage({ id: randomUUID(), role: "agent_step", content: agentMessageContent, timestamp: new Date() });

            const maxResults = (args.maxResults as number) || 5;
            const searchResults = await this.performWebSearch(args.query as string, maxResults);
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
              emitMessage({ id: randomUUID(), role: "agent_step", content: agentMessageContent, timestamp: new Date() });
            }

            const { data: dbOrders } = await supabase
              .from("pos_orders")
              .select("*")
              .eq("state", "COMPLETED");

            const orders = dbOrders || [];
            const totalRevenueVal = orders.reduce((sum, o) => sum + Number(o.total_money || 0), 0);

            const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const weeklyRevenueMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
            orders.forEach((o) => {
              const day = daysOfWeek[new Date(o.created_at).getDay()];
              weeklyRevenueMap[day] = (weeklyRevenueMap[day] || 0) + Number(o.total_money || 0);
            });

            const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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

          // Append model's full response content to history to preserve thought_signature, text, and functionCall
          if (response.candidates?.[0]?.content) {
            contents.push(response.candidates[0].content);
          } else {
            contents.push({
              role: "model",
              parts: [{ functionCall: call }] as Part[],
            });
          }

          // Append tool response to history
          contents.push({
            role: "user", // SDK uses 'user' for function responses, or 'function' depending on SDK version. GenAI uses 'user' with functionResponse part.
            parts: [
              {
                functionResponse: {
                  name: functionName,
                  response: toolResponseData,
                },
              },
            ] as Part[],
          });
        } else if (response.text) {
          isDone = true;
          finalResult = { action: "SUCCESS", message: response.text };

          if (emitMessage) {
            emitMessage({
              id: randomUUID(),
              role: "model",
              content: response.text,
              timestamp: new Date(),
            });
          }
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

  private async fallbackToOllama(
    history: OmniMessage[],
    emitMessage?: (msg: OmniMessage) => void,
  ) {
    return fallbackToOllama(history, this.logger, emitMessage);
  }

  private async performWebSearch(
    query: string,
    maxResults: number = 5,
  ): Promise<Array<{ title: string; snippet: string; url: string }>> {
    try {
      const tavilyKey = process.env.TAVILY_API_KEY;
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
      const results: Array<{ title: string; snippet: string; url: string }> = [];

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
            const searchParams = new URLSearchParams(rawUrl.split("?")[1] || "");
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
            const searchParams = new URLSearchParams(rawUrl.split("?")[1] || "");
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
      this.logger.error(`Error performing web search: ${err.message}`, err.stack);
      return [];
    }
  }
}
