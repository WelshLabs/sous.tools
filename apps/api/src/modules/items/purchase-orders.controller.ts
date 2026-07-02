import { Controller, Post, Body } from '@nestjs/common';
import { PurchaseOrdersService, CreatePurchaseOrderDto } from './purchase-orders.service';
import { ApiResponse } from './inventory.controller';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post()
  async create(@Body() body: CreatePurchaseOrderDto): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.createPo(body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
