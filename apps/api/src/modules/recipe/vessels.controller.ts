import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { type VesselsService } from "./vessels.service";
import { type ApiResponse, type VesselProfile } from "@soustools/api-types";

@Controller("recipes/vessels")
export class VesselsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly vesselsService: VesselsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<VesselProfile[]>> {
    try {
      const data = await this.vesselsService.findAll(this.defaultOrgId);
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
  async findOne(@Param("id") id: string): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.findOne(id);
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
    @Body() payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">
  ): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.create(this.defaultOrgId, payload);
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
    @Body() payload: Partial<VesselProfile>
  ): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.update(id, payload);
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
  async remove(@Param("id") id: string): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.remove(id);
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
