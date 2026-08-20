import {
  Controller,
  Get,
  Post,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { supabase } from "../../core/database/supabase";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller("recipes")
export class RecipeVersionsController {
  @Post(":id/versions")
  async createVersion(
    @Param("id") id: string,
  ): Promise<ApiResponse<{ versionId: string; versionNumber: number }>> {
    try {
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (recipeError || !recipe) {
        throw new NotFoundException(`Recipe with ID ${id} not found`);
      }

      const { data: ingredients, error: ingError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", id);

      if (ingError) {
        throw new Error(ingError.message);
      }

      const { data: versions, error: verError } = await supabase
        .from("formula_versions")
        .select("version_number")
        .eq("recipe_id", id)
        .order("version_number", { ascending: false })
        .limit(1);

      if (verError) {
        throw new Error(verError.message);
      }

      const nextVersion =
        versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      const { data: inserted, error: insertError } = await supabase
        .from("formula_versions")
        .insert([
          {
            recipe_id: id,
            version_number: nextVersion,
            title: recipe.title,
            yield_count: recipe.yield_count,
            yield_unit: recipe.yield_unit,
            vessel_id: recipe.vessel_id,
            instructions: recipe.instructions,
            ingredients: ingredients || [],
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return {
        success: true,
        data: {
          versionId: inserted.id,
          versionNumber: inserted.version_number,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id/versions")
  async getVersions(@Param("id") id: string): Promise<ApiResponse<unknown[]>> {
    try {
      const { data, error } = await supabase
        .from("formula_versions")
        .select("*")
        .eq("recipe_id", id)
        .order("version_number", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data || [],
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
