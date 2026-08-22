import { ObjectType, Field, ID, Float, Int, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class PosModifierOptionGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  modifier_group_id?: string;

  @Field(() => String)
  name!: string;

  @Field(() => Float, { nullable: true })
  price_delta?: number;

  @Field(() => Boolean, { nullable: true })
  is_default?: boolean;

  @Field(() => String, { nullable: true })
  created_at?: string;
}

@ObjectType()
export class PosModifierGroupGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => String)
  name!: string;

  @Field(() => Int, { nullable: true })
  min_selections?: number;

  @Field(() => Int, { nullable: true })
  max_selections?: number;

  @Field(() => Boolean, { nullable: true })
  is_required?: boolean;

  @Field(() => [PosModifierOptionGQL], { nullable: true })
  pos_modifier_options?: PosModifierOptionGQL[];
}

@ObjectType()
export class PosItemGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => ID, { nullable: true })
  category_id?: string;

  @Field(() => String)
  name!: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => String, { nullable: true })
  square_id?: string;

  @Field(() => Boolean, { nullable: true })
  is_sold_out?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  pos_item_modifier_groups?: any;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@ObjectType()
export class PosCategoryGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => Int, { nullable: true })
  sort_order?: number;
}

@ObjectType()
export class PosDiscountGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;
}

@ObjectType()
export class PosCatalogPayloadGQL {
  @Field(() => [PosItemGQL])
  items!: PosItemGQL[];

  @Field(() => [PosCategoryGQL])
  categories!: PosCategoryGQL[];

  @Field(() => [PosModifierGroupGQL])
  modifierGroups!: PosModifierGroupGQL[];

  @Field(() => [PosDiscountGQL])
  discounts!: PosDiscountGQL[];
}

@ObjectType()
export class PosOrderLineItemGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  pos_order_id?: string;

  @Field(() => ID, { nullable: true })
  pos_item_id?: string;

  @Field(() => String)
  name!: string;

  @Field(() => Float, { nullable: true })
  quantity?: number;

  @Field(() => Float, { nullable: true })
  unit_price?: number;

  @Field(() => Float, { nullable: true })
  total_price?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  modifiers?: any;

  @Field(() => String, { nullable: true })
  created_at?: string;
}

@ObjectType()
export class PosOrderGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => String, { nullable: true })
  order_number?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => Float, { nullable: true })
  total_money?: number;

  @Field(() => String, { nullable: true })
  customer_name?: string;

  @Field(() => String, { nullable: true })
  closed_at?: string;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;

  @Field(() => [PosOrderLineItemGQL], { nullable: true })
  pos_order_line_items?: PosOrderLineItemGQL[];
}

@ObjectType()
export class PosTransactionGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => ID, { nullable: true })
  pos_item_id?: string;

  @Field(() => Float, { nullable: true })
  quantity_sold?: number;

  @Field(() => Float, { nullable: true })
  gross_revenue?: number;

  @Field(() => String, { nullable: true })
  transaction_time?: string;

  @Field(() => String, { nullable: true })
  source?: string;

  @Field(() => PosItemGQL, { nullable: true })
  pos_items?: PosItemGQL;
}

@InputType()
export class BulkTransactionInputGQL {
  @Field(() => ID, { nullable: true })
  pos_item_id?: string;

  @Field(() => Float)
  quantity_sold!: number;

  @Field(() => Float)
  gross_revenue!: number;

  @Field(() => String)
  transaction_time!: string;

  @Field(() => String, { nullable: true })
  source?: string;
}
