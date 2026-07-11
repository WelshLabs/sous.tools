import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { type DisplaysService } from "./displays.service";
import { type SignageGateway } from "./signage.gateway";
import { type ApiResponse } from "@soustools/api-types";
import { runControllerAction } from "./response.helper";

/**
 * Controller managing signage display endpoints.
 * Displays are single output ports (HDMI or browser URL).
 *
 * @tenant-docs-export
 */
@Controller("signage/displays")
export class DisplaysController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(
    private readonly displaysService: DisplaysService,
    private readonly signageGateway: SignageGateway,
  ) {}

  @Get("active-connections")
  async getActiveConnections(): Promise<ApiResponse<Record<string, boolean>>> {
    return runControllerAction(async () => {
      const displays = (await this.displaysService.findAll(
        this.defaultOrgId,
      )) as Array<{ id: string }>;
      const connections: Record<string, boolean> = {};
      for (const display of displays) {
        connections[display.id] = this.signageGateway.isDisplayOnline(
          display.id,
        );
      }
      return connections;
    });
  }

  @Get()
  async findAll(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(() =>
      this.displaysService.findAll(this.defaultOrgId),
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.findOne(id));
  }

  /** Creates a browser-only display (no hardware device). */
  @Post()
  async create(
    @Body("name") name: string,
    @Body("deckId") deckId?: string | null,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.create(this.defaultOrgId, name, deckId),
    );
  }

  /** Assigns a deck to a display or renames it. */
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("deckId") deckId?: string | null,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.update(id, name, deckId),
    );
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.remove(id));
  }

  /** Player heartbeat — updates last_seen_at. */
  @Post(":id/heartbeat")
  async heartbeat(@Param("id") id: string): Promise<ApiResponse<null>> {
    return runControllerAction(async () => {
      await this.displaysService.heartbeat(id);
      return null;
    });
  }

  /** Confirm pairing of a hardware device. */
  @Post("pair/confirm")
  async confirmPairing(
    @Body("pairingCode") pairingCode: string,
    @Body("name") name: string,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.pairDevice(this.defaultOrgId, pairingCode, name),
    );
  }
}
