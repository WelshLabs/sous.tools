import { ObjectType, Field, ID, Float, Int, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class ItemGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  purchase_unit?: string;

  @Field(() => Float, { nullable: true })
  units_per_case?: number;

  @Field(() => Float, { nullable: true })
  each_weight_g?: number;

  @Field(() => Float, { nullable: true })
  density_g_ml?: number;

  @Field(() => Int, { nullable: true })
  shelf_life_days?: number;

  @Field(() => [String], { nullable: true })
  allergens?: string[];

  @Field(() => Boolean, { nullable: true })
  is_animal_product?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_meat?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_seafood?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_dairy?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_egg?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_gluten_source?: boolean;

  @Field(() => Float, { nullable: true })
  current_cost_per_g?: number;

  @Field(() => String, { nullable: true })
  fdc_id?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  nutrition_macros?: any;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@InputType()
export class CreateItemInputGQL {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  purchase_unit?: string;

  @Field(() => Float, { nullable: true })
  units_per_case?: number;

  @Field(() => Float, { nullable: true })
  each_weight_g?: number;

  @Field(() => Float, { nullable: true })
  density_g_ml?: number;

  @Field(() => Int, { nullable: true })
  shelf_life_days?: number;

  @Field(() => [String], { nullable: true })
  allergens?: string[];

  @Field(() => Boolean, { nullable: true })
  is_animal_product?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_meat?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_seafood?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_dairy?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_egg?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_gluten_source?: boolean;

  @Field(() => String, { nullable: true })
  fdc_id?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  nutrition_macros?: any;
}

@InputType()
export class UpdateItemInputGQL {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  purchase_unit?: string;

  @Field(() => Float, { nullable: true })
  units_per_case?: number;

  @Field(() => Float, { nullable: true })
  each_weight_g?: number;

  @Field(() => Float, { nullable: true })
  density_g_ml?: number;

  @Field(() => Int, { nullable: true })
  shelf_life_days?: number;

  @Field(() => [String], { nullable: true })
  allergens?: string[];

  @Field(() => Boolean, { nullable: true })
  is_animal_product?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_meat?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_seafood?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_dairy?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_egg?: boolean;

  @Field(() => Boolean, { nullable: true })
  is_gluten_source?: boolean;

  @Field(() => String, { nullable: true })
  fdc_id?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  nutrition_macros?: any;

  @Field(() => Boolean, { nullable: true })
  force_usda_sync?: boolean;

  @Field(() => String, { nullable: true })
  usda_query?: string;
}

@ObjectType()
export class VendorGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  rep_name?: string;

  @Field(() => String, { nullable: true })
  rep_phone?: string;

  @Field(() => String, { nullable: true })
  rep_email?: string;

  @Field(() => String, { nullable: true })
  order_method?: string;

  @Field(() => String, { nullable: true })
  cutoff_time?: string;

  @Field(() => Float, { nullable: true })
  minimum_order?: number;

  @Field(() => [String], { nullable: true })
  delivery_days?: string[];

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@InputType()
export class CreateVendorInputGQL {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  rep_name?: string;

  @Field(() => String, { nullable: true })
  rep_phone?: string;

  @Field(() => String, { nullable: true })
  rep_email?: string;

  @Field(() => String, { nullable: true })
  order_method?: string;

  @Field(() => String, { nullable: true })
  cutoff_time?: string;

  @Field(() => Float, { nullable: true })
  minimum_order?: number;

  @Field(() => [String], { nullable: true })
  delivery_days?: string[];
}

@InputType()
export class UpdateVendorInputGQL {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  rep_name?: string;

  @Field(() => String, { nullable: true })
  rep_phone?: string;

  @Field(() => String, { nullable: true })
  rep_email?: string;

  @Field(() => String, { nullable: true })
  order_method?: string;

  @Field(() => String, { nullable: true })
  cutoff_time?: string;

  @Field(() => Float, { nullable: true })
  minimum_order?: number;

  @Field(() => [String], { nullable: true })
  delivery_days?: string[];
}

@ObjectType()
export class WhiteboardItemGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => ID, { nullable: true })
  item_id?: string;

  @Field(() => String, { nullable: true })
  custom_name?: string;

  @Field(() => Float, { nullable: true })
  quantity?: number;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => ID, { nullable: true })
  suggested_vendor_id?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => ID, { nullable: true })
  created_by?: string;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;

  @Field(() => ItemGQL, { nullable: true })
  items?: ItemGQL;

  @Field(() => VendorGQL, { nullable: true })
  vendors?: VendorGQL;
}

