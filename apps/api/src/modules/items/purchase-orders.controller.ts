import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { PurchaseOrdersService, type AddItemToDraftDto, type UpdatePoItemDto,
} from "./purchase-orders.service";
import { ApiResponse } from "./inventory.controller";

@Controller("purchase-orders")
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const data = await this.service.findAll();
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

  @Post("draft-item")
  async addItemToDraft(
    @Body() body: AddItemToDraftDto,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.addItemToDraft(body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("items/:id")
  async updateItem(
    @Param("id") id: string,
    @Body() body: UpdatePoItemDto,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.updateItem(id, body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("items/:id")
  async removeItem(
    @Param("id") id: string,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.removeItem(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch(":id/submit")
  async submitPo(
    @Param("id") id: string,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.submitPo(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch(":id/receive")
  async receivePo(
    @Param("id") id: string,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.receivePo(id);
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
