import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AdminGuard } from "../../shared/guards/admin.guard";
import { DevicesService } from "./devices.service";
import { ApiResponse, SignageDevice } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { z } from "zod";

const PairSchema = z.object({
  hardwareMac: z.string().optional().default("00:00:00:00:00:00"),
  tenantAdminToken: z.string().optional().default("dummy-token"),
  requestedName: z.string().optional().default("Dummy Device"),
});

/**
 * Controller managing signage hardware device settings.
 *
 * @tenant-docs-export
 * Manages settings for paired hardware displays such as timezone and maintenance window settings.
 */
@Controller("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * Registers a new physical device, returning its assigned ID and 6-digit pairing code.
   * This is called by the Pi on first boot when it has no tenant config.
   */
  @Post("register")
  async register(): Promise<
    ApiResponse<{ deviceId: string; pairingCode: string }>
  > {
    return runControllerAction(() => this.devicesService.register());
  }

  /**
   * Poll endpoint for the Pi to check if a user has entered its pairing code.
   */
  @Get(":deviceId/status")
  async getStatus(@Param("deviceId") deviceId: string): Promise<
    ApiResponse<{
      paired: boolean;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    }>
  > {
    return runControllerAction(() => this.devicesService.getStatus(deviceId));
  }

  /**
   * Loads the paired device's current settings.
   */
  @Get(":deviceId")
  async findOne(
    @Param("deviceId") deviceId: string,
  ): Promise<ApiResponse<SignageDevice>> {
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
    @Body("maintenanceWindow")
    maintenanceWindow?: {
      hour: number;
      minute: number;
      dayOfWeek: number | null;
    },
  ): Promise<ApiResponse<SignageDevice>> {
    return runControllerAction(() =>
      this.devicesService.update(deviceId, name, timezone, maintenanceWindow),
    );
  }

  /**
   * Captive Portal Handshake - Pairs a device via MAC address and Tenant Token.
   */
  @Post("pair")
  async pair(
    @Body() body: any,
  ): Promise<ApiResponse<{ device_pairing_token: string }>> {
    const result = PairSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return runControllerAction(() =>
      this.devicesService.pair(
        result.data.hardwareMac,
        result.data.tenantAdminToken,
        result.data.requestedName,
      ),
    );
  }

  @Post("pair/init")
  async initPairing(
    @Body("deviceType") deviceType: "wearos" | "rpi",
  ): Promise<ApiResponse<{ code: string }>> {
    return runControllerAction(() =>
      this.devicesService.initPairing(deviceType),
    );
  }

  @Post("pair/confirm")
  async confirmPairing(
    @Body("code") code: string,
    @Body("deviceType") deviceType: "wearos" | "rpi",
    @Req() req: any,
  ): Promise<ApiResponse<{ success: boolean }>> {
    return runControllerAction(() =>
      this.devicesService.confirmPairing(code, deviceType, req.user),
    );
  }

  @Get("pair/status/:code")
  async getPairingStatus(
    @Param("code") code: string,
  ): Promise<ApiResponse<{ status: string; token?: string }>> {
    return runControllerAction(() =>
      this.devicesService.getPairingStatus(code),
    );
  }

  @Post(":id/revoke")
  @UseGuards(AdminGuard)
  async revokeDevice(
    @Param("id") id: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    return runControllerAction(() => this.devicesService.revokeDevice(id));
  }
}
