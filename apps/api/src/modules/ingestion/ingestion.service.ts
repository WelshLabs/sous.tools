import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { RecipeMathService } from "../recipe/recipe-math.service";
import { createHash } from "crypto";
import { supabase } from "../../core/database/supabase";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
import { serverConfig as config } from "@soustools/config/server";
import {
  normalizeCulinaryTerms,
  CULINARY_DICTIONARY,
} from "./culinary-normalizer";

export { normalizeCulinaryTerms, CULINARY_DICTIONARY };

export interface ExtractedBlock {
  id: string;
  type: "PROSE" | "RECIPE" | "INVOICE";
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  content?: string;
  // Recipe fields
  title?: string;
  yieldCount?: number;
  yieldUnit?: string;
  instructions?: string[];
  ingredients?: Array<{
    rawName: string;
    guessName: string;
    normalizedName?: string;
    quantity?: number;
    unit?: string;
    originalInputString?: string;
    standardAmount?: number;
    standardUnit?: string;
    standardWeightG?: number;
    calculationType?: "fixed_weight" | "bakers_percentage";
    isReference?: boolean;
    baseCalculationGroup?: boolean;
    bakersPercentage?: number | null;
    tenantMatches: Array<{ id: string; name: string; score?: number }>;
    usdaMatches: Array<{ fdcId: number; description: string; score?: number }>;
    selectedTenantId?: string;
    selectedUsdaId?: number;
    autoAccepted?: boolean;
    resolutionError?: boolean;
  }>;
  // Invoice fields
  vendorName?: string;
  vendorId?: string;
  invoiceNumber?: string;
  invoiceId?: string;
  date?: string;
  invoiceDate?: string;
  documentHash?: string;
  idempotencyHash?: string;
  isDuplicate?: boolean;
  resolutionError?: boolean;
  totals?: { subtotal?: number; tax?: number; total?: number };
  lineItems?: Array<{
    rawName: string;
    guessName: string;
    normalizedName?: string;
    quantity?: number;
    unitPrice?: number;
    extendedPrice?: number;
    tenantMatches: Array<{ id: string; name: string; score?: number }>;
    usdaMatches: Array<{ fdcId: number; description: string; score?: number }>;
    selectedTenantId?: string;
    selectedUsdaId?: number;
    autoAccepted?: boolean;
    resolutionError?: boolean;
  }>;
  extractionConfidence?: number;
  critiqueNotes?: string;
  rawUnmappedData?: Record<string, any>;
  debateOccurred?: boolean;
  triageType?: string;
}

export interface IngestionPage {
  pageNumber: number;
  imageUrl?: string;
  blocks: ExtractedBlock[];
}

