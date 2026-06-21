import { Controller, Post, Body, Param } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ApiResponse, IngestionPayload } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { supabase } from "../../lib/supabase";

@Controller("ingestion")
export class IngestionController {
  constructor(@InjectQueue("ingestion") private readonly ingestionQueue: Queue) {}

  @Post("submit")
  async submit(@Body() payload: IngestionPayload): Promise<ApiResponse<{ jobId: string }>> {
    return runControllerAction(async () => {
      const job = await this.ingestionQueue.add("process-ingestion", payload, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      });
      return { jobId: job.id! };
    });
  }

  @Post("review/:id/commit")
  async commitReview(@Param("id") id: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { data: review, error } = await supabase.from("ingestion_reviews").select("*").eq("id", id).single();
      if (error || !review) throw new Error("Review not found");

      if (review.status === "APPROVED") return;

      const parsed = review.parsed_data as any;

      if (parsed.title && parsed.ingredients) {
        // Recipe commit
        const { data: recipe, error: recipeErr } = await supabase.from("recipes").insert({
          organization_id: review.organization_id,
          title: parsed.title,
          instructions: [],
          yield_count: parsed.yieldCount || 1,
          yield_unit: parsed.yieldUnit || "servings",
          cost_per_yield: 0,
          gross_margin: 0
        }).select().single();

        if (recipeErr) throw new Error(recipeErr.message);

        for (const ing of parsed.ingredients) {
          const { data: master } = await supabase
            .from("master_ingredients")
            .select("id")
            .eq("organization_id", review.organization_id)
            .ilike("name", ing.name)
            .maybeSingle();

          await supabase.from("recipe_ingredients").insert({
            organization_id: review.organization_id,
            recipe_id: recipe.id,
            master_ingredient_id: master?.id || null,
            sub_recipe_id: null,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            calculation_type: ing.calculationType || "WEIGHT"
          });
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
}
