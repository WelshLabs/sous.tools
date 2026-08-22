import { ObjectType, Field, ID, Float } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class RecipeNutritionPayloadGQL {
  @Field(() => ID)
  recipeId!: string;

  @Field(() => Float, { nullable: true })
  servings?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  perServingNutrition?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  per100gNutrition?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  dietaryFlags?: any;

  @Field(() => String, { nullable: true })
  computedAt?: string;
}
