import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
} from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { ApiResponse, SignageDevice } from "@soustools/api-types";
import { runControllerAction } from "./response.helper";

/**
 * Controller managing signage hardware device settings.
 *
 * @tenant-docs-export
 * Manages settings for paired hardware displays such as timezone and maintenance window settings.
 */
@Controller("signage/devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * Registers a new physical device, returning its assigned ID and 6-digit pairing code.
   * This is called by the Pi on first boot when it has no tenant config.
   */
  @Post("register")
  async register(): Promise<ApiResponse<{ deviceId: string; pairingCode: string }>> {
    return runControllerAction(() => this.devicesService.register());
  }

  /**
   * Poll endpoint for the Pi to check if a user has entered its pairing code.
   */
  @Get(":deviceId/status")
  async getStatus(@Param("deviceId") deviceId: string): Promise<ApiResponse<{ paired: boolean; supabaseUrl?: string; supabaseAnonKey?: string }>> {
    return runControllerAction(() => this.devicesService.getStatus(deviceId));
  }

  /**
   * Loads the paired device's current settings.
   */
  @Get(":deviceId")
  async findOne(@Param("deviceId") deviceId: string): Promise<ApiResponse<SignageDevice>> {
    return runControllerAction(() => this.devicesService.findOne(deviceId));
  }

  /**
   * Saves the updated device configuration.
   */
  @Put(":deviceId")
  async update(
    @Param("deviceId") deviceId: string,
    @Body("name") name?: string,
    @Body("timezone") timezone?: string,
    @Body("maintenanceWindow") maintenanceWindow?: {
      hour: number;
      minute: number;
      dayOfWeek: number | null;
    },
  ): Promise<ApiResponse<SignageDevice>> {
    return runControllerAction(() =>
      this.devicesService.update(deviceId, name, timezone, maintenanceWindow),
    );
  }
}
