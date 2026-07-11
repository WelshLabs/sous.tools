import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import {
  type VendorsService,
  type CreateVendorDto,
  type UpdateVendorDto,
} from "./vendors.service";
import { type ApiResponse } from "./inventory.controller";

@Controller("vendors")
export class VendorsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly service: VendorsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const data = await this.service.findAll(this.defaultOrgId);
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
  ): Promise<ApiResponse<Record<string, unknown>>> {
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
  async create(
    @Body() body: CreateVendorDto,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.create(this.defaultOrgId, body);
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
    @Body() body: UpdateVendorDto,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.update(id, body);
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
  ): Promise<ApiResponse<Record<string, unknown>>> {
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
