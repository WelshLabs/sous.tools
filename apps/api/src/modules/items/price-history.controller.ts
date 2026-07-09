import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import {
  PriceHistoryService,
  type RecordPriceDto,
} from "./price-history.service";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller("items")
export class PriceHistoryController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly service: PriceHistoryService) {}

  @Post(":id/price")
  async recordPrice(
    @Param("id") id: string,
    @Body() body: Omit<RecordPriceDto, "itemId" | "orgId">,
  ): Promise<ApiResponse<void>> {
    try {
      await this.service.recordPrice({
        itemId: id,
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

  @Get(":id/price-history")
  async getHistory(@Param("id") id: string): Promise<ApiResponse<unknown[]>> {
    try {
      const data = await this.service.getHistory(id);
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
