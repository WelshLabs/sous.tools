import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { LayoutsService } from "./layouts.service";
import { ApiResponse, SignageLayoutConfig } from "@soustools/api-types";

@Controller("signage/layouts")
export class LayoutsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly layoutsService: LayoutsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<unknown[]>> {
    try {
      const data = await this.layoutsService.findAll(this.defaultOrgId);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.layoutsService.findOne(id);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(
    @Body("name") name: string,
    @Body("type") type: string,
    @Body("config") config: SignageLayoutConfig,
  ): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.layoutsService.create(
        this.defaultOrgId,
        name,
        type,
        config,
      );
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("type") type?: string,
    @Body("config") config?: SignageLayoutConfig,
  ): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.layoutsService.update(id, name, type, config);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.layoutsService.remove(id);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
