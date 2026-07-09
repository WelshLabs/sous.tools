import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';
import { type UsdaResolverService } from '../nutrition/usda-resolver.service';

export interface CreateItemDto {
  name: string;
  category?: string;
  purchase_unit?: string;
  units_per_case?: number;
  each_weight_g?: number | null;
  density_g_ml?: number;
  shelf_life_days?: number;
  allergens?: string[];
  is_animal_product?: boolean;
  is_meat?: boolean;
  is_seafood?: boolean;
  is_dairy?: boolean;
  is_egg?: boolean;
  is_gluten_source?: boolean;
  fdc_id?: number;
  nutrition_macros?: Record<string, unknown>;
}

export type UpdateItemDto = Partial<CreateItemDto> & { force_usda_sync?: boolean; usda_query?: string };

@Injectable()
export class ItemsService {
  constructor(
    private readonly usdaResolverService: UsdaResolverService,
  ) {}

  async findAll(orgId: string, search?: string): Promise<Record<string, unknown>[]> {
    let q = supabase
      .from('items')
      .select('*')
      .eq('organization_id', orgId);

    if (search) {
      q = q.ilike('name', `%${search}%`);
    }

    const { data, error } = await q.order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(error?.message || `Item with ID ${id} not found`);
    }
    return data;
  }

  async create(orgId: string, dto: CreateItemDto): Promise<Record<string, unknown>> {
    let nutrition_macros = dto.nutrition_macros || {};
    let fdc_id = dto.fdc_id;
    const allergens = [...(dto.allergens || [])];
    let is_animal_product = dto.is_animal_product ?? false;
    let is_meat = dto.is_meat ?? false;
    let is_seafood = dto.is_seafood ?? false;
    let is_dairy = dto.is_dairy ?? false;
    let is_egg = dto.is_egg ?? false;
    let is_gluten_source = dto.is_gluten_source ?? false;

    if (!fdc_id && (!dto.category || dto.category.toUpperCase() === 'INGREDIENT')) {
      try {
        const match = await this.usdaResolverService.resolveIngredient(dto.name);
        if (match) {
          nutrition_macros = match;
          fdc_id = match.fdc_id;
          
          const fullName = `${dto.name.toLowerCase()} ${(match.fdc_food_name || "").toLowerCase()}`;
          
          if (fullName.match(/milk|cheese|butter|cream|whey|yogurt/)) {
             is_dairy = true; is_animal_product = true;
             if (!allergens.includes("dairy")) allergens.push("dairy");
          }
          if (fullName.match(/egg|mayo/)) {
             is_egg = true; is_animal_product = true;
             if (!allergens.includes("egg")) allergens.push("egg");
          }
          if (fullName.match(/wheat|flour|bread|pasta|cracker|dough/)) {
             is_gluten_source = true;
             if (!allergens.includes("wheat")) allergens.push("wheat");
          }
          if (fullName.match(/peanut/)) {
             if (!allergens.includes("peanuts")) allergens.push("peanuts");
          }
          if (fullName.match(/almond|walnut|pecan|cashew|pistachio|macadamia|hazelnut/)) {
             if (!allergens.includes("tree_nuts")) allergens.push("tree_nuts");
          }
          if (fullName.match(/soy|edamame|tofu|tempeh/)) {
             if (!allergens.includes("soy")) allergens.push("soy");
          }
          if (fullName.match(/fish|salmon|tuna|cod|tilapia|halibut|trout/)) {
             is_seafood = true; is_animal_product = true;
             if (!allergens.includes("fish")) allergens.push("fish");
          }
          if (fullName.match(/shrimp|crab|lobster|shellfish|clam|oyster/)) {
             is_seafood = true; is_animal_product = true;
             if (!allergens.includes("shellfish")) allergens.push("shellfish");
          }
          if (fullName.match(/beef|pork|chicken|turkey|lamb|bacon|sausage|meat|steak|veal/)) {
             is_meat = true; is_animal_product = true;
          }
        }
      } catch (err) {
        console.error("Failed to auto-resolve USDA data for item:", err);
      }
    }

    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          organization_id: orgId,
          name: dto.name,
          category: dto.category || 'INGREDIENT',
          purchase_unit: dto.purchase_unit || 'LB',
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

  async update(id: string, dto: UpdateItemDto): Promise<Record<string, unknown>> {
    const existing = await this.findOne(id);
    const existingName = existing.name as string;

    let nutrition_macros = dto.nutrition_macros || existing.nutrition_macros || {};
    let fdc_id = dto.fdc_id !== undefined ? dto.fdc_id : existing.fdc_id;
    const allergens = dto.allergens ? [...dto.allergens] : [...((existing.allergens as string[]) || [])];
    let is_animal_product = dto.is_animal_product ?? existing.is_animal_product;
    let is_meat = dto.is_meat ?? existing.is_meat;
    let is_seafood = dto.is_seafood ?? existing.is_seafood;
    let is_dairy = dto.is_dairy ?? existing.is_dairy;
    let is_egg = dto.is_egg ?? existing.is_egg;
    let is_gluten_source = dto.is_gluten_source ?? existing.is_gluten_source;
    const category = dto.category || existing.category || 'INGREDIENT';
    const name = dto.name || existingName;

    const nameChanged = dto.name && dto.name !== existingName;
    const forceSync = dto.force_usda_sync === true;

    if (forceSync || (nameChanged && !dto.fdc_id && (!category || category.toString().toUpperCase() === 'INGREDIENT'))) {
      try {
        const queryName = forceSync && dto.usda_query ? dto.usda_query : name;
        const match = await this.usdaResolverService.resolveIngredient(queryName);
        if (match) {
          nutrition_macros = match;
          fdc_id = match.fdc_id;
          
          const fullName = `${name.toLowerCase()} ${(match.fdc_food_name || "").toLowerCase()}`;
          
          if (fullName.match(/milk|cheese|butter|cream|whey|yogurt/)) {
             is_dairy = true; is_animal_product = true;
             if (!allergens.includes("dairy")) allergens.push("dairy");
          }
          if (fullName.match(/egg|mayo/)) {
             is_egg = true; is_animal_product = true;
             if (!allergens.includes("egg")) allergens.push("egg");
          }
          if (fullName.match(/wheat|flour|bread|pasta|cracker|dough/)) {
             is_gluten_source = true;
             if (!allergens.includes("wheat")) allergens.push("wheat");
          }
          if (fullName.match(/peanut/)) {
             if (!allergens.includes("peanuts")) allergens.push("peanuts");
          }
          if (fullName.match(/almond|walnut|pecan|cashew|pistachio|macadamia|hazelnut/)) {
             if (!allergens.includes("tree_nuts")) allergens.push("tree_nuts");
          }
          if (fullName.match(/soy|edamame|tofu|tempeh/)) {
             if (!allergens.includes("soy")) allergens.push("soy");
          }
          if (fullName.match(/fish|salmon|tuna|cod|tilapia|halibut|trout/)) {
             is_seafood = true; is_animal_product = true;
             if (!allergens.includes("fish")) allergens.push("fish");
          }
          if (fullName.match(/shrimp|crab|lobster|shellfish|clam|oyster/)) {
             is_seafood = true; is_animal_product = true;
             if (!allergens.includes("shellfish")) allergens.push("shellfish");
          }
          if (fullName.match(/beef|pork|chicken|turkey|lamb|bacon|sausage|meat|steak|veal/)) {
             is_meat = true; is_animal_product = true;
          }
        }
      } catch (err) {
        console.error("Failed to auto-resolve USDA data on update:", err);
      }
    }

    const payload = { ...dto };
    delete payload.force_usda_sync;
    delete payload.usda_query;

    const { data, error } = await supabase
      .from('items')
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
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
