import { Controller, Get, Post, Body, NotFoundException } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "../signage/signage.gateway";
import { ApiResponse } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { getMockItems } from "./pos-simulator.helpers";

/**
 * Controller simulating Point of Sale (POS) updates from Square.
 *
 * @tenant-docs-export
 * Simulated square events such as item stock toggling can be dispatched here to update displays.
 */
@Controller("pos-simulator")
export class PosSimulatorController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly gateway: SignageGateway) {}

  /**
   * Retrieves all items registered in the simulated POS system.
   *
   * @returns Array of POS items.
   */
  @Get("items")
  async getItems(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from("square_items")
        .select("*")
        .eq("organization_id", this.defaultOrgId);

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    });
  }

  /**
   * Seeds the simulated database with standard menu items.
   *
   * @returns Array of seeded POS items.
   */
  @Post("seed")
  async seedItems(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(async () => {
      const mockItems = getMockItems(this.defaultOrgId);

      const { data, error } = await supabase
        .from("square_items")
        .upsert(mockItems, { onConflict: "organization_id,square_id" })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    });
  }

  /**
   * Toggles the sold out state of a specific menu item.
   *
   * @param itemId - The database UUID of the item.
   * @param squareId - The external Square ID of the item.
   * @param isSoldOut - The new sold out status.
   * @returns The updated POS item.
   */
  @Post("items/toggle-sold-out")
  async toggleSoldOut(
    @Body("itemId") itemId?: string,
    @Body("squareId") squareId?: string,
    @Body("isSoldOut") isSoldOut?: boolean,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(async () => {
      if (isSoldOut === undefined) {
        throw new Error("isSoldOut parameter is required");
      }

      let query = supabase
        .from("square_items")
        .update({
          is_sold_out: isSoldOut,
          updated_at: new Date().toISOString(),
        });

      if (itemId) {
        query = query.eq("id", itemId);
      } else if (squareId) {
        query = query.eq("square_id", squareId);
      } else {
        throw new Error("Either itemId or squareId is required");
      }

      const { data, error } = await query.select().single();

      if (error || !data) {
        throw new NotFoundException(error?.message || "Item not found");
      }

      // Find all displays that are paired to broadcast update
      const { data: displays } = await supabase
        .from("signage_displays")
        .select("id")
        .eq("is_paired", true);

      if (displays) {
        for (const display of displays) {
          this.gateway.broadcastLayoutUpdate(display.id);
        }
      }

      return data;
    });
  }
}
