import { Controller, Post, Body, Param, Get, Delete } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ApiResponse, IngestionPayload } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { supabase } from "../../lib/supabase";

@Controller("ingestion")
export class IngestionController {
  constructor(@InjectQueue("ingestion") private readonly ingestionQueue: Queue) {}

  @Get()
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

  @Post("submit")
  async submit(@Body() payload: IngestionPayload): Promise<ApiResponse<{ jobId: string }>> {
    return runControllerAction(async () => {
      // Create initial review record so it shows in the UI immediately
      const { data: review, error } = await supabase.from("ingestion_reviews").insert({
        organization_id: payload.organizationId,
        user_id: payload.userId,
        source: payload.source,
        raw_text: "",
        parsed_data: { processing: true },
        status: "PENDING"
      }).select().single();

      if (error) throw new Error(error.message);

      let sourceDocumentUrl = "";
      if (payload.imagesBase64 && payload.imagesBase64.length > 0) {
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
          
          await supabase.from("ingestion_reviews").update({
            source_document_url: sourceDocumentUrl
          }).eq("id", review.id);
        }
      }

      // Omit the huge base64 payload to prevent Redis from crashing/OOM
      const jobPayload = { 
        ...payload, 
        imagesBase64: undefined, 
        sourceDocumentUrl, 
        reviewId: review.id 
      };

      const job = await this.ingestionQueue.add("process-ingestion", jobPayload, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      });
      return { jobId: job.id!, reviewId: review.id };
    });
  }

  @Post("review/:id/commit")
  async commitReview(@Param("id") id: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { data: review, error } = await supabase.from("ingestion_reviews").select("*").eq("id", id).single();
      if (error || !review) throw new Error("Review not found");

      if (review.status === "APPROVED") return;

      const parsed = review.parsed_data as any;

      const recipesToCommit = parsed.recipes ? parsed.recipes : (parsed.title && parsed.ingredients ? [parsed] : []);

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
                  volume_ml: recipe.vessel.volumeMl || 0
                })
                .select()
                .single();
              if (newVessel) vesselId = newVessel.id;
            }
          }

          // Insert recipe (extracted recipes default to PENDING_REVIEW)
          const { data: createdRecipe, error: recipeErr } = await supabase.from("recipes").insert({
            organization_id: review.organization_id,
            title: recipe.title,
            instructions: recipe.instructions || [],
            yield_count: recipe.yieldCount || 1,
            yield_unit: recipe.yieldUnit || "servings",
            vessel_id: vesselId,
            status: "PENDING_REVIEW",
            source_document_url: review.source_document_url || null,
            source_book: recipe.sourceBook || null,
            source_author: recipe.sourceAuthor || null,
            cost_per_yield: 0,
            gross_margin: 0
          }).select().single();

          if (recipeErr) throw new Error(recipeErr.message);

          if (recipe.ingredients) {
            for (const ing of recipe.ingredients) {
              const { data: master } = await supabase
                .from("items")
                .select("id")
                .eq("organization_id", review.organization_id)
                .ilike("name", ing.name)
                .maybeSingle();

              await supabase.from("recipe_ingredients").insert({
                organization_id: review.organization_id,
                recipe_id: createdRecipe.id,
                item_id: master?.id || null,
                sub_recipe_id: null,
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                calculation_type: ing.calculationType || "WEIGHT"
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
          const { data: newVendor, error: vErr } = await supabase.from("vendors").insert({
            organization_id: review.organization_id,
            name: parsed.vendorName,
            order_method: "MANUAL"
          }).select().single();
          if (vErr) throw new Error(vErr.message);
          vendor = newVendor;
        }

        const { data: po, error: poErr } = await supabase.from("purchase_orders").insert({
          organization_id: review.organization_id,
          vendor_id: vendor!.id,
          status: "RECONCILED"
        }).select().single();

        if (poErr) throw new Error(poErr.message);

        for (const item of parsed.items) {
          await supabase.from("purchase_order_items").insert({
            po_id: po.id,
            raw_name: item.rawName,
            ordered_qty: item.quantity || 1,
            price_per_unit: item.pricePerUnit || 0
          });
        }
      }

      await supabase.from("ingestion_reviews").update({ status: "APPROVED", parsed_data: parsed }).eq("id", id);
    });
  }

  @Delete(":id")
  async deleteReview(@Param("id") id: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { error } = await supabase.from("ingestion_reviews").delete().eq("id", id);
      if (error) throw new Error(error.message);
    });
  }
}
