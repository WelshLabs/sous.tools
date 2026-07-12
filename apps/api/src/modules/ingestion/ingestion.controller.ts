import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UsePipes,
  Inject,
} from "@nestjs/common";
import { type IVisionService } from "./IVisionService";
import { ApiTags, ApiBody, ApiResponse as NestjsApiResponse, ApiProperty } from "@nestjs/swagger";
import { NormalizationService } from "./normalization.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ApiResponse, type IngestionPayload,
  IngestionPayloadSchema,
} from "@soustools/api-types";

export class IngestionSuggestionDto {
  @ApiProperty({ type: String })
  itemId!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: Number })
  similarity!: number;

  @ApiProperty({ type: String, enum: ["green", "yellow", "orange"] })
  matchColor!: "green" | "yellow" | "orange";
}

export class IngestionLineItemDto {
  @ApiProperty({ type: String })
  rawName!: string;

  @ApiProperty({ type: String, nullable: true })
  suggestedInternalName?: string | null;

  @ApiProperty({ type: String, enum: ["INGREDIENT", "PACKAGING", "CLEANING", "SMALLWARES", "FEE", "OTHER"] })
  category!: "INGREDIENT" | "PACKAGING" | "CLEANING" | "SMALLWARES" | "FEE" | "OTHER";

  @ApiProperty({ type: Number })
  amount!: number;

  @ApiProperty({ type: String })
  unit!: string;

  @ApiProperty({ type: Number })
  price!: number;

  @ApiProperty({ type: String, nullable: true })
  itemId?: string | null;

  @ApiProperty({ type: Number, nullable: true })
  confidence?: number | null;

  @ApiProperty({ type: [IngestionSuggestionDto] })
  suggestions!: IngestionSuggestionDto[];
}

export class PolymorphicExtractionResponseDto {
  @ApiProperty({ type: String, enum: ["INVOICE", "RECIPE", "OTHER"] })
  documentType!: "INVOICE" | "RECIPE" | "OTHER";

  @ApiProperty({ type: [IngestionLineItemDto] })
  lineItems!: IngestionLineItemDto[];

  @ApiProperty({ type: "object", additionalProperties: true, description: "Flexible metadata containing any document-level fields" })
  extractedMetadata!: Record<string, any>;

  // Backward compatibility fields
  @ApiProperty({ type: String, nullable: true, required: false })
  vendorName?: string;

  @ApiProperty({ type: [IngestionLineItemDto], required: false })
  items?: IngestionLineItemDto[];

  @ApiProperty({ type: String, nullable: true, required: false })
  recipeName?: string;

  @ApiProperty({ type: [IngestionLineItemDto], required: false })
  ingredients?: IngestionLineItemDto[];
}

export class PolymorphicExtractionResponseWrapperDto {
  @ApiProperty({ type: Boolean })
  success!: boolean;

  @ApiProperty({ type: PolymorphicExtractionResponseDto })
  data!: PolymorphicExtractionResponseDto;
}
import { runControllerAction } from "../signage/response.helper";
import { supabase } from "../../lib/supabase";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { InventoryService } from "../items/inventory.service";
import { PriceHistoryService } from "../items/price-history.service";
import { WhiteboardService } from "../items/whiteboard.service";

@ApiTags("ingestion")
@Controller("ingestion")
export class IngestionController {
  constructor(
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue,
    private readonly inventoryService: InventoryService,
    private readonly priceHistoryService: PriceHistoryService,
    private readonly whiteboardService: WhiteboardService,
    @Inject("IVisionService") private readonly visionService: IVisionService,
    private readonly normalizationService: NormalizationService,
  ) {}

