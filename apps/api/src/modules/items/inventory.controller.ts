import { Controller, Get, Post, Body } from "@nestjs/common";
import { InventoryService, type AdjustStockDto } from "./inventory.service";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller("inventory")
export class InventoryController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly service: InventoryService) {}

  @Get()
  async getCurrentStock(): Promise<ApiResponse<unknown[]>> {
    try {
      const data = await this.service.getCurrentStock(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("adjust")
  async adjustStock(
    @Body() body: Omit<AdjustStockDto, "orgId">,
  ): Promise<ApiResponse<void>> {
    try {
      await this.service.adjustStock({
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
}
