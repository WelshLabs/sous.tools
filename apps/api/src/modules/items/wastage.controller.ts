import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { type WastageService, type RecordWastageDto } from "./wastage.service";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller("wastage")
export class WastageController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly service: WastageService) {}

  @Post()
  async recordWastage(
    @Body() body: Omit<RecordWastageDto, "orgId">,
  ): Promise<ApiResponse<void>> {
    try {
      await this.service.recordWastage({
        orgId: this.defaultOrgId,
        ...body,
      });
      return { success: true, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("report")
  async getWastageReport(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ): Promise<ApiResponse<unknown[]>> {
    try {
      const start =
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();
      const data = await this.service.getWastageReport(
        this.defaultOrgId,
        start,
        end,
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
}
