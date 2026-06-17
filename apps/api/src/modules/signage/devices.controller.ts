import {
  Controller,
  Get,
  Put,
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
