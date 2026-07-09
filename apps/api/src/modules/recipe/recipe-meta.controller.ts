import { Controller, Get } from "@nestjs/common";
import { type RecipeMetaService } from "./recipe-meta.service";
import { type ApiResponse, type RecipeCategory, type RecipeTag } from "@soustools/api-types";

/**
 * RecipeMetaController handles categories and tags endpoints.
 * @tenant-docs-export
 */
@Controller("recipes-meta")
export class RecipeMetaController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly recipeMetaService: RecipeMetaService) {}

  @Get("categories")
  async findCategories(): Promise<ApiResponse<RecipeCategory[]>> {
    try {
      const data = await this.recipeMetaService.findAllCategories(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("tags")
  async findTags(): Promise<ApiResponse<RecipeTag[]>> {
    try {
      const data = await this.recipeMetaService.findAllTags(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
