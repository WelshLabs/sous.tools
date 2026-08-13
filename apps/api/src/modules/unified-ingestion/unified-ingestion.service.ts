import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
import { serverConfig as config } from "@soustools/config/server";

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
    quantity?: number;
    unit?: string;
    tenantMatches: Array<{ id: string; name: string }>;
    usdaMatches: Array<{ fdcId: number; description: string }>;
    selectedTenantId?: string;
    selectedUsdaId?: number;
  }>;
  // Invoice fields
  vendorName?: string;
  invoiceNumber?: string;
  totals?: { subtotal?: number; tax?: number; total?: number };
  lineItems?: Array<{
    rawName: string;
    guessName: string;
    quantity?: number;
    unitPrice?: number;
    extendedPrice?: number;
    tenantMatches: Array<{ id: string; name: string }>;
    usdaMatches: Array<{ fdcId: number; description: string }>;
    selectedTenantId?: string;
    selectedUsdaId?: number;
  }>;
}

export interface IngestionPage {
  pageNumber: number;
  imageUrl?: string;
  blocks: ExtractedBlock[];
}

export interface IngestionReviewPayload {
  pages: IngestionPage[];
}

@Injectable()
export class UnifiedIngestionService {
  private readonly logger = new Logger(UnifiedIngestionService.name);

  constructor(
    private readonly neo4jSync: Neo4jSyncService
  ) {}

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const litellmRes = await fetch("https://ai.sous.tools/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.OPENAI_API_KEY || "sk-1234"}`
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          input: [text]
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
      this.logger.error(`Failed to get embedding for "${text}" via LiteLLM:`, err);
      return [];
    }
  }

  async searchMasterItemsTop5(queryEmbedding: number[]): Promise<Array<{ id: string; name: string }>> {
    if (!queryEmbedding || queryEmbedding.length === 0) {
      const { data } = await supabase.from("master_items").select("id, name").limit(5);
      return data || [];
    }
    try {
      const { data: matches, error } = await supabase.rpc("match_master_items", {
        query_embedding: `[${queryEmbedding.join(",")}]`,
        match_threshold: 0.2,
        match_count: 5,
      });
      if (!error && matches && matches.length > 0) {
        return matches.map((m: any) => ({ id: m.id, name: m.name }));
      }
    } catch (err) {
      this.logger.warn("match_master_items RPC fallback:", err);
    }
    const { data } = await supabase.from("master_items").select("id, name").limit(5);
    return data || [];
  }

  async createReviewRecord(params: {
    organizationId: string;
    userId?: string;
    source: string;
    sourceName?: string;
    sourceDocumentUrl?: string;
    parsedData: IngestionReviewPayload;
  }) {
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
      await this.neo4jSync.handleWebhook({ type: "INSERT", table: "ingestion_reviews", schema: "public", record: data, old_record: null });
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

  async updateReviewRecordState(id: string, parsedData: IngestionReviewPayload) {
    const { data, error } = await supabase
      .from("ingestion_reviews")
      .update({ parsed_data: parsedData as any, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update review record ${id}:`, error);
      throw error;
    }
    return data;
  }

  async commitReviewPayload(reviewId: string, approvedPayload: IngestionReviewPayload, orgId: string) {
    this.logger.log(`Committing approved review ${reviewId} for org ${orgId}`);

    for (const page of approvedPayload.pages) {
      for (const block of page.blocks) {
        if (block.type === "INVOICE") {
          await this.commitInvoiceBlock(block, orgId);
        } else if (block.type === "RECIPE") {
          await this.commitRecipeBlock(block, orgId);
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
      await this.neo4jSync.handleWebhook({ type: "UPDATE", table: "ingestion_reviews", schema: "public", record: data, old_record: null });
    }
    return { success: true, reviewId };
  }

  private async commitInvoiceBlock(block: ExtractedBlock, orgId: string) {
    let vendorId: string | null = null;
    if (block.vendorName) {
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
          await this.neo4jSync.handleWebhook({ type: "INSERT", table: "vendors", schema: "public", record: newVendor, old_record: null });
        }
      }
    }
    this.logger.log(`Invoice block vendor resolved: ${vendorId || "None"}`);

    if (block.lineItems) {
      for (const item of block.lineItems) {
        if (item.selectedTenantId && item.unitPrice) {
          await supabase
            .from("master_items")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", item.selectedTenantId);
        }
      }
    }
  }

  private async commitRecipeBlock(block: ExtractedBlock, orgId: string) {
    const { data: recipe } = await supabase
      .from("recipes")
      .insert({
        organization_id: orgId,
        title: block.title || "Untitled Ingested Recipe",
        yield_count: block.yieldCount || 1,
        yield_unit: block.yieldUnit || "servings",
        instructions: (block.instructions || []) as any,
        status: "REFERENCE",
      })
      .select()
      .single();

    if (recipe) {
      await this.neo4jSync.handleWebhook({ type: "INSERT", table: "recipes", schema: "public", record: recipe, old_record: null });

      if (block.ingredients) {
        for (const ing of block.ingredients) {
          const { data: ingRecord } = await supabase
            .from("recipe_ingredients")
            .insert({
              recipe_id: recipe.id,
              master_item_id: ing.selectedTenantId || null,
              raw_name: ing.rawName,
              amount: ing.quantity || 1,
              unit: ing.unit || "unit",
              calculation_type: "fixed_weight",
            })
            .select()
            .single();

          if (ingRecord) {
            await this.neo4jSync.handleWebhook({ type: "INSERT", table: "recipe_ingredients", schema: "public", record: ingRecord, old_record: null });
          }
        }
      }
    }
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
      await this.neo4jSync.handleWebhook({ type: "INSERT", table: "core_knowledge_vectors", schema: "public", record: vectorRecord, old_record: null });
    }
  }
}