  @Get()
  @NestjsApiResponse({
    status: 200,
    description: "Success",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true
          }
        },
        timestamp: { type: "string" }
      }
    }
  })
  async getReviews(): Promise<ApiResponse<any[]>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    });
  }

  @Get(":id")
  async getReview(@Param("id") id: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    });
  }

  @Post("submit")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        organizationId: { type: "string" },
        userId: { type: "string" },
        source: { type: "string" },
        sourceName: { type: "string", nullable: true },
        sourceDocumentUrl: { type: "string", nullable: true },
        imagesBase64: { type: "array", items: { type: "string" }, nullable: true }
      }
    }
  })
  @NestjsApiResponse({ status: 201, description: "Success", schema: { type: "object", additionalProperties: true } })
  @UsePipes(new ZodValidationPipe(IngestionPayloadSchema))
  async submit(
    @Body() payload: IngestionPayload,
  ): Promise<ApiResponse<{ jobId: string }>> {
    return runControllerAction(async () => {
      // Create initial review record so it shows in the UI immediately
      const { data: review, error } = await supabase
        .from("ingestion_reviews")
        .insert({
          organization_id: payload.organizationId,
          user_id: payload.userId,
          source: payload.source,
          source_name: payload.sourceName || null,
          source_document_url: payload.sourceDocumentUrl || null,
          raw_text: "",
          parsed_data: { processing: true },
          status: "PENDING",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      let sourceDocumentUrl = payload.sourceDocumentUrl || "";
      if (!sourceDocumentUrl && payload.imagesBase64 && payload.imagesBase64.length > 0) {
        const primaryB64 = payload.imagesBase64[0];
        const match = primaryB64.match(/^data:(.+?);base64,(.+)$/);
        const mimeType = match ? match[1] : "image/jpeg";
        const rawB64 = match ? match[2] : primaryB64;
        const buffer = Buffer.from(rawB64, "base64");

        const ext = mimeType.split("/")[1] || "jpg";
        const fileName = `${review.id}.${ext}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("ingestion-sources")
          .upload(fileName, buffer, { contentType: mimeType, upsert: true });

        if (uploadErr) {
          console.error("Failed to upload source file:", uploadErr);
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("ingestion-sources")
            .getPublicUrl(fileName);
          sourceDocumentUrl = urlData?.publicUrl || "";

          await supabase
            .from("ingestion_reviews")
            .update({
              source_document_url: sourceDocumentUrl,
            })
            .eq("id", review.id);
        }
      }

      // Omit the huge base64 payload to prevent Redis from crashing/OOM
      const jobPayload = {
        ...payload,
        imagesBase64: undefined,
        sourceDocumentUrl,
        reviewId: review.id,
      };

      const job = await this.ingestionQueue.add(
        "process-ingestion",
        jobPayload,
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        },
      );
      return { jobId: job.id!, reviewId: review.id };
    });
  }

  @Post("review/:id/commit")
  async commitReview(
    @Param("id") id: string,
    @Body() body?: { parsed_data?: any },
  ): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { data: review, error } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !review) throw new Error("Review not found");

      if (review.status === "APPROVED") return;

      const parsed = body?.parsed_data || review.parsed_data;
      if (body?.parsed_data) {
        await supabase
          .from("ingestion_reviews")
          .update({ parsed_data: parsed })
          .eq("id", id);
      }

      const recipesToCommit = parsed.recipes
        ? parsed.recipes
        : parsed.title && parsed.ingredients
          ? [parsed]
          : [];

      if (recipesToCommit.length > 0) {
        for (const recipe of recipesToCommit) {
          // Resolve vessel
          let vesselId: string | null = null;
          if (recipe.vessel?.name) {
            const { data: existingVessel } = await supabase
              .from("vessel_profiles")
              .select("id")
              .eq("organization_id", review.organization_id)
              .ilike("name", recipe.vessel.name)
              .maybeSingle();

            if (existingVessel) {
              vesselId = existingVessel.id;
            } else {
              const { data: newVessel } = await supabase
                .from("vessel_profiles")
                .insert({
                  organization_id: review.organization_id,
                  name: recipe.vessel.name,
                  shape: recipe.vessel.shape || "ROUND",
                  length: recipe.vessel.length || null,
                  width: recipe.vessel.width || null,
                  height: recipe.vessel.height || null,
                  diameter: recipe.vessel.diameter || null,
                  volume_ml: recipe.vessel.volumeMl || 0,
                })
                .select()
                .single();
              if (newVessel) vesselId = newVessel.id;
            }
          }

          // Insert recipe
          const { data: createdRecipe, error: recipeErr } = await supabase
            .from("recipes")
            .insert({
              organization_id: review.organization_id,
              title: recipe.title,
              instructions: recipe.instructions || [],
              yield_count: recipe.yieldCount || 1,
              yield_unit: recipe.yieldUnit || "servings",
              vessel_id: vesselId,
              status: "APPROVED",
              source_document_url: review.source_document_url || null,
              source_book: recipe.sourceBook || null,
              source_author: recipe.sourceAuthor || null,
              cost_per_yield: 0,
              gross_margin: 0,
            })
            .select()
            .single();

          if (recipeErr) throw new Error(recipeErr.message);

          if (recipe.ingredients) {
            for (const ing of recipe.ingredients) {
              const { data: master } = await supabase
                .from("items")
                .select("id")
                .eq("organization_id", review.organization_id)
                .ilike("name", ing.name)
                .maybeSingle();

              let mappedCalcType = "fixed_weight";
              if (
                ing.calculationType === "WEIGHT" ||
                ing.calculationType === "VOLUME" ||
                ing.calculationType === "COUNT"
              ) {
                mappedCalcType = "fixed_weight"; // Our schema doesn't differentiate volume/count yet, it's all fixed_weight unless bakers%
              } else if (ing.calculationType === "BAKERS_PERCENTAGE") {
                mappedCalcType = "bakers_percentage";
              }

              await supabase.from("recipe_ingredients").insert({
                organization_id: review.organization_id,
                recipe_id: createdRecipe.id,
                item_id: ing.itemId || master?.id || null,
                raw_name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                calculation_type: mappedCalcType,
                base_calculation_group: ing.baseCalculationGroup || false,
                component: ing.component || null,
                prep_notes: ing.prepNotes || null,
              });
            }
          }
        }
      } else if (parsed.vendorName && parsed.items) {
        // Invoice commit
        let { data: vendor } = await supabase
          .from("vendors")
          .select("id")
          .eq("organization_id", review.organization_id)
          .ilike("name", parsed.vendorName)
          .maybeSingle();

        if (!vendor) {
          const { data: newVendor, error: vErr } = await supabase
            .from("vendors")
            .insert({
              organization_id: review.organization_id,
              name: parsed.vendorName,
              order_method: "MANUAL",
            })
            .select()
            .single();
          if (vErr) throw new Error(vErr.message);
          vendor = newVendor;
        }

        const { data: po, error: poErr } = await supabase
          .from("purchase_orders")
          .insert({
            organization_id: review.organization_id,
            vendor_id: vendor!.id,
            status: "RECONCILED",
          })
          .select()
          .single();

        if (poErr) throw new Error(poErr.message);

        for (const item of parsed.items) {
          await supabase.from("purchase_order_items").insert({
            po_id: po.id,
            raw_name: item.rawName,
            ordered_qty: item.quantity || 1,
            price_per_unit: item.pricePerUnit || 0,
          });

          if (item.itemId) {
            let masterEachWeight = 0;
            let masterPurchaseUnit = "CASE";
            let masterName = item.rawName;

            const { data: master } = await supabase
              .from("items")
              .select("id, name, each_weight_g, purchase_unit")
              .eq("id", item.itemId)
              .single();

            if (master) {
              masterPurchaseUnit = master.purchase_unit || "CASE";
              masterName = master.name;
              masterEachWeight = master.each_weight_g || 0;

              if (item.each_weight_g && item.each_weight_g > 0) {
                masterEachWeight = item.each_weight_g;
                await supabase
                  .from("items")
                  .update({ each_weight_g: masterEachWeight })
                  .eq("id", master.id);
              }
            }

            if (!masterEachWeight || masterEachWeight <= 0) {
              await this.whiteboardService.create({
                raw_name: `Invoice ${parsed.invoiceNumber || "Unknown"} received, but ${masterName} is missing a weight conversion. Stock not added.`,
              });
            } else {
              const quantityG = (item.quantity || 1) * masterEachWeight;
              await this.inventoryService.receiveStock(
                review.organization_id,
                item.itemId,
                quantityG,
              );
            }

            await this.priceHistoryService.recordPrice({
              itemId: item.itemId,
              orgId: review.organization_id,
              purchaseUnit: masterPurchaseUnit,
              unitCost: item.pricePerUnit || 0,
              vendorId: vendor?.id || null,
              purchaseOrderId: po.id,
            });
          }
        }
      }

      await supabase
        .from("ingestion_reviews")
        .update({ status: "APPROVED", parsed_data: parsed })
        .eq("id", id);
    });
  }

  @Delete(":id")
  async deleteReview(@Param("id") id: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { error } = await supabase
        .from("ingestion_reviews")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    });
  }

  @Post("alias")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        organizationId: { type: "string" },
        vendorName: { type: "string" },
        vendorItemString: { type: "string" },
        masterIngredientId: { type: "string" },
      },
      required: ["organizationId", "vendorName", "vendorItemString", "masterIngredientId"]
    }
  })
  @NestjsApiResponse({ status: 201, description: "Success", schema: { type: "object", additionalProperties: true } })
  async saveAlias(
    @Body() body: {
      organizationId: string;
      vendorName: string;
      vendorItemString: string;
      masterIngredientId: string;
    }
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { organizationId, vendorName, vendorItemString, masterIngredientId } = body;
      if (!organizationId || !vendorName || !vendorItemString || !masterIngredientId) {
        throw new Error("Missing required fields");
      }

      // Find or create vendor
      let { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("organization_id", organizationId)
        .ilike("name", vendorName)
        .maybeSingle();

      if (!vendor) {
        const { data: newVendor, error: vErr } = await supabase
          .from("vendors")
          .insert({
            organization_id: organizationId,
            name: vendorName,
            order_method: "MANUAL",
          })
          .select()
          .single();
        if (vErr) throw new Error(vErr.message);
        vendor = newVendor;
      }

      // Upsert alias mapping
      const { data, error } = await supabase
        .from("vendor_item_aliases")
        .upsert({
          organization_id: organizationId,
          vendor_id: vendor!.id,
          vendor_item_string: vendorItemString,
          item_id: masterIngredientId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "organization_id,vendor_id,vendor_item_string"
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    });
  }

  @Post("invoice")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        organizationId: { type: "string" },
        imageBase64: { type: "string", nullable: true },
        sourceUrl: { type: "string", nullable: true },
        rawText: { type: "string", nullable: true },
        sourceName: { type: "string", nullable: true }
      }
    }
  })
  @NestjsApiResponse({
    status: 201,
    description: "Success",
    type: PolymorphicExtractionResponseWrapperDto
  })
  async extractInvoice(
    @Body() body: {
      organizationId: string;
      imageBase64?: string;
      sourceUrl?: string;
      rawText?: string;
      sourceName?: string;
    }
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { organizationId, imageBase64, sourceUrl, rawText, sourceName } = body;
      if (!organizationId) {
        throw new Error("Missing organizationId");
      }

      let buffer: Buffer | undefined;
      let mimeType: string | undefined;

      if (imageBase64) {
        const match = imageBase64.match(/^data:(.+?);base64,(.+)$/);
        mimeType = match ? match[1] : "image/jpeg";
        const rawB64 = match ? match[2] : imageBase64;
        buffer = Buffer.from(rawB64, "base64");
      }

      // 1. Extract invoice structured JSON from VisionService
      const extracted = await this.visionService.extractInvoice(
        buffer,
        rawText,
        mimeType,
        sourceName,
        sourceUrl
      );

      // 2. Pass extracted items through NormalizationService
      if (extracted && extracted.items && Array.isArray(extracted.items)) {
        extracted.items = await this.normalizationService.normalizeInvoiceItems(
          organizationId,
          extracted.vendorName || null,
          extracted.items,
          true
        );
      }

      return extracted;
    });
  }

  @Post("invoice/commit")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        organizationId: { type: "string" },
        invoice: {
          type: "object",
          properties: {
            vendorName: { type: "string" },
            invoiceNumber: { type: "string", nullable: true },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rawName: { type: "string" },
                  itemId: { type: "string", nullable: true },
                  quantity: { type: "number" },
                  pricePerUnit: { type: "number" },
                  each_weight_g: { type: "number", nullable: true },
                  suggestedInternalName: { type: "string", nullable: true },
                  category: { type: "string", enum: ["INGREDIENT", "PACKAGING", "CLEANING", "SMALLWARES", "FEE", "OTHER"] },
                  isNonInventoryExpense: { type: "boolean", nullable: true }
                }
              }
            }
          }
        }
      }
    }
  })
  @NestjsApiResponse({ status: 201, description: "Success", schema: { type: "object", additionalProperties: true } })
  async commitInvoiceDirect(
    @Body() body: {
      organizationId: string;
      invoice: {
        vendorName: string;
        invoiceNumber?: string;
        items: Array<{
          rawName: string;
          itemId?: string | null;
          quantity: number;
          pricePerUnit: number;
          each_weight_g?: number | null;
          suggestedInternalName?: string | null;
          category?: string | null;
          isNonInventoryExpense?: boolean;
        }>;
      };
    }
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { organizationId, invoice } = body;
      if (!organizationId) throw new Error("Missing organizationId");
      if (!invoice) throw new Error("Missing invoice data");

      // 1. Resolve or create Vendor
      let { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("organization_id", organizationId)
        .ilike("name", invoice.vendorName)
        .maybeSingle();

      if (!vendor) {
        const { data: newVendor, error: vErr } = await supabase
          .from("vendors")
          .insert({
            organization_id: organizationId,
            name: invoice.vendorName,
            order_method: "MANUAL",
          })
          .select()
          .single();
        if (vErr) throw new Error(vErr.message);
        vendor = newVendor;
      }

      // 2. Create Purchase Order
      const { data: po, error: poErr } = await supabase
        .from("purchase_orders")
        .insert({
          organization_id: organizationId,
          vendor_id: vendor!.id,
          status: "RECONCILED",
        })
        .select()
        .single();

      if (poErr) throw new Error(poErr.message);

      // 3. Process items
      for (const item of invoice.items) {
        // Insert PO item
        await supabase.from("purchase_order_items").insert({
          po_id: po.id,
          raw_name: item.rawName,
          ordered_qty: item.quantity || 1,
          price_per_unit: item.pricePerUnit || 0,
        });

        // If mapped to a master item, process stock and price history
        if (item.itemId) {
          let masterEachWeight = 0;
          let masterPurchaseUnit = "CASE";
          let masterName = item.rawName;

          const { data: master } = await supabase
            .from("items")
            .select("id, name, each_weight_g, purchase_unit")
            .eq("id", item.itemId)
            .single();

          if (master) {
            masterPurchaseUnit = master.purchase_unit || "CASE";
            masterName = master.name;
            masterEachWeight = master.each_weight_g || 0;

            if (item.each_weight_g && item.each_weight_g > 0) {
              masterEachWeight = item.each_weight_g;
              await supabase
                .from("items")
                .update({ each_weight_g: masterEachWeight })
                .eq("id", master.id);
            }
          }

          // If no weight conversion is set, post whiteboard alert, else receive stock
          if (!masterEachWeight || masterEachWeight <= 0) {
            await this.whiteboardService.create({
              raw_name: `Invoice ${invoice.invoiceNumber || "Unknown"} received, but ${masterName} is missing a weight conversion. Stock not added.`,
            });
          } else {
            const quantityG = (item.quantity || 1) * masterEachWeight;
            await this.inventoryService.receiveStock(
              organizationId,
              item.itemId,
              quantityG,
            );
          }

          // Record Price History
          await this.priceHistoryService.recordPrice({
            itemId: item.itemId,
            orgId: organizationId,
            purchaseUnit: masterPurchaseUnit,
            unitCost: item.pricePerUnit || 0,
            vendorId: vendor?.id || null,
            purchaseOrderId: po.id,
          });

          // Create/update alias mapping if it does not already exist
          const { data: existingAlias } = await supabase
            .from("vendor_item_aliases")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("vendor_id", vendor!.id)
            .eq("vendor_item_string", item.rawName)
            .maybeSingle();

          if (!existingAlias) {
            await supabase.from("vendor_item_aliases").insert({
              organization_id: organizationId,
              vendor_id: vendor!.id,
              vendor_item_string: item.rawName,
              item_id: item.itemId,
            });
          }
        }
      }

      return { success: true };
    });
  }

  @Post("recipe")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        organizationId: { type: "string" },
        imageBase64: { type: "string", nullable: true },
        sourceUrl: { type: "string", nullable: true },
        rawText: { type: "string", nullable: true },
        sourceName: { type: "string", nullable: true }
      }
    }
  })
  @NestjsApiResponse({ status: 201, description: "Success", type: PolymorphicExtractionResponseWrapperDto })
  async extractRecipe(
    @Body() body: {
      organizationId: string;
      imageBase64?: string;
      sourceUrl?: string;
      rawText?: string;
      sourceName?: string;
    }
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { organizationId, imageBase64, sourceUrl, rawText, sourceName } = body;
      if (!organizationId) {
        throw new Error("Missing organizationId");
      }

      let buffer: Buffer | undefined;
      let mimeType: string | undefined;

      if (imageBase64) {
        const match = imageBase64.match(/^data:(.+?);base64,(.+)$/);
        mimeType = match ? match[1] : "image/jpeg";
        const rawB64 = match ? match[2] : imageBase64;
        buffer = Buffer.from(rawB64, "base64");
      }

      // 1. Extract recipe structured JSON from VisionService
      const extracted = await this.visionService.extractRecipe(
        buffer,
        rawText,
        mimeType,
        sourceName,
        sourceUrl
      );

      // 2. Pass extracted ingredients through NormalizationService
      if (extracted && extracted.ingredients && Array.isArray(extracted.ingredients)) {
        extracted.ingredients = await this.normalizationService.normalizeInvoiceItems(
          organizationId,
          null, // No vendor context for recipes
          extracted.ingredients
        );
      }

      return extracted;
    });
  }
}
