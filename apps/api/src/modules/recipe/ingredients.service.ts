import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { MasterIngredient } from "@soustools/api-types";

@Injectable()
export class IngredientsService {
  async findAll(orgId: string): Promise<MasterIngredient[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRow);
  }

  async findOne(id: string): Promise<MasterIngredient> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async create(
    orgId: string,
    payload: Omit<MasterIngredient, "id" | "organizationId" | "createdAt" | "updatedAt">
  ): Promise<MasterIngredient> {
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          organization_id: orgId,
          name: payload.name,
          density_g_ml: payload.densityGMl,
          nutrition_macros: payload.nutritionMacros,
          allergens: payload.allergens,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, payload: Partial<MasterIngredient>): Promise<MasterIngredient> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.densityGMl !== undefined) updateData.density_g_ml = payload.densityGMl;
    if (payload.nutritionMacros !== undefined) updateData.nutrition_macros = payload.nutritionMacros;
    if (payload.allergens !== undefined) updateData.allergens = payload.allergens;

    const { data, error } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async remove(id: string): Promise<MasterIngredient> {
    const { data, error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  private mapRow(row: {
    id: string;
    organization_id: string;
    name: string;
    density_g_ml?: number;
    nutrition_macros?: Record<string, unknown>;
    allergens?: string[];
    current_cost_per_g?: number;
    created_at: string;
    updated_at: string;
  }): MasterIngredient {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      densityGMl: Number(row.density_g_ml || 0),
      nutritionMacros: row.nutrition_macros || { calories: null, proteinG: null, carbsG: null, fatG: null },
      allergens: row.allergens || [],
      currentCostPerG: Number(row.current_cost_per_g || 0) || 0,
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || "",
    };
  }
}
