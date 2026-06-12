import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { VesselProfile } from "@soustools/api-types";

@Injectable()
export class VesselsService {
  async findAll(orgId: string): Promise<VesselProfile[]> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRow);
  }

  async findOne(id: string): Promise<VesselProfile> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async create(
    orgId: string,
    payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">
  ): Promise<VesselProfile> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .insert([
        {
          organization_id: orgId,
          name: payload.name,
          shape: payload.shape,
          length: payload.length,
          width: payload.width,
          height: payload.height,
          diameter: payload.diameter,
          volume_ml: payload.volumeMl,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, payload: Partial<VesselProfile>): Promise<VesselProfile> {
    const updateData: Record<string, any> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.shape !== undefined) updateData.shape = payload.shape;
    if (payload.length !== undefined) updateData.length = payload.length;
    if (payload.width !== undefined) updateData.width = payload.width;
    if (payload.height !== undefined) updateData.height = payload.height;
    if (payload.diameter !== undefined) updateData.diameter = payload.diameter;
    if (payload.volumeMl !== undefined) updateData.volume_ml = payload.volumeMl;

    const { data, error } = await supabase
      .from("vessel_profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async remove(id: string): Promise<VesselProfile> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  private mapRow(row: any): VesselProfile {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      shape: row.shape,
      length: row.length !== null ? Number(row.length) : null,
      width: row.width !== null ? Number(row.width) : null,
      height: row.height !== null ? Number(row.height) : null,
      diameter: row.diameter !== null ? Number(row.diameter) : null,
      volumeMl: Number(row.volume_ml),
      createdAt: row.created_at,
    };
  }
}
