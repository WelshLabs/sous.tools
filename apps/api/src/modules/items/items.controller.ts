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
import { ItemsService } from "./items.service";
import type { CreateItemDto, UpdateItemDto } from "./items-query.helper";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

import { ApiTags, ApiBody, ApiResponse as NestjsApiResponse } from "@nestjs/swagger";

@ApiTags("items")
@Controller("items")
export class ItemsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly service: ItemsService) {}

  @Get()
  @NestjsApiResponse({ status: 200, description: "Success", schema: { type: "object", additionalProperties: true } })
  async findAll(
    @Query("search") search?: string,
  ): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.findAll(this.defaultOrgId, search);
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
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.findOne(id);
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
        name: { type: "string" },
        category: { type: "string", nullable: true },
        purchase_unit: { type: "string", nullable: true },
        units_per_case: { type: "number", nullable: true },
        each_weight_g: { type: "number", nullable: true },
        density_g_ml: { type: "number", nullable: true },
        shelf_life_days: { type: "number", nullable: true },
      },
      required: ["name"]
    }
  })
  @NestjsApiResponse({
    status: 201,
    description: "Success",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { type: "string" },
          }
        },
        timestamp: { type: "string" }
      }
    }
  })
  async create(@Body() dto: CreateItemDto): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.create(this.defaultOrgId, dto);
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
    @Body() dto: UpdateItemDto,
  ): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.update(id, dto);
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
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.remove(id);
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
