import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { type WhiteboardService, type CreateWhiteboardItemDto } from './whiteboard.service';
import { type ApiResponse } from './inventory.controller';

@Controller('whiteboard')
export class WhiteboardController {
  constructor(private readonly service: WhiteboardService) {}

  @Get()
  async findAllActive(): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const data = await this.service.findAllActive();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(@Body() body: CreateWhiteboardItemDto): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.create(body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.remove(id);
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
