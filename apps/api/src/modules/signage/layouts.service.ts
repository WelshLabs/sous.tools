import { Injectable } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";
import { SignageGateway } from "./signage.gateway";
import { Inject } from "@nestjs/common";
import { SignageLayoutConfig } from "@soustools/api-types";

/**
 * Service for CRUD operations on signage decks.
 * Broadcasts Socket.io events to connected players after saves.
 */
@Injectable()
export class LayoutsService {
  constructor(
    @Inject(SignageGateway) private readonly gateway: SignageGateway,
  ) {}

  async findAll(orgId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("signage_decks")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findOne(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_decks")
      .select("*, organizations(design_tokens)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    if (data && data.organizations) {
      data.config = {
        ...data.config,
        designTokens: (
          data.organizations as unknown as { design_tokens: unknown }
        ).design_tokens,
      };
      delete data.organizations;
    }
    return data;
  }

  async findBySlug(orgId: string, slug: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_decks")
      .select("*, organizations(design_tokens)")
      .eq("organization_id", orgId)
      .eq("slug", slug)
      .single();

    if (error) throw new Error(error.message);
    if (data && data.organizations) {
      data.config = {
        ...data.config,
        designTokens: (
          data.organizations as unknown as { design_tokens: unknown }
        ).design_tokens,
      };
      delete data.organizations;
    }
    return data;
  }

  async create(orgId: string, name: string): Promise<unknown> {
    const slug = this.generateSlug(name);
    const { data, error } = await supabase
      .from("signage_decks")
      .insert([
        {
          organization_id: orgId,
          name,
          slug,
          config: { soldOutBehavior: "LABEL", slides: [], overlays: [] },
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    id: string,
    name?: string,
    slug?: string,
    config?: SignageLayoutConfig,
  ): Promise<unknown> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) {
      updateData.name = name;
      if (slug === undefined) updateData.slug = this.generateSlug(name);
    }
    if (slug !== undefined) updateData.slug = slug;
    if (config !== undefined) updateData.config = config;

    const { data, error } = await supabase
      .from("signage_decks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (config !== undefined && data) {
      this.gateway.broadcastDeckUpdate(id, config);
    }
    return data;
  }

  async remove(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_decks")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || `deck-${Date.now()}`
    );
  }
}

// (removed debug logs)