@InputType()
export class CreateWhiteboardInputGQL {
  @Field(() => ID, { nullable: true })
  item_id?: string;

  @Field(() => String, { nullable: true })
  custom_name?: string;

  @Field(() => Float, { nullable: true })
  quantity?: number;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => ID, { nullable: true })
  suggested_vendor_id?: string;
}

@InputType()
export class UpdateWhiteboardInputGQL {
  @Field(() => Float, { nullable: true })
  quantity?: number;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => ID, { nullable: true })
  suggested_vendor_id?: string;

  @Field(() => String, { nullable: true })
  status?: string;
}

@ObjectType()
export class PurchaseOrderItemGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  po_id!: string;

  @Field(() => ID, { nullable: true })
  item_id?: string;

  @Field(() => String, { nullable: true })
  custom_name?: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => Float, { nullable: true })
  unit_price?: number;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => ItemGQL, { nullable: true })
  items?: ItemGQL;
}

@ObjectType()
export class PurchaseOrderGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => ID)
  vendor_id!: string;

  @Field(() => String)
  status!: string;

  @Field(() => Float, { nullable: true })
  total_amount?: number;

  @Field(() => String, { nullable: true })
  order_date?: string;

  @Field(() => String, { nullable: true })
  delivery_date?: string;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;

  @Field(() => VendorGQL, { nullable: true })
  vendors?: VendorGQL;

  @Field(() => [PurchaseOrderItemGQL], { nullable: true })
  purchase_order_items?: PurchaseOrderItemGQL[];
}

@InputType()
export class PurchaseOrderItemInputGQL {
  @Field(() => ID, { nullable: true })
  item_id?: string;

  @Field(() => String, { nullable: true })
  custom_name?: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => Float, { nullable: true })
  unit_price?: number;
}

@InputType()
export class CreatePurchaseOrderInputGQL {
  @Field(() => ID)
  vendor_id!: string;

  @Field(() => [PurchaseOrderItemInputGQL])
  items!: PurchaseOrderItemInputGQL[];

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  delivery_date?: string;
}

@InputType()
export class UpdatePurchaseOrderInputGQL {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  delivery_date?: string;

  @Field(() => Float, { nullable: true })
  total_amount?: number;
}

@ObjectType()
export class InventoryOnHandGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => ID)
  item_id!: string;

  @Field(() => Float)
  quantity_on_hand!: number;

  @Field(() => String, { nullable: true })
  storage_location?: string;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;

  @Field(() => ItemGQL, { nullable: true })
  items?: ItemGQL;
}

@ObjectType()
export class ParSuggestionGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => ID)
  item_id!: string;

  @Field(() => Float)
  suggested_par_level!: number;

  @Field(() => Float, { nullable: true })
  current_par_level?: number;

  @Field(() => Float, { nullable: true })
  sales_velocity_30d?: number;

  @Field(() => Float, { nullable: true })
  confidence_score?: number;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;

  @Field(() => ItemGQL, { nullable: true })
  items?: ItemGQL;
}

@InputType()
export class ReconcileInventoryInputGQL {
  @Field(() => ID)
  item_id!: string;

  @Field(() => Float)
  physical_count!: number;

  @Field(() => String, { nullable: true })
  storage_location?: string;
}

@ObjectType()
export class PriceHistoryGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  item_id!: string;

  @Field(() => ID)
  vendor_id!: string;

  @Field(() => Float)
  unit_cost!: number;

  @Field(() => String)
  purchase_unit!: string;

  @Field(() => String)
  effective_date!: string;

  @Field(() => String, { nullable: true })
  created_at?: string;
}

@ObjectType()
export class WastageLogGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => ID, { nullable: true })
  item_id?: string;

  @Field(() => ID, { nullable: true })
  recipe_id?: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => ItemGQL, { nullable: true })
  items?: ItemGQL;
}

@InputType()
export class CreateWastageInputGQL {
  @Field(() => ID, { nullable: true })
  item_id?: string;

  @Field(() => ID, { nullable: true })
  recipe_id?: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => String, { nullable: true })
  reason?: string;
}
