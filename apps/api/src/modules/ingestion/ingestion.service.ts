import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { RecipeMathService } from "../recipe/recipe-math.service";
import { Cron } from "@nestjs/schedule";
import { createHash } from "crypto";
import { supabase } from "../../core/database/supabase";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
import { serverConfig as config } from "@soustools/config/server";
import {
  ManualCorrectionDelta,
  RawUnmappedDataReport,
} from "@soustools/api-types";
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
  manualCorrections?: ManualCorrectionDelta[];
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

  /**
   * Search master items utilizing confirmed vendor_item_aliases and pgvector similarity.
   * Confirmed aliases match with score 1.0. Vector similarities >= 0.95 trigger auto-acceptance.
   */
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

  /**
   * Upserts a vendor item alias mapping for an organization and vendor upon user approval.
   * Emits a Neo4j sync webhook to keep graph knowledge synchronized.
   */
  async upsertVendorItemAlias(params: {
    organizationId: string;
    vendorId: string;
    vendorItemString: string;
    itemId: string;
  }) {
    const rawString = params.vendorItemString.trim();
    if (!rawString || !params.vendorId || !params.itemId) return null;

    try {
      const { data, error } = await supabase
        .from("vendor_item_aliases")
        .upsert(
          {
            organization_id: params.organizationId,
            vendor_id: params.vendorId,
            vendor_item_string: rawString,
            item_id: params.itemId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "organization_id,vendor_id,vendor_item_string" },
        )
        .select()
        .maybeSingle();

      if (error) {
        this.logger.error("Failed to upsert vendor_item_alias:", error);
      } else if (data) {
        this.logger.log(
          `Upserted vendor_item_alias: "${rawString}" -> item ${params.itemId} for vendor ${params.vendorId}`,
        );
        await this.neo4jSync.handleWebhook({
          type: "INSERT",
          table: "vendor_item_aliases",
          schema: "public",
          record: data,
          old_record: null,
        });
      }
      return data;
    } catch (err) {
      this.logger.warn("Error upserting vendor_item_aliases:", err);
      return null;
    }
  }

  /**
   * Stores a human-in-the-loop manual correction delta into persistent vector memory (core_knowledge_vectors)
   * so it can be dynamically injected as few-shot training examples in future extraction prompts.
   */
  async recordManualCorrection(delta: ManualCorrectionDelta) {
    try {
      const canon =
        delta.correctedExtraction.canonicalName ||
        delta.correctedExtraction.rawName ||
        delta.correctedExtraction.guessName ||
        "";
      const tenant =
        delta.correctedExtraction.selectedTenantName ||
        delta.correctedExtraction.selectedTenantId ||
        "None";
      const usda =
        delta.correctedExtraction.selectedUsdaDescription ||
        delta.correctedExtraction.selectedUsdaId ||
        "None";

      const content = `[HUMAN_CORRECTION] DocumentType: ${delta.blockType}, Vendor: ${delta.vendorName || delta.vendorId || "Unknown"}, RawInput: "${delta.rawInput}" -> CorrectedCanonical: "${canon}", MappedTenantId: "${tenant}", MappedUsdaId: "${usda}", Unit: "${delta.correctedExtraction.unit || "None"}", UnitPrice: ${delta.correctedExtraction.unitPrice || 0}`;

      const embedding = await this.getEmbedding(delta.rawInput);

      const { data, error } = await supabase
        .from("core_knowledge_vectors")
        .insert({
          organization_id: delta.organizationId,
          content,
          embedding:
            embedding && embedding.length > 0 ? (embedding as any) : null,
          document_type: "CORRECTION",
          source_meta: delta as any,
        })
        .select()
        .single();

      if (error) {
        this.logger.warn(
          "Failed to insert correction into core_knowledge_vectors:",
          error,
        );
      } else if (data) {
        this.logger.log(
          `Captured and persisted human correction delta for "${delta.rawInput}"`,
        );
        await this.neo4jSync.handleWebhook({
          type: "INSERT",
          table: "core_knowledge_vectors",
          schema: "public",
          record: data,
          old_record: null,
        });
      }
      return data;
    } catch (err) {
      this.logger.warn("Error saving manual correction delta:", err);
      return null;
    }
  }

  /**
   * Captures deltas between original extraction and approved review payload.
   */
  async captureManualCorrections(params: {
    reviewId: string;
    organizationId: string;
    originalPayload?: IngestionReviewPayload;
    approvedPayload: IngestionReviewPayload;
    userId?: string;
  }): Promise<ManualCorrectionDelta[]> {
    const deltas: ManualCorrectionDelta[] = [];
    const origPages = params.originalPayload?.pages || [];

    for (let pIdx = 0; pIdx < params.approvedPayload.pages.length; pIdx++) {
      const appPage = params.approvedPayload.pages[pIdx];
      const origPage = origPages[pIdx];

      for (let bIdx = 0; bIdx < appPage.blocks.length; bIdx++) {
        const appBlock = appPage.blocks[bIdx];
        const origBlock = origPage?.blocks?.[bIdx];

        if (appBlock.type === "INVOICE") {
          const appItems = appBlock.lineItems || [];
          const origItems = origBlock?.lineItems || [];

          for (let iIdx = 0; iIdx < appItems.length; iIdx++) {
            const appItem = appItems[iIdx];
            const origItem = origItems[iIdx];

            const wasEdited =
              !origItem ||
              origItem.selectedTenantId !== appItem.selectedTenantId ||
              origItem.selectedUsdaId !== appItem.selectedUsdaId ||
              origItem.rawName !== appItem.rawName ||
              origItem.guessName !== appItem.guessName ||
              origItem.unitPrice !== appItem.unitPrice ||
              origItem.quantity !== appItem.quantity;

            if (
              wasEdited ||
              appItem.selectedTenantId ||
              appItem.selectedUsdaId
            ) {
              const delta: ManualCorrectionDelta = {
                organizationId: params.organizationId,
                reviewId: params.reviewId,
                blockType: "INVOICE",
                rawInput: appItem.rawName || origItem?.rawName || "Line Item",
                originalExtraction: origItem
                  ? {
                      rawName: origItem.rawName,
                      guessName: origItem.guessName,
                      unitPrice: origItem.unitPrice,
                      extendedPrice: origItem.extendedPrice,
                      selectedTenantId: origItem.selectedTenantId,
                      selectedUsdaId: origItem.selectedUsdaId,
                    }
                  : undefined,
                correctedExtraction: {
                  rawName: appItem.rawName,
                  guessName: appItem.guessName,
                  canonicalName: appItem.normalizedName || appItem.guessName,
                  unitPrice: appItem.unitPrice,
                  extendedPrice: appItem.extendedPrice,
                  selectedTenantId: appItem.selectedTenantId,
                  selectedTenantName: appItem.tenantMatches?.find(
                    (m) => m.id === appItem.selectedTenantId,
                  )?.name,
                  selectedUsdaId: appItem.selectedUsdaId,
                  selectedUsdaDescription: appItem.usdaMatches?.find(
                    (u) => u.fdcId === appItem.selectedUsdaId,
                  )?.description,
                },
                vendorId: appBlock.vendorId,
                vendorName: appBlock.vendorName,
                userId: params.userId,
                createdAt: new Date().toISOString(),
              };

              deltas.push(delta);
              await this.recordManualCorrection(delta);
            }
          }
        } else if (appBlock.type === "RECIPE") {
          const appIngredients = appBlock.ingredients || [];
          const origIngredients = origBlock?.ingredients || [];

          for (let iIdx = 0; iIdx < appIngredients.length; iIdx++) {
            const appIng = appIngredients[iIdx];
            const origIng = origIngredients[iIdx];

            const wasEdited =
              !origIng ||
              origIng.selectedTenantId !== appIng.selectedTenantId ||
              origIng.selectedUsdaId !== appIng.selectedUsdaId ||
              origIng.rawName !== appIng.rawName ||
              origIng.guessName !== appIng.guessName ||
              origIng.unit !== appIng.unit ||
              origIng.quantity !== appIng.quantity;

            if (wasEdited || appIng.selectedTenantId || appIng.selectedUsdaId) {
              const delta: ManualCorrectionDelta = {
                organizationId: params.organizationId,
                reviewId: params.reviewId,
                blockType: "RECIPE",
                rawInput: appIng.rawName || origIng?.rawName || "Ingredient",
                originalExtraction: origIng
                  ? {
                      rawName: origIng.rawName,
                      guessName: origIng.guessName,
                      unit: origIng.unit,
                      selectedTenantId: origIng.selectedTenantId,
                      selectedUsdaId: origIng.selectedUsdaId,
                    }
                  : undefined,
                correctedExtraction: {
                  rawName: appIng.rawName,
                  guessName: appIng.guessName,
                  canonicalName: appIng.normalizedName || appIng.guessName,
                  unit: appIng.unit,
                  selectedTenantId: appIng.selectedTenantId,
                  selectedTenantName: appIng.tenantMatches?.find(
                    (m) => m.id === appIng.selectedTenantId,
                  )?.name,
                  selectedUsdaId: appIng.selectedUsdaId,
                  selectedUsdaDescription: appIng.usdaMatches?.find(
                    (u) => u.fdcId === appIng.selectedUsdaId,
                  )?.description,
                },
                userId: params.userId,
                createdAt: new Date().toISOString(),
              };

              deltas.push(delta);
              await this.recordManualCorrection(delta);
            }
          }
        }
      }
    }

    return deltas;
  }

  /**
   * Generates dynamic few-shot training examples learned from historical manual corrections,
   * confirmed vendor item aliases, and approved master mappings for this organization and vendor.
   */
  async getFewShotExamples(params: {
    organizationId: string;
    documentType?: string;
    vendorId?: string;
    vendorName?: string;
    limit?: number;
  }): Promise<string> {
    const limit = params.limit || 5;
    const examples: string[] = [];

    // 1. Fetch vendor item aliases for this vendor / org
    if (params.organizationId) {
      try {
        let aliasQuery = supabase
          .from("vendor_item_aliases")
          .select("vendor_item_string, item_id")
          .eq("organization_id", params.organizationId);

        if (params.vendorId) {
          aliasQuery = aliasQuery.eq("vendor_id", params.vendorId);
        }

        const { data: aliases } = await aliasQuery.limit(limit);
        if (aliases && aliases.length > 0) {
          for (const a of aliases) {
            examples.push(
              `- Vendor raw item "${a.vendor_item_string}" -> Map to Master Item ID: "${a.item_id}"`,
            );
          }
        }
      } catch (err) {
        this.logger.debug(
          "Failed to query vendor aliases for few-shot examples:",
          err,
        );
      }
    }

    // 2. Fetch stored human correction deltas from core_knowledge_vectors
    if (params.organizationId) {
      try {
        const { data: corrections } = await supabase
          .from("core_knowledge_vectors")
          .select("content, source_meta")
          .eq("organization_id", params.organizationId)
          .eq("document_type", "CORRECTION")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (corrections && corrections.length > 0) {
          for (const c of corrections) {
            const meta = c.source_meta as ManualCorrectionDelta | undefined;
            if (meta?.rawInput && meta?.correctedExtraction) {
              const canon =
                meta.correctedExtraction.canonicalName ||
                meta.correctedExtraction.rawName;
              const tenant =
                meta.correctedExtraction.selectedTenantName ||
                meta.correctedExtraction.selectedTenantId ||
                "";
              const usda =
                meta.correctedExtraction.selectedUsdaDescription ||
                meta.correctedExtraction.selectedUsdaId ||
                "";
              const extra = [
                tenant ? `Master Item: "${tenant}"` : null,
                usda ? `USDA FDC: "${usda}"` : null,
                meta.correctedExtraction.unit
                  ? `Unit: "${meta.correctedExtraction.unit}"`
                  : null,
                meta.correctedExtraction.unitPrice
                  ? `UnitPrice: $${meta.correctedExtraction.unitPrice}`
                  : null,
              ]
                .filter(Boolean)
                .join(", ");

              examples.push(
                `- Raw input "${meta.rawInput}" -> Canonical: "${canon}"${extra ? ` (${extra})` : ""}`,
              );
            }
          }
        }
      } catch (err) {
        this.logger.debug(
          "Failed to query stored corrections for few-shot examples:",
          err,
        );
      }
    }

    if (examples.length === 0) {
      // Default domain-specific culinary few-shot guidance
      return `### FEW-SHOT TRAINING EXAMPLES (CHEF GROUND TRUTH):
- Raw: "Sysco Full Fat Milk 1 Gal" -> { "brand": "Sysco", "canonicalName": "Milk, whole", "modifier": "Full Fat", "packSize": 1, "unit": "gallon" }
- Raw: "EVOO 1L" -> { "brand": "Generic", "canonicalName": "Oil, olive, extra virgin", "packSize": 1, "unit": "liter" }
- Raw: "50LB AP FLOUR SYSCO" -> { "brand": "Sysco", "canonicalName": "Flour, wheat, all-purpose", "packSize": 50, "unit": "lb" }`;
    }

    return `### FEW-SHOT TRAINING EXAMPLES (LEARNED FROM CHEF CORRECTIONS & CONFIRMED ALIASES):
The following verified mappings and corrections were approved by chefs for this organization/vendor. Apply these exact conventions when decomposing and parsing abbreviations:
${examples.join("\n")}`;
  }

  /**
   * Weekly Cron Job to aggregate and report on raw_unmapped_data across all ingestion reviews
   * to guide future database and domain schema expansions.
   */
  @Cron("0 0 * * 0", { name: "aggregateWeeklyRawUnmappedData" })
  async handleWeeklyRawUnmappedCron() {
    this.logger.log(
      "Triggering weekly raw_unmapped_data aggregation cron job...",
    );
    await this.aggregateRawUnmappedData();
  }

  /**
   * Aggregates raw_unmapped_data across recent reviews and outputs a structured schema expansion report.
   */
  async aggregateRawUnmappedData(
    orgId?: string,
  ): Promise<RawUnmappedDataReport> {
    this.logger.log(
      `Aggregating raw_unmapped_data for ${orgId ? `org ${orgId}` : "all organizations"}...`,
    );

    const keyFrequency: Record<string, number> = {};
    const sampleValuesByKey: Record<string, any[]> = {};
    let totalReviewsAnalyzed = 0;
    let totalUnmappedEntries = 0;

    try {
      let query = supabase
        .from("ingestion_reviews")
        .select("id, organization_id, parsed_data, created_at");

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      const { data: reviews } = await query
        .order("created_at", { ascending: false })
        .limit(100);
      if (reviews && reviews.length > 0) {
        totalReviewsAnalyzed = reviews.length;

        for (const rev of reviews) {
          const parsed = rev.parsed_data as IngestionReviewPayload | undefined;
          if (parsed && Array.isArray(parsed.pages)) {
            for (const page of parsed.pages) {
              for (const block of page.blocks) {
                const unmapped = block.rawUnmappedData;
                if (
                  unmapped &&
                  typeof unmapped === "object" &&
                  !Array.isArray(unmapped)
                ) {
                  for (const [key, val] of Object.entries(unmapped)) {
                    if (val !== undefined && val !== null && val !== "") {
                      totalUnmappedEntries++;
                      keyFrequency[key] = (keyFrequency[key] || 0) + 1;
                      if (!sampleValuesByKey[key]) {
                        sampleValuesByKey[key] = [];
                      }
                      if (sampleValuesByKey[key].length < 5) {
                        sampleValuesByKey[key].push(val);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      this.logger.warn(
        "Error querying ingestion reviews for unmapped data aggregation:",
        err,
      );
    }

    const recommendedSchemaAdditions = Object.entries(keyFrequency)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([key, count]) =>
          `${key} (${count} occurrences) - consider promoting to first-class schema field`,
      );

    const report: RawUnmappedDataReport = {
      generatedAt: new Date().toISOString(),
      organizationId: orgId,
      totalReviewsAnalyzed,
      totalUnmappedEntries,
      keyFrequency,
      sampleValuesByKey,
      recommendedSchemaAdditions,
    };

    this.logger.log(
      `Weekly raw_unmapped_data aggregation completed: Analyzed ${totalReviewsAnalyzed} reviews, found ${totalUnmappedEntries} unmapped attributes across ${Object.keys(keyFrequency).length} unique keys. Recommendations: ${recommendedSchemaAdditions.join(", ") || "None"}`,
    );

    if (orgId) {
      try {
        await supabase.from("core_knowledge_vectors").insert({
          organization_id: orgId,
          content: `[SCHEMA_EXPANSION_REPORT] Total unmapped entries: ${totalUnmappedEntries}. High-frequency keys: ${Object.keys(keyFrequency).join(", ")}. Recommendations: ${recommendedSchemaAdditions.join("; ")}`,
          document_type: "SCHEMA_EXPANSION_REPORT",
          source_meta: report as any,
        });
      } catch (saveErr) {
        this.logger.debug(
          "Failed to store schema expansion report in DB:",
          saveErr,
        );
      }
    }

    return report;
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
    userId?: string,
  ) {
    this.logger.log(`Committing approved review ${reviewId} for org ${orgId}`);

    // Fetch existing review to compare deltas and capture human-in-the-loop corrections
    let originalPayload: IngestionReviewPayload | undefined;
    try {
      const existing = await this.getReviewRecord(reviewId);
      if (existing && existing.parsed_data) {
        originalPayload = existing.parsed_data as IngestionReviewPayload;
      }
    } catch {
      // non-fatal
    }

    const manualCorrections = await this.captureManualCorrections({
      reviewId,
      organizationId: orgId,
      originalPayload,
      approvedPayload,
      userId,
    });

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

    const updatedParsedData: IngestionReviewPayload = {
      ...approvedPayload,
      manualCorrections: [
        ...((approvedPayload as any).manualCorrections || []),
        ...manualCorrections,
      ],
    };

    const { data } = await supabase
      .from("ingestion_reviews")
      .update({
        status: "APPROVED",
        parsed_data: updatedParsedData as any,
        updated_at: new Date().toISOString(),
      })
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
      correctionsCaptured: manualCorrections.length,
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

    const invoiceHash = this.computeIdempotencyHash(
      vendorId || block.vendorName || "",
      invoiceNumber,
      invoiceDate,
    );

    if (vendorId) {
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
        if (item.selectedTenantId) {
          // Upsert vendor_item_aliases on approval whenever a vendor item is mapped
          if (vendorId && item.rawName) {
            await this.upsertVendorItemAlias({
              organizationId: orgId,
              vendorId,
              vendorItemString: item.rawName,
              itemId: item.selectedTenantId,
            });
          }

          if (item.unitPrice) {
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
