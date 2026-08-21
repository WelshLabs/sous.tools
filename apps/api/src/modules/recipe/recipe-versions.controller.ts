import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { RecipeVersionsService } from "./recipe-versions.service";
import { FormulaVersion, Recipe } from "@soustools/api-types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller("recipes")
export class RecipeVersionsController {
  constructor(private readonly versionsService: RecipeVersionsService) {}

  @Post(":id/versions")
  async createVersion(
    @Param("id") id: string,
    @Body() body?: { title?: string; note?: string },
  ): Promise<
    ApiResponse<{
      versionId: string;
      versionNumber: number;
      snapshot: FormulaVersion;
    }>
  > {
    try {
      const snapshot = await this.versionsService.createSnapshot(id, body);
      return {
        success: true,
        data: {
          versionId: snapshot.id,
          versionNumber: snapshot.versionNumber,
          snapshot,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id/versions")
  async getVersions(
    @Param("id") id: string,
  ): Promise<ApiResponse<FormulaVersion[]>> {
    try {
      const versions = await this.versionsService.getVersions(id);
      return {
        success: true,
        data: versions,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id/versions/:versionNumber")
  async getVersion(
    @Param("id") id: string,
    @Param("versionNumber", ParseIntPipe) versionNumber: number,
  ): Promise<ApiResponse<FormulaVersion>> {
    try {
      const version = await this.versionsService.getVersion(id, versionNumber);
      return {
        success: true,
        data: version,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post(":id/versions/:versionNumber/restore")
  async restoreVersion(
    @Param("id") id: string,
    @Param("versionNumber", ParseIntPipe) versionNumber: number,
  ): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.versionsService.restoreVersion(
        id,
        versionNumber,
      );
      return {
        success: true,
        data: recipe,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
