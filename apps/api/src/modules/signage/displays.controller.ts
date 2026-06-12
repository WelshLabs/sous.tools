import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { DisplaysService } from "./displays.service";
import { ApiResponse } from "@soustools/api-types";
import { runControllerAction } from "./response.helper";

/**
 * Controller managing display signage endpoints.
 *
 * @tenant-docs-export
 * Integrates display pairing, layout scheduling, and online status polling for physical displays.
 */
@Controller("signage/displays")
export class DisplaysController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly displaysService: DisplaysService) {}

  /**
   * Retrieves all signage displays configured for the organization.
   *
   * @returns List of all signage displays.
   */
  @Get()
  async findAll(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(() => this.displaysService.findAll(this.defaultOrgId));
  }

  /**
   * Retrieves details for a specific display device.
   *
   * @param id - The unique ID of the display device.
   * @returns Detailed signage display object.
   */
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.findOne(id));
  }

  /**
   * Manually creates a new signage display within the default organization.
   *
   * @param name - The custom label for the display.
   * @param layoutId - Optional layout ID to associate with the display.
   * @returns The created signage display.
   */
  @Post()
  async create(
    @Body("name") name: string,
    @Body("layoutId") layoutId?: string | null,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.create(this.defaultOrgId, name, layoutId)
    );
  }

  /**
   * Updates configuration settings on a specific display.
   *
   * @param id - The ID of the display.
   * @param name - The new name.
   * @param layoutId - The new layout ID.
   * @param isPaired - The pairing state.
   * @returns The updated display resource.
   */
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("layoutId") layoutId?: string | null,
    @Body("isPaired") isPaired?: boolean,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.update(id, name, layoutId, isPaired)
    );
  }

  /**
   * Deletes a signage display.
   *
   * @param id - The unique display ID.
   * @returns The deleted display record.
   */
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.remove(id));
  }

  /**
   * Generates a unique pairing code and registers a new display device node.
   *
   * @param name - Optional user-defined display name.
   * @returns The registered display item containing the newly generated pairing code.
   */
  @Post("pair/register")
  async register(@Body("name") name?: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.registerPairingCode(name));
  }

  /**
   * Confirms a pairing request from a physical display using a pairing code.
   *
   * @param pairingCode - The code entered by the operator.
   * @param name - Optional updated display name.
   * @param layoutId - Optional layout ID to apply upon successful pairing.
   * @returns The paired display device node.
   */
  @Post("pair/confirm")
  async confirm(
    @Body("pairingCode") pairingCode: string,
    @Body("name") name?: string,
    @Body("layoutId") layoutId?: string | null,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.confirmPairing(pairingCode, name, layoutId)
    );
  }
}
