import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { RecipesService } from "./recipes.service";
import { RecipeCostService } from "./recipe-cost.service";
import { ApiResponse, Recipe, RecipeIngredient } from "@soustools/api-types";

@Controller("recipes")
export class RecipesController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(
    private readonly recipesService: RecipesService,
    private readonly recipeCostService: RecipeCostService,
  ) {}

  @Get()
  async findAll(): Promise<ApiResponse<Recipe[]>> {
    try {
      const data = await this.recipesService.findAll(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id/cost")
  async getRecipeCost(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.recipeCostService.getRecipeCost(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.findOne(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(
    @Body("recipe")
    recipe: Omit<
      Recipe,
      "id" | "organizationId" | "createdAt" | "recipeIngredients" | "vessel"
    >,
    @Body("recipeIngredients")
    recipeIngredients: Omit<
      RecipeIngredient,
      "id" | "recipeId" | "createdAt" | "masterIngredient"
    >[],
  ): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.create(
        this.defaultOrgId,
        recipe,
        recipeIngredients,
      );
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("recipe") recipe: Partial<Recipe>,
    @Body("recipeIngredients")
    recipeIngredients?: Omit<
      RecipeIngredient,
      "id" | "recipeId" | "createdAt" | "masterIngredient"
    >[],
  ): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.update(
        id,
        recipe,
        recipeIngredients,
      );
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.remove(id);
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
