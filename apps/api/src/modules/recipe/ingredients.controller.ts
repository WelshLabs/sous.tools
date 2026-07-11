import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { IngredientsService } from "./ingredients.service";
import { ApiResponse, MasterIngredient } from "@soustools/api-types";

@Controller("recipes/ingredients")
export class IngredientsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<MasterIngredient[]>> {
    try {
      const data = await this.ingredientsService.findAll(this.defaultOrgId);
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
  async findOne(
    @Param("id") id: string,
  ): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.findOne(id);
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
    @Body()
    payload: Omit<
      MasterIngredient,
      "id" | "organizationId" | "createdAt" | "updatedAt"
    >,
  ): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.create(
        this.defaultOrgId,
        payload,
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
    @Body() payload: Partial<MasterIngredient>,
  ): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.update(id, payload);
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
  async remove(
    @Param("id") id: string,
  ): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.remove(id);
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
