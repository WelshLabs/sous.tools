import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "./signage.gateway";
import { SignageLayoutConfig } from "@soustools/api-types";

@Injectable()
export class LayoutsService {
  constructor(private readonly gateway: SignageGateway) {}

  async findAll(orgId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("signage_layouts")
      .select("*")
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_layouts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async create(
    orgId: string,
    name: string,
    type: string,
    config: SignageLayoutConfig,
  ): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_layouts")
      .insert([{ organization_id: orgId, name, type, config }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(
    id: string,
    name?: string,
    type?: string,
    config?: SignageLayoutConfig,
  ): Promise<unknown> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (config !== undefined) updateData.config = config;

    const { data, error } = await supabase
      .from("signage_layouts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (config !== undefined) {
      // Find displays using this layout to trigger updates
      const { data: displays } = await supabase
        .from("signage_displays")
        .select("id")
        .eq("layout_id", id);

      if (displays) {
        for (const display of displays) {
          this.gateway.broadcastLayoutUpdate(display.id);
        }
      }
    }

    return data;
  }

  async remove(id: string): Promise<unknown> {
    // Notify displays using this layout that it's gone
    const { data: displays } = await supabase
      .from("signage_displays")
      .select("id")
      .eq("layout_id", id);

    const { data, error } = await supabase
      .from("signage_layouts")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (displays) {
      for (const display of displays) {
        this.gateway.broadcastLayoutUpdate(display.id);
      }
    }

    return data;
  }
}
