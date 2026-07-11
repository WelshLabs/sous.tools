import { Injectable, NotFoundException } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { type UsdaResolverService } from "../nutrition/usda-resolver.service";
import {
  type CreateItemDto,
  type UpdateItemDto,
  classifyItemDietAndAllergens,
} from "./items-query.helper";

@Injectable()
export class ItemsService {
  constructor(private readonly usdaResolverService: UsdaResolverService) {}

  async findAll(
    orgId: string,
    search?: string,
  ): Promise<Record<string, unknown>[]> {
    let q = supabase.from("items").select("*").eq("organization_id", orgId);

    if (search) {
      q = q.ilike("name", `%${search}%`);
    }

    const { data, error } = await q.order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        error?.message || `Item with ID ${id} not found`,
      );
    }
    return data;
  }

  async create(
    orgId: string,
    dto: CreateItemDto,
  ): Promise<Record<string, unknown>> {
    let nutrition_macros = dto.nutrition_macros || {};
    let fdc_id = dto.fdc_id;
    let allergens = [...(dto.allergens || [])];
    let is_animal_product = dto.is_animal_product ?? false;
    let is_meat = dto.is_meat ?? false;
    let is_seafood = dto.is_seafood ?? false;
    let is_dairy = dto.is_dairy ?? false;
    let is_egg = dto.is_egg ?? false;
    let is_gluten_source = dto.is_gluten_source ?? false;

    if (
      !fdc_id &&
      (!dto.category || dto.category.toUpperCase() === "INGREDIENT")
    ) {
      try {
        const match = await this.usdaResolverService.resolveIngredient(
          dto.name,
        );
        if (match) {
          nutrition_macros = match;
          fdc_id = match.fdc_id;

          const classified = classifyItemDietAndAllergens(
            dto.name,
            match.fdc_food_name || "",
            allergens,
            {
              is_dairy,
              is_egg,
              is_gluten_source,
              is_seafood,
              is_meat,
              is_animal_product,
            },
          );

          is_dairy = classified.is_dairy;
          is_egg = classified.is_egg;
          is_gluten_source = classified.is_gluten_source;
          is_seafood = classified.is_seafood;
          is_meat = classified.is_meat;
          is_animal_product = classified.is_animal_product;
          allergens = classified.allergens;
        }
      } catch (err) {
        console.error("Failed to auto-resolve USDA data for item:", err);
      }
    }

    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          organization_id: orgId,
          name: dto.name,
          category: dto.category || "INGREDIENT",
          purchase_unit: dto.purchase_unit || "LB",
          units_per_case: dto.units_per_case,
          each_weight_g: dto.each_weight_g,
          density_g_ml: dto.density_g_ml ?? 1.0,
          shelf_life_days: dto.shelf_life_days,
          allergens,
          is_animal_product,
          is_meat,
          is_seafood,
          is_dairy,
          is_egg,
          is_gluten_source,
          fdc_id,
          nutrition_macros,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(
    id: string,
    dto: UpdateItemDto,
  ): Promise<Record<string, unknown>> {
    const existing = await this.findOne(id);
    const existingName = existing.name as string;

    let nutrition_macros =
      dto.nutrition_macros || existing.nutrition_macros || {};
    let fdc_id = dto.fdc_id !== undefined ? dto.fdc_id : existing.fdc_id;
    let allergens = dto.allergens
      ? [...dto.allergens]
      : [...((existing.allergens as string[]) || [])];
    let is_animal_product =
      dto.is_animal_product ?? (existing.is_animal_product as boolean);
    let is_meat = dto.is_meat ?? (existing.is_meat as boolean);
    let is_seafood = dto.is_seafood ?? (existing.is_seafood as boolean);
    let is_dairy = dto.is_dairy ?? (existing.is_dairy as boolean);
    let is_egg = dto.is_egg ?? (existing.is_egg as boolean);
    let is_gluten_source =
      dto.is_gluten_source ?? (existing.is_gluten_source as boolean);
    const category =
      dto.category || (existing.category as string) || "INGREDIENT";
    const name = dto.name || existingName;

    const nameChanged = dto.name && dto.name !== existingName;
    const forceSync = dto.force_usda_sync === true;

    if (
      forceSync ||
      (nameChanged &&
        !dto.fdc_id &&
        (!category || category.toString().toUpperCase() === "INGREDIENT"))
    ) {
      try {
        const queryName = forceSync && dto.usda_query ? dto.usda_query : name;
        const match =
          await this.usdaResolverService.resolveIngredient(queryName);
        if (match) {
          nutrition_macros = match;
          fdc_id = match.fdc_id;

          const classified = classifyItemDietAndAllergens(
            name,
            match.fdc_food_name || "",
            allergens,
            {
              is_dairy,
              is_egg,
              is_gluten_source,
              is_seafood,
              is_meat,
              is_animal_product,
            },
          );

          is_dairy = classified.is_dairy;
          is_egg = classified.is_egg;
          is_gluten_source = classified.is_gluten_source;
          is_seafood = classified.is_seafood;
          is_meat = classified.is_meat;
          is_animal_product = classified.is_animal_product;
          allergens = classified.allergens;
        }
      } catch (err) {
        console.error("Failed to auto-resolve USDA data on update:", err);
      }
    }

    const payload = { ...dto };
    delete payload.force_usda_sync;
    delete payload.usda_query;

    const { data, error } = await supabase
      .from("items")
      .update({
        ...payload,
        fdc_id,
        nutrition_macros,
        allergens,
        is_animal_product,
        is_meat,
        is_seafood,
        is_dairy,
        is_egg,
        is_gluten_source,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
