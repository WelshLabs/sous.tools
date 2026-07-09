import { Injectable, NotFoundException } from "@nestjs/common";
import { supabase } from "../../lib/supabase";

export interface CostIngredient {
  ingredientId: string;
  name: string;
  weightG: number;
  costUsd: number;
}

export interface RecipeCost {
  totalCostUsd: number;
  costPerServingUsd: number;
  linkedSalePrice?: number;
  marginPct?: number;
  ingredients: CostIngredient[];
  suggestedSalePrice?: number;
}

@Injectable()
export class RecipeCostService {
  async getRecipeCost(
    recipeId: string,
    wastePct: number = 0,
    portions: number = 1,
  ): Promise<RecipeCost> {
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("yield_count")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    const { data: ingredients, error: ingError } = await supabase
      .from("recipe_ingredients")
      .select(
        `
        id,
        amount,
        unit,
        items (
          id,
          name,
          density_g_ml,
          each_weight_g,
          units_per_case,
          current_cost_per_g
        )
      `,
      )
      .eq("recipe_id", recipeId);

    if (ingError) {
      throw new Error(ingError.message);
    }

    const costIngredients: CostIngredient[] = [];
    let totalCostUsd = 0;

    for (const ing of ingredients || []) {
      const item = ing.items as unknown as {
        id: string;
        name: string;
        density_g_ml?: number;
        each_weight_g?: number;
        units_per_case?: number;
        current_cost_per_g?: number;
      } | null;
      if (!item) continue;

      const density = Number(item.density_g_ml) || 1.0;
      const eachWeight = Number(item.each_weight_g) || 0;
      const unitsPerCase = Number(item.units_per_case) || 0;
      const costPerG = Number(item.current_cost_per_g) || 0;
      const amount = Number(ing.amount) || 0;
      const unit = (ing.unit || "").toUpperCase();

      let weightG = 0;
      switch (unit) {
        case "G":
          weightG = amount;
          break;
        case "KG":
          weightG = amount * 1000;
          break;
        case "LB":
          weightG = amount * 453.59237;
          break;
        case "OZ":
          weightG = amount * 28.349523;
          break;
        case "ML":
          weightG = amount * density;
          break;
        case "L":
          weightG = amount * density * 1000;
          break;
        case "TSP":
          weightG = amount * density * 4.92892;
          break;
        case "TBSP":
          weightG = amount * density * 14.7868;
          break;
        case "CUP":
          weightG = amount * density * 236.588;
          break;
        case "GAL":
          weightG = amount * density * 3785.41;
          break;
        case "QT":
          weightG = amount * density * 946.353;
          break;
        case "EACH":
          weightG = amount * eachWeight;
          break;
        case "CASE":
          weightG = amount * eachWeight * unitsPerCase;
          break;
        default:
          weightG = amount;
      }

      const costUsd = weightG * costPerG;
      totalCostUsd += costUsd;

      costIngredients.push({
        ingredientId: item.id,
        name: item.name,
        weightG,
        costUsd,
      });
    }

    // Apply yield loss: True Batch Cost = Raw Batch Cost / (1 - (wastePct / 100))
    const safeWastePct = Math.min(Math.max(wastePct, 0), 99.9);
    const trueBatchCostUsd = totalCostUsd / (1 - safeWastePct / 100);

    // Apply portion sizing: True Plate Cost
    const safePortions = portions > 0 ? portions : 1;
    const costPerServingUsd = trueBatchCostUsd / safePortions;

    const { data: link, error: linkError } = await supabase
      .from("pos_item_recipe_links")
      .select("portion_fraction, pos_items (price)")
      .eq("recipe_id", recipeId)
      .limit(1)
      .maybeSingle();

    let linkedSalePrice: number | undefined;
    let marginPct: number | undefined;

    if (!linkError && link) {
      const posItem = link.pos_items as unknown as { price?: number } | null;
      if (posItem && posItem.price) {
        const salePrice = Number(posItem.price) || 0;
        const portion = Number(link.portion_fraction) || 1.0;
        linkedSalePrice = salePrice;
        const servingPrice = salePrice * portion;
        if (servingPrice > 0) {
          marginPct = ((servingPrice - costPerServingUsd) / servingPrice) * 100;
        }
      }
    }

    const suggestedSalePrice = costPerServingUsd / 0.28;

    return {
      totalCostUsd: trueBatchCostUsd, // Returning the adjusted batch cost
      costPerServingUsd,
      linkedSalePrice,
      marginPct,
      suggestedSalePrice,
      ingredients: costIngredients,
    };
  }
}
