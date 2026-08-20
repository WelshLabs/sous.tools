import { Injectable } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";

export interface LinkRecipeDto {
  orgId: string;
  posItemId: string;
  recipeId: string;
  portionFraction?: number;
}

@Injectable()
export class PosLinksService {
  async linkRecipeToItem(dto: LinkRecipeDto): Promise<void> {
    const { error } = await supabase.from("pos_item_recipe_links").upsert(
      {
        organization_id: dto.orgId,
        pos_item_id: dto.posItemId,
        recipe_id: dto.recipeId,
        portion_fraction: dto.portionFraction ?? 1.0,
      },
      {
        onConflict: "pos_item_id,recipe_id",
      },
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async getLinksForPosItem(
    posItemId: string,
  ): Promise<{ recipeId: string; portionFraction: number }[]> {
    const { data, error } = await supabase
      .from("pos_item_recipe_links")
      .select("recipe_id, portion_fraction")
      .eq("pos_item_id", posItemId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(
      (row: { recipe_id: string; portion_fraction: number }) => ({
        recipeId: row.recipe_id,
        portionFraction: Number(row.portion_fraction) || 1.0,
      }),
    );
  }
}
