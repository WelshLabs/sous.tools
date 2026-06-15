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
import { runControllerAction } from "./response.helper";

/**
 * REST controller for signage deck CRUD operations.
 * Replaces the old signage_layouts table with signage_decks.
 */
@Controller("signage/layouts")
export class LayoutsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly layoutsService: LayoutsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(() => this.layoutsService.findAll(this.defaultOrgId));
  }

  @Get("slug/:orgSlug/:deckSlug")
  async findBySlug(
    @Param("orgSlug") _orgSlug: string,
    @Param("deckSlug") deckSlug: string,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.layoutsService.findBySlug(this.defaultOrgId, deckSlug),
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.layoutsService.findOne(id));
  }

  @Post()
  async create(
    @Body("name") name: string,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.layoutsService.create(this.defaultOrgId, name ?? "New Deck"),
    );
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("slug") slug?: string,
    @Body("config") config?: SignageLayoutConfig,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.layoutsService.update(id, name, slug, config),
    );
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.layoutsService.remove(id));
  }
}