export interface IngestionReviewPayload {
  pages: IngestionPage[];
  fallbackUsed?: boolean;
  extractionError?: string;
  documentHash?: string;
  idempotencyHash?: string;
  isDuplicate?: boolean;
  triageType?: string;
  critiqueSummary?: string;
  debateOccurred?: boolean;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly neo4jSync: Neo4jSyncService,
    @Optional() private readonly recipeMathService?: RecipeMathService,
  ) {}

  async normalizeCulinaryTerms(
    rawItemName: string,
    options?: { useLlmFallback?: boolean },
  ): Promise<string> {
    return normalizeCulinaryTerms(rawItemName, options);
  }

  /**
   * Generates a deterministic SHA-256 idempotency hash from vendor_id + invoice_id + date.
   */
  computeIdempotencyHash(
    vendorId?: string | null,
    invoiceId?: string | null,
    date?: string | null,
  ): string {
    const v = (vendorId || "").trim().toLowerCase();
    const i = (invoiceId || "").trim().toLowerCase();
    const d = (date || "").trim().toLowerCase();
    return createHash("sha256").update(`${v}:${i}:${d}`).digest("hex");
  }

  async checkDuplicateInvoice(
    orgId: string,
    vendorIdOrName: string,
    invoiceNumber: string,
    invoiceDate?: string,
  ): Promise<boolean> {
    try {
      let query = supabase
        .from("invoices")
        .select("id")
        .eq("organization_id", orgId)
        .eq("invoice_number", invoiceNumber);

      if (vendorIdOrName) {
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            vendorIdOrName,
          )
        ) {
          query = query.eq("vendor_id", vendorIdOrName);
        }
      }

      if (invoiceDate) {
        query = query.eq("invoice_date", invoiceDate);
      }

      const { data } = await query.maybeSingle();
      if (data) return true;

      const hash = this.computeIdempotencyHash(
        vendorIdOrName,
        invoiceNumber,
        invoiceDate,
      );
      const { data: reviewMatch } = await supabase
        .from("ingestion_reviews")
        .select("id")
        .eq("organization_id", orgId)
        .filter("parsed_data->>idempotencyHash", "eq", hash)
        .maybeSingle();

      return !!reviewMatch;
    } catch (err) {
      this.logger.warn("Error checking duplicate invoice:", err);
      return false;
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const litellmRes = await fetch("https://ai.sous.tools/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.OPENAI_API_KEY || "sk-1234"}`,
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          input: [text],
        }),
      });

      if (litellmRes.ok) {
        const body = await litellmRes.json();
        if (body.data && body.data[0] && body.data[0].embedding) {
          return body.data[0].embedding;
        }
      }
      return [];
    } catch (err) {
      this.logger.error(
        `Failed to get embedding for "${text}" via LiteLLM:`,
        err,
      );
      return [];
    }
  }

  async searchMasterItemsTop5(
    queryEmbedding: number[],
    options?: {
      orgId?: string;
      vendorId?: string;
      rawItemName?: string;
    },
  ): Promise<Array<{ id: string; name: string; score?: number }>> {
    // 1. Check vendor_item_aliases first for confirmed alias mappings
    if (options?.orgId && options?.vendorId && options?.rawItemName) {
      try {
        const { data: alias } = await supabase
          .from("vendor_item_aliases")
          .select("item_id, vendor_item_string")
          .eq("organization_id", options.orgId)
          .eq("vendor_id", options.vendorId)
          .ilike("vendor_item_string", options.rawItemName.trim())
          .maybeSingle();

        if (alias && alias.item_id) {
          const { data: masterItem } = await supabase
            .from("master_items")
            .select("id, name")
            .eq("id", alias.item_id)
            .maybeSingle();

          if (masterItem) {
            this.logger.log(
              `Matched vendor_item_alias for "${options.rawItemName}" -> ${masterItem.name} (${masterItem.id})`,
            );
            return [{ id: masterItem.id, name: masterItem.name, score: 1.0 }];
          }
        }
      } catch (err) {
        this.logger.warn("Error querying vendor_item_aliases:", err);
      }
    }

    if (!queryEmbedding || queryEmbedding.length === 0) {
      const { data } = await supabase
        .from("master_items")
        .select("id, name")
        .limit(5);
      return (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        score: undefined,
      }));
    }
    try {
      const { data: matches, error } = await supabase.rpc(
        "match_master_items",
        {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: 0.2,
          match_count: 5,
        },
      );
      if (!error && matches && matches.length > 0) {
        return matches.map((m: any) => ({
          id: m.id,
          name: m.name,
          score:
            typeof m.similarity === "number"
              ? m.similarity
              : typeof m.score === "number"
                ? m.score
                : undefined,
        }));
      }
    } catch (err) {
      this.logger.warn("match_master_items RPC fallback:", err);
    }
    const { data } = await supabase
      .from("master_items")
      .select("id, name")
      .limit(5);
    return (data || []).map((d) => ({
      id: d.id,
      name: d.name,
      score: undefined,
    }));
  }

  async createReviewRecord(params: {
    organizationId: string;
    userId?: string;
    source: string;
    sourceName?: string;
    sourceDocumentUrl?: string;
    parsedData: IngestionReviewPayload;
    documentHash?: string;
  }) {
    const hash =
      params.documentHash ||
      params.parsedData?.documentHash ||
      params.parsedData?.idempotencyHash;

    if (hash) {
      try {
        const { data: existing } = await supabase
          .from("ingestion_reviews")
          .select("*")
          .eq("organization_id", params.organizationId)
          .filter("parsed_data->>idempotencyHash", "eq", hash)
          .maybeSingle();

        if (existing) {
          this.logger.warn(
            `Duplicate ingestion review detected for hash ${hash}, returning existing review ${existing.id}`,
          );
          return existing;
        }
      } catch (err) {
        this.logger.warn("Error querying existing review by hash:", err);
      }
    }

    const { data, error } = await supabase
      .from("ingestion_reviews")
      .insert({
        organization_id: params.organizationId,
        user_id: params.userId || null,
        source: params.source,
        source_name: params.sourceName || null,
        source_document_url: params.sourceDocumentUrl || null,
        parsed_data: params.parsedData as any,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      this.logger.error("Failed to insert ingestion_reviews:", error);
      throw error;
    }

    if (data) {
      await this.neo4jSync.handleWebhook({
        type: "INSERT",
        table: "ingestion_reviews",
        schema: "public",
        record: data,
        old_record: null,
      });
    }
    return data;
  }

  async getReviewRecord(id: string) {
    if (id === "latest") {
      const { data } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) {
        throw new NotFoundException("No ingestion reviews found");
      }
      return data;
    }

    const { data, error } = await supabase
      .from("ingestion_reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Ingestion review ${id} not found`);
    }
    return data;
  }

  async updateReviewRecordState(
    id: string,
    parsedData: IngestionReviewPayload,
  ) {
    const { data, error } = await supabase
      .from("ingestion_reviews")
      .update({
        parsed_data: parsedData as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update review record ${id}:`, error);
      throw error;
    }
    return data;
  }

  async commitReviewPayload(
    reviewId: string,
    approvedPayload: IngestionReviewPayload,
    orgId: string,
  ) {
    this.logger.log(`Committing approved review ${reviewId} for org ${orgId}`);

    const recipeIds: string[] = [];
    const vendorIds: string[] = [];

    for (const page of approvedPayload.pages) {
      for (const block of page.blocks) {
        if ((block as any).excluded) continue;

        if (block.type === "INVOICE") {
          const vId = await this.commitInvoiceBlock(block, orgId);
          if (vId) vendorIds.push(vId);
        } else if (block.type === "RECIPE") {
          const rId = await this.commitRecipeBlock(block, orgId);
          if (rId) recipeIds.push(rId);
        } else if (block.type === "PROSE") {
          await this.commitProseBlock(block, orgId);
        }
      }
    }

    const { data } = await supabase
      .from("ingestion_reviews")
      .update({ status: "APPROVED", updated_at: new Date().toISOString() })
      .eq("id", reviewId)
      .select()
      .single();

    if (data) {
      await this.neo4jSync.handleWebhook({
        type: "UPDATE",
        table: "ingestion_reviews",
        schema: "public",
        record: data,
        old_record: null,
      });
    }
    return {
      success: true,
      reviewId,
      recipeId: recipeIds[0] || null,
      recipeIds,
      vendorId: vendorIds[0] || null,
    };
  }

  private async commitInvoiceBlock(block: ExtractedBlock, orgId: string) {
    let vendorId: string | null = block.vendorId || null;
    if (!vendorId && block.vendorName) {
      const { data: existingVendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("organization_id", orgId)
        .ilike("name", block.vendorName)
        .maybeSingle();

      if (existingVendor) {
        vendorId = existingVendor.id;
      } else {
        const { data: newVendor } = await supabase
          .from("vendors")
          .insert({ organization_id: orgId, name: block.vendorName })
          .select("id")
          .single();
        if (newVendor) {
          vendorId = newVendor.id;
          await this.neo4jSync.handleWebhook({
            type: "INSERT",
            table: "vendors",
            schema: "public",
            record: newVendor,
            old_record: null,
          });
        }
      }
    }
    this.logger.log(`Invoice block vendor resolved: ${vendorId || "None"}`);

    const invoiceNumber =
      block.invoiceNumber || block.invoiceId || "INV-UNKNOWN";
    const invoiceDate =
      block.date || block.invoiceDate || new Date().toISOString().split("T")[0];
    const totalAmount = block.totals?.total ?? block.totals?.subtotal ?? 0;

    // Hash vendor_id + invoice_id + date before DB insertion to prevent duplicate ingestion
    const invoiceHash = this.computeIdempotencyHash(
      vendorId || block.vendorName || "",
      invoiceNumber,
      invoiceDate,
    );

    if (vendorId) {
      // Check if invoice already exists to prevent duplicate insertion
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("id")
        .eq("organization_id", orgId)
        .eq("vendor_id", vendorId)
        .eq("invoice_number", invoiceNumber)
        .maybeSingle();

      if (existingInvoice) {
        this.logger.warn(
          `Invoice ${invoiceNumber} for vendor ${vendorId} already exists (${existingInvoice.id}). Skipping insertion to prevent duplicate ingestion. Idempotency Hash: ${invoiceHash}`,
        );
      } else {
        const { data: newInvoice, error } = await supabase
          .from("invoices")
          .insert({
            organization_id: orgId,
            vendor_id: vendorId,
            invoice_number: invoiceNumber,
            total_amount: totalAmount,
            invoice_date: invoiceDate,
          })
          .select()
          .single();

        if (error) {
          this.logger.error("Failed to insert invoice record:", error);
        } else if (newInvoice) {
          await this.neo4jSync.handleWebhook({
            type: "INSERT",
            table: "invoices",
            schema: "public",
            record: newInvoice,
            old_record: null,
          });
        }
      }
    }

    if (block.lineItems) {
      for (const item of block.lineItems) {
        if (item.selectedTenantId && item.unitPrice) {
          const { data: updatedItem } = await supabase
            .from("master_items")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", item.selectedTenantId)
            .select()
            .single();

          if (updatedItem) {
            await this.neo4jSync.handleWebhook({
              type: "UPDATE",
              table: "master_items",
              schema: "public",
              record: updatedItem,
              old_record: null,
            });
          }
        }
      }
    }
    return vendorId;
  }

  private async commitRecipeBlock(
    block: ExtractedBlock,
    orgId: string,
  ): Promise<string | null> {
    const formattedInstructions = (block.instructions || []).map(
      (step: any, idx: number) => {
        if (typeof step === "string") {
          return {
            stepNumber: idx + 1,
            text: step,
            timerDurationSeconds: null,
          };
        }
        return {
          stepNumber: step.stepNumber || idx + 1,
          text: step.text || step.instruction || String(step),
          timerDurationSeconds: step.timerDurationSeconds || null,
        };
      },
    );

    const { data: recipe } = await supabase
      .from("recipes")
      .insert({
        organization_id: orgId,
        title: block.title || "Untitled Ingested Recipe",
        yield_count: block.yieldCount || 1,
        yield_unit: block.yieldUnit || "servings",
        instructions: formattedInstructions as any,
        status: "REFERENCE",
      })
      .select()
      .single();

    if (recipe) {
      await this.neo4jSync.handleWebhook({
        type: "INSERT",
        table: "recipes",
        schema: "public",
        record: recipe,
        old_record: null,
      });

      if (block.ingredients && block.ingredients.length > 0) {
        const normalized = this.recipeMathService
          ? this.recipeMathService.normalizeRecipeIngredients(
              block.ingredients.map((ing: any) => ({
                rawName: ing.rawName || ing.guessName || "Ingredient",
                amount: ing.quantity || ing.amount || 1,
                unit: ing.unit || "g",
                selectedTenantId: ing.selectedTenantId,
                originalInputString: ing.originalInputString,
                isReference: ing.isReference,
                baseCalculationGroup: ing.baseCalculationGroup,
                calculationType: ing.calculationType,
                bakersPercentage: ing.bakersPercentage,
                standardWeightG: ing.standardWeightG,
              })),
            )
          : null;

        for (let idx = 0; idx < block.ingredients.length; idx++) {
          const rawIng = block.ingredients[idx];
          const norm = normalized ? normalized[idx] : null;

          const { data: ingRecord } = await supabase
            .from("recipe_ingredients")
            .insert({
              recipe_id: recipe.id,
              master_item_id: rawIng.selectedTenantId || null,
              raw_name: rawIng.rawName || rawIng.guessName || null,
              original_input_string:
                norm?.originalInputString ||
                rawIng.originalInputString ||
                `${rawIng.quantity || 1} ${rawIng.unit || "g"} ${rawIng.rawName || rawIng.guessName || ""}`.trim(),
              amount: norm?.standardAmount ?? (rawIng.quantity || 1),
              unit: norm?.standardUnit ?? (rawIng.unit || "unit"),
              calculation_type: norm?.calculationType || "fixed_weight",
              base_calculation_group: Boolean(
                norm?.baseCalculationGroup ||
                rawIng.baseCalculationGroup ||
                norm?.isReference,
              ),
              is_reference: Boolean(norm?.isReference || rawIng.isReference),
              bakers_percentage:
                norm?.bakersPercentage ?? rawIng.bakersPercentage ?? null,
              standard_weight_g:
                norm?.standardWeightG ?? rawIng.standardWeightG ?? null,
            })
            .select()
            .single();

          if (ingRecord) {
            await this.neo4jSync.handleWebhook({
              type: "INSERT",
              table: "recipe_ingredients",
              schema: "public",
              record: ingRecord,
              old_record: null,
            });
          }
        }
      }
      return recipe.id;
    }
    return null;
  }

  private async commitProseBlock(block: ExtractedBlock, orgId: string) {
    if (!block.content) return;
    const embedding = await this.getEmbedding(block.content);
    const { data: vectorRecord } = await supabase
      .from("core_knowledge_vectors")
      .insert({
        organization_id: orgId,
        content: block.content,
        embedding: embedding as any,
        document_type: "PROSE",
        source_meta: { bbox: block.bbox },
      })
      .select()
      .single();

    if (vectorRecord) {
      await this.neo4jSync.handleWebhook({
        type: "INSERT",
        table: "core_knowledge_vectors",
        schema: "public",
        record: vectorRecord,
        old_record: null,
      });
    }
  }
}
