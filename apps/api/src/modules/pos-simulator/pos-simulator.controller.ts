import { Controller, Get, Post, Body, Query, NotFoundException } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "../signage/signage.gateway";
import { ApiResponse } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { getMockItems, handleSquareStockToggle, resolveItemDetails } from "./pos-simulator.helpers";

/**
 * Controller simulating Point of Sale (POS) updates from Square.
 */
@Controller("pos-simulator")
export class PosSimulatorController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly gateway: SignageGateway) {}

  @Get("items")
  async getItems(@Query("organizationId") organizationId?: string): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(async () => {
      const orgId = organizationId || this.defaultOrgId;
      const { data, error } = await supabase
        .from("square_items")
        .select("*")
        .eq("organization_id", orgId);

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    });
  }

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

  @Post("items/toggle-sold-out")
  async toggleSoldOut(
    @Body("itemId") itemId?: string,
    @Body("squareId") squareId?: string,
    @Body("isSoldOut") isSoldOut?: boolean,
    @Body("quantity") quantity?: number,
    @Body("unlimited") unlimited?: boolean,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(async () => {
      if (isSoldOut === undefined) {
        throw new Error("isSoldOut parameter is required");
      }

      const { orgId, targetSquareId } = await resolveItemDetails(supabase, itemId, squareId, this.defaultOrgId);

      const { data: integration } = await supabase
        .from("integrations")
        .select("access_token")
        .eq("organization_id", orgId)
        .eq("provider", "SQUARE")
        .maybeSingle();

      if (integration && targetSquareId) {
        await handleSquareStockToggle(targetSquareId, isSoldOut, integration.access_token, quantity, unlimited);
      }

      let query = supabase
        .from("square_items")
        .update({
          is_sold_out: isSoldOut,
          updated_at: new Date().toISOString(),
        });

      if (itemId) {
        query = query.eq("id", itemId);
      } else if (targetSquareId) {
        query = query.eq("square_id", targetSquareId);
      } else {
        throw new Error("Either itemId or squareId is required");
      }

      const { data, error } = await query.select().single();

      if (error || !data) {
        throw new NotFoundException(error?.message || "Item not found");
      }

      // Broadcast updated config and items list to all decks (players will hot-swap in real-time)
      const { data: decks } = await supabase
        .from("signage_decks")
        .select("id, config")
        .eq("organization_id", orgId);

      const { data: allItems } = await supabase
        .from("square_items")
        .select("*")
        .eq("organization_id", orgId);

      if (decks) {
        for (const deck of decks) {
          this.gateway.broadcastDeckUpdate(
            deck.id as string,
            deck.config as Parameters<typeof this.gateway.broadcastDeckUpdate>[1],
          );
          this.gateway.broadcastItemsUpdate(
            deck.id as string,
            allItems || [],
          );
        }
      }

      return data;
    });
  }
}
