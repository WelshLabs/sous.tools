import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { RecipesService } from "./recipes.service";
import { RecipeCostService } from "./recipe-cost.service";
import { ApiResponse, Recipe, RecipeIngredient,
} from "@soustools/api-types";

import { ApiTags, ApiBody, ApiResponse as NestjsApiResponse } from "@nestjs/swagger";

@ApiTags("recipes")
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
  async getRecipeCost(
    @Param("id") id: string,
    @Query("wastePct") wastePct?: string,
    @Query("portions") portions?: string,
  ): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.recipeCostService.getRecipeCost(
        id,
        wastePct ? Number(wastePct) : 0,
        portions ? Number(portions) : 1,
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
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        recipe: {
          type: "object",
          properties: {
            title: { type: "string" },
            yieldCount: { type: "number" },
            yieldUnit: { type: "string" },
            instructions: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  stepNumber: { type: "number" },
                  timerDurationSeconds: { type: "number", nullable: true }
                }
              }
            },
            status: { type: "string" }
          }
        },
        recipeIngredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              masterIngredientId: { type: "string" },
              calculationType: { type: "string" },
              baseCalculationGroup: { type: "boolean" },
              amount: { type: "number" },
              unit: { type: "string" },
              rawName: { type: "string" },
              prepNotes: { type: "string", nullable: true }
            }
          }
        }
      },
      required: ["recipe", "recipeIngredients"]
    }
  })
  @NestjsApiResponse({ status: 201, description: "Success", schema: { type: "object", additionalProperties: true } })
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
